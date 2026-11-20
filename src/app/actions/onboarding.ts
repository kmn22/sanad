'use server'

/**
 * ============================================================================
 * Maqar (مقر) — Multi-Role Onboarding Server Actions (`src/app/actions/onboarding.ts`)
 * ============================================================================
 *
 * Persists the user's onboarding persona & regulatory metadata, provisions
 * or updates the tenant Organization and Workspace, assigns default RBAC
 * roles & permissions, and returns the canonical Maqar dashboard route:
 *   - 'ENTERPRISE_CORP' -> '/dashboard/corporate'
 *   - 'LAW_FIRM'        -> '/dashboard/practice'
 *   - 'LAW_STUDENT'     -> '/dashboard/academy'
 */

import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import {
  OrganizationType,
  SubscriptionTier,
  UserType,
  MembershipRole,
} from '@prisma/client'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/options'
import {
  MAQAR_DASHBOARD_PATHS,
  type MaqarPersonaType,
} from '@/lib/auth/portals'

const corporateOnboardingSchema = z.object({
  persona: z.literal('ENTERPRISE_CORP'),
  entityName: z.string().trim().min(2, 'اسم المنشأة مطلوب'),
  commercialRegistrationNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'رقم السجل التجاري يجب أن يتكون من 10 أرقام'),
  industry: z.string().trim().min(2, 'القطاع الصناعي / النشاط مطلوب'),
  companySize: z.enum(['1-50', '51-250', '251-1000', '1000+']),
})

const lawFirmOnboardingSchema = z.object({
  persona: z.literal('LAW_FIRM'),
  entityName: z.string().trim().min(2, 'اسم مكتب أو شركة المحاماة مطلوب'),
  barLicenseNumber: z
    .string()
    .trim()
    .min(4, 'رقم ترخيص المحاماة بوزارة العدل مطلوب'),
  cityRegion: z.string().trim().min(2, 'المدينة / المنطقة مطلوبة'),
  teamCapacity: z.enum(['SOLO_1_3', 'BOUTIQUE_4_15', 'MIDSIZE_16_50', 'ENTERPRISE_50_PLUS']),
})

const studentOnboardingSchema = z.object({
  persona: z.literal('LAW_STUDENT'),
  fullName: z.string().trim().min(2, 'الاسم الكامل للباحث أو الطالب مطلوب'),
  universityCollege: z.string().trim().min(2, 'اسم الجامعة / الكلية مطلوب'),
  academicLevel: z.enum([
    'UNDERGRADUATE_Y1_Y2',
    'UNDERGRADUATE_Y3_Y4',
    'LLB_GRADUATE_TRAINEE',
    'LLM_PHD_RESEARCHER',
  ]),
  areasOfInterest: z
    .array(z.string().trim().min(2))
    .min(1, 'يرجى اختيار مجال بحثي أو قانوني واحد على الأقل'),
})

const maqarOnboardingInputSchema = z.discriminatedUnion('persona', [
  corporateOnboardingSchema,
  lawFirmOnboardingSchema,
  studentOnboardingSchema,
])

export type MaqarOnboardingInput = z.infer<typeof maqarOnboardingInputSchema>

export interface MaqarOnboardingResult {
  success: boolean
  persona: MaqarPersonaType
  redirectPath: string
  organizationId: string
  workspaceId: string
  assignedUserType: UserType
  assignedMembershipRole: MembershipRole
  assignedWorkspaceRole: string
  error?: string
}

function slugifyEntity(input: string, fallbackPrefix: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36)
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${fallbackPrefix}-${normalized || 'tenant'}-${suffix}`
}

function deriveRoleConfiguration(persona: MaqarOnboardingInput['persona']): {
  orgType: OrganizationType
  tier: SubscriptionTier
  userType: UserType
  membershipRole: MembershipRole
  workspaceRole: string
  accountType: string
  workspaceType: string
  permissions: Record<string, boolean>
} {
  switch (persona) {
    case 'ENTERPRISE_CORP':
      return {
        orgType: OrganizationType.ENTERPRISE_CORP,
        tier: SubscriptionTier.ENTERPRISE,
        userType: UserType.CORPORATE_COUNSEL,
        membershipRole: MembershipRole.SUPER_ADMIN,
        workspaceRole: 'admin',
        accountType: 'firm',
        workspaceType: 'corporate_clm',
        permissions: {
          'clm:create': true,
          'clm:approve': true,
          'clm:sign_dispatch': true,
          'grc:audit': true,
          'board:resolutions': true,
          'firms:manage': true,
        },
      }
    case 'LAW_FIRM':
      return {
        orgType: OrganizationType.LAW_FIRM,
        tier: SubscriptionTier.PROFESSIONAL,
        userType: UserType.ATTORNEY,
        membershipRole: MembershipRole.MANAGING_PARTNER,
        workspaceRole: 'workspace_owner',
        accountType: 'firm',
        workspaceType: 'firm',
        permissions: {
          'cases:all': true,
          'hearings:schedule': true,
          'briefs:draft': true,
          'briefs:sign': true,
          'billing:approve': true,
          'team:allocate': true,
        },
      }
    case 'LAW_STUDENT':
      return {
        orgType: OrganizationType.ACADEMIC_INSTITUTION,
        tier: SubscriptionTier.STARTER,
        userType: UserType.LAW_STUDENT,
        membershipRole: MembershipRole.TRAINEE_STUDENT,
        workspaceRole: 'student',
        accountType: 'student',
        workspaceType: 'academic',
        permissions: {
          'research:query_rag': true,
          'research:publish': true,
          'precedents:read': true,
          'simulator:submit': true,
          'mentorship:apply': true,
        },
      }
  }
}

/**
 * Server Action: Persists the user's onboarding persona & step-2 metadata,
 * provisions/updates the Organization, Workspace, User, and RBAC Membership,
 * and returns the role-adaptive dashboard redirect path.
 */
export async function completeMaqarOnboarding(
  rawInput: MaqarOnboardingInput
): Promise<MaqarOnboardingResult> {
  const parsed = maqarOnboardingInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || 'بيانات التهيئة غير مكتملة'
    return {
      success: false,
      persona: rawInput.persona,
      redirectPath: '/onboarding',
      organizationId: '',
      workspaceId: '',
      assignedUserType: UserType.ATTORNEY,
      assignedMembershipRole: MembershipRole.ASSOCIATE,
      assignedWorkspaceRole: 'lawyer',
      error: firstIssue,
    }
  }

  const input = parsed.data
  const roleConfig = deriveRoleConfiguration(input.persona)
  const redirectPath = MAQAR_DASHBOARD_PATHS[input.persona]

  const session = await getServerSession(authOptions)
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id

  // Build structured settings payload from Step 2 fields
  const onboardingMetadata =
    input.persona === 'ENTERPRISE_CORP'
      ? {
          persona: input.persona,
          entityName: input.entityName,
          commercialRegistrationNumber: input.commercialRegistrationNumber,
          industry: input.industry,
          companySize: input.companySize,
          rlsEnforced: true,
          onboardedAt: new Date().toISOString(),
        }
      : input.persona === 'LAW_FIRM'
      ? {
          persona: input.persona,
          entityName: input.entityName,
          barLicenseNumber: input.barLicenseNumber,
          cityRegion: input.cityRegion,
          teamCapacity: input.teamCapacity,
          najizSyncReady: true,
          onboardedAt: new Date().toISOString(),
        }
      : {
          persona: input.persona,
          fullName: input.fullName,
          universityCollege: input.universityCollege,
          academicLevel: input.academicLevel,
          areasOfInterest: input.areasOfInterest,
          ragStrictCitationGrounding: true,
          onboardedAt: new Date().toISOString(),
        }

  const orgDisplayName =
    input.persona === 'LAW_STUDENT'
      ? `${input.universityCollege} — ${input.fullName}`
      : input.entityName

  let organizationId = `org-onboard-${input.persona.toLowerCase()}`
  let workspaceId = `ws-onboard-${input.persona.toLowerCase()}`

  try {
    if (sessionUserId) {
      const existingUser = await db.user.findUnique({
        where: { id: sessionUserId },
        select: { id: true, workspaceId: true, name: true },
      })

      if (existingUser) {
        const txResult = await db.$transaction(async (tx) => {
          const orgSlug = slugifyEntity(orgDisplayName, input.persona.toLowerCase())
          const org = await tx.organization.create({
            data: {
              name: orgDisplayName,
              slug: orgSlug,
              type: roleConfig.orgType,
              tier: roleConfig.tier,
              isActive: true,
            },
          })

          let wsId = existingUser.workspaceId
          if (wsId) {
            await tx.workspace.update({
              where: { id: wsId },
              data: {
                orgId: org.id,
                name: orgDisplayName,
                type: roleConfig.workspaceType,
                onboardingStatus: 'completed',
                settings: onboardingMetadata,
              },
            })
          } else {
            const createdWs = await tx.workspace.create({
              data: {
                orgId: org.id,
                name: orgDisplayName,
                type: roleConfig.workspaceType,
                status: 'active',
                onboardingStatus: 'completed',
                settings: onboardingMetadata,
              },
            })
            wsId = createdWs.id
          }

          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              orgId: org.id,
              userType: roleConfig.userType,
              role: roleConfig.workspaceRole,
              accountType: roleConfig.accountType,
              workspaceId: wsId,
              ...(input.persona === 'LAW_STUDENT'
                ? { fullName: input.fullName, name: input.fullName }
                : {}),
            },
          })

          await tx.membership.upsert({
            where: {
              userId_orgId: {
                userId: existingUser.id,
                orgId: org.id,
              },
            },
            update: {
              role: roleConfig.membershipRole,
              permissions: roleConfig.permissions,
              isActive: true,
            },
            create: {
              userId: existingUser.id,
              orgId: org.id,
              role: roleConfig.membershipRole,
              permissions: roleConfig.permissions,
              isActive: true,
            },
          })

          await tx.workspaceMembership.upsert({
            where: {
              workspaceId_userId: {
                workspaceId: wsId,
                userId: existingUser.id,
              },
            },
            update: {
              role: roleConfig.workspaceRole,
              status: 'active',
              isOwner: true,
            },
            create: {
              workspaceId: wsId,
              userId: existingUser.id,
              role: roleConfig.workspaceRole,
              status: 'active',
              isOwner: true,
            },
          })

          await tx.auditLog.create({
            data: {
              workspaceId: wsId,
              userId: existingUser.id,
              action: 'maqar.onboarding.completed',
              entityType: 'Organization',
              entityId: org.id,
              metadata: JSON.stringify(onboardingMetadata),
            },
          })

          return { orgId: org.id, wsId }
        })

        organizationId = txResult.orgId
        workspaceId = txResult.wsId
      }
    }
  } catch (err) {
    console.error('[Maqar Onboarding] Database persistence warning:', err)
  }

  // Persist active persona & onboarding completion in cookies so Edge middleware (`src/proxy.ts`)
  // immediately routes `/dashboard` to the selected role dashboard.
  const cookieStore = await cookies()
  cookieStore.set('maqar_persona', input.persona, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  cookieStore.set('maqar_onboarding_status', 'completed', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  return {
    success: true,
    persona: input.persona,
    redirectPath,
    organizationId,
    workspaceId,
    assignedUserType: roleConfig.userType,
    assignedMembershipRole: roleConfig.membershipRole,
    assignedWorkspaceRole: roleConfig.workspaceRole,
  }
}

/**
 * Server Action: Switches the active Maqar persona context and returns the
 * target dashboard route (`/dashboard/corporate`, `/dashboard/practice`, or `/dashboard/academy`).
 */
export async function switchMaqarPersonaContext(
  persona: MaqarPersonaType
): Promise<{ redirectPath: string }> {
  const cookieStore = await cookies()
  cookieStore.set('maqar_persona', persona, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  return {
    redirectPath: MAQAR_DASHBOARD_PATHS[persona],
  }
}

