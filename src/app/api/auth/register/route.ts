import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, isStrongPassword } from '@/lib/auth/password'
import { expiresIn, generateToken, hashToken, TOKEN_TTL } from '@/lib/auth/tokens'
import { homePathFor } from '@/lib/auth/portals'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { PRIVACY_NOTICE_VERSION, privacyNoticeHash } from '@/lib/compliance'
import { isAcademicEmail, getAcademicInstitutionName } from '@/lib/auth/academic'
import { logError } from '@/lib/observability'

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip')?.trim() || 'unknown'
}

// Self-service account types → the workspace + role they get.
const ACCOUNT_TYPES = {
  student: { role: 'student', workspaceType: 'academic' },
  lawyer: { role: 'lawyer', workspaceType: 'solo' },
  firm: { role: 'workspace_owner', workspaceType: 'firm' },
} as const
type AccountType = keyof typeof ACCOUNT_TYPES

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (ip !== 'unknown' && !(await rateLimit(`register:ip:${ip}`, 10, 15 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 })
    }

    const { name, email, password, inviteToken, privacyNoticeVersion, acceptPrivacy, accountType, organizationName } = await req.json()
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 })
    }
    const cleanEmail = email.toLowerCase().trim()
    if (!(await rateLimit(`register:email:${cleanEmail}`, 3, 60 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'Too many registration attempts for this email. Please try again later.' }, { status: 429 })
    }
    // Delegated so the policy lives in exactly one place (@/lib/auth/password).
    if (typeof password !== 'string' || !isStrongPassword(password)) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 12 خانة على الأقل وتحتوي على حروف وأرقام' }, { status: 400 })
    }
    if (acceptPrivacy !== true || privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return NextResponse.json({ error: 'Current privacy notice acceptance is required' }, { status: 400 })
    }
    const displayName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : cleanEmail.split('@')[0]
    const userAgent = req.headers.get('user-agent')?.slice(0, 500)

    if (await db.user.findUnique({ where: { email: cleanEmail }, select: { id: true } })) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل بالفعل.' }, { status: 409 })
    }

    /* ── Path A: invitation (team member or client) ─────────────────── */
    if (typeof inviteToken === 'string' && inviteToken) {
      if (!/^[a-f0-9]{64}$/i.test(inviteToken)) {
        return NextResponse.json({ error: 'A valid invitation is required' }, { status: 403 })
      }
      const invitation = await db.invitation.findUnique({ where: { tokenHash: hashToken(inviteToken) } })
      if (!invitation || invitation.email.toLowerCase() !== cleanEmail || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
        return NextResponse.json({ error: 'Invitation is invalid or expired' }, { status: 403 })
      }
      // A client invitation must point at a client of the same workspace.
      let clientId: string | null = null
      if (invitation.role === 'client') {
        const client = invitation.clientId
          ? await db.client.findFirst({ where: { id: invitation.clientId, workspaceId: invitation.workspaceId }, select: { id: true } })
          : null
        if (!client) return NextResponse.json({ error: 'Invitation is invalid or expired' }, { status: 403 })
        clientId = client.id
      }

      const newUser = await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: cleanEmail,
            name: displayName,
            password: hashPassword(password),
            role: invitation.role,
            workspaceId: invitation.workspaceId,
            clientId,
            emailVerified: new Date(), // the invite link already proved mailbox ownership
            privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
          },
        })
        await tx.workspaceMembership.create({
          data: { workspaceId: invitation.workspaceId, userId: user.id, role: invitation.role, status: 'active' },
        })
        await tx.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } })
        await recordPrivacyAcceptance(tx, user.id, ip, userAgent)
        await tx.auditLog.create({
          data: { workspaceId: invitation.workspaceId, userId: user.id, action: 'auth.register', entityType: 'User', entityId: user.id, ipAddress: ip },
        })
        await tx.notification.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            type: 'system',
            title: 'مرحباً بك في سند',
            message: invitation.role === 'client' ? 'اكتمل إعداد حسابك في بوابة الموكّل.' : 'اكتمل إعداد حسابك وتم ربطه بمساحة العمل.',
            link: homePathFor(invitation.role),
          },
        })
        return user
      })

      return NextResponse.json({
        success: true,
        message: 'تم إنشاء الحساب ويمكنك تسجيل الدخول الآن.',
        requiresVerification: false,
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      }, { status: 201 })
    }

    /* ── Path B: self-service Student / Lawyer / Law Firm ───────────── */
    if (typeof accountType !== 'string' || !(accountType in ACCOUNT_TYPES)) {
      return NextResponse.json({ error: 'يرجى اختيار نوع الحساب' }, { status: 400 })
    }
    const type = accountType as AccountType
    const { role, workspaceType } = ACCOUNT_TYPES[type]
    const orgName = typeof organizationName === 'string' ? organizationName.trim().slice(0, 120) : ''
    if (type === 'firm' && orgName.length < 2) {
      return NextResponse.json({ error: 'يرجى إدخال اسم المكتب' }, { status: 400 })
    }
    const workspaceName =
      orgName || (type === 'student' ? `مساحة ${displayName} الدراسية` : `مكتب ${displayName}`)

    const verifyToken = generateToken()
    await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({ data: { name: workspaceName, type: workspaceType } })
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          name: displayName,
          password: hashPassword(password),
          role,
          accountType: type,
          workspaceId: workspace.id,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        },
      })
      const isAcademic = type === 'student' && isAcademicEmail(cleanEmail)
      const institution = isAcademic ? getAcademicInstitutionName(cleanEmail) : null

      const selectedPlan = isAcademic
        ? await tx.plan.upsert({
            where: { code: 'student' },
            create: {
              code: 'student',
              name: 'باقة الطالب الموثقة (مجانية)',
              price: 0,
              seatLimit: 1,
              storageLimitMb: 1024,
              aiRequestLimit: 250,
              portalUploadLimit: 50,
              features: JSON.stringify({ cases: true, clients: false, workflow: false, portal: false, ai: true, student: true }),
            },
            update: {},
          })
        : await tx.plan.upsert({
            where: { code: 'trial' },
            create: { code: 'trial', name: 'Trial', price: 0, seatLimit: 3, storageLimitMb: 1024, aiRequestLimit: 100, portalUploadLimit: 100, features: JSON.stringify({ cases: true, clients: true, workflow: true, portal: true, ai: true }) },
            update: {},
          })

      const now = Date.now()
      const subscription = await tx.subscription.create({
        data: {
          planId: selectedPlan.id,
          status: isAcademic ? 'active' : 'trialing',
          quantity: 1,
          trialEndsAt: isAcademic ? null : new Date(now + 14 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: isAcademic ? new Date(now + 365 * 24 * 60 * 60 * 1000) : new Date(now + 14 * 24 * 60 * 60 * 1000),
        },
      })
      await tx.workspace.update({
        where: { id: workspace.id },
        data: { ownerId: user.id, onboardingStatus: 'in_progress', subscriptionId: subscription.id },
      })
      await tx.workspaceMembership.create({
        data: { workspaceId: workspace.id, userId: user.id, role, status: 'active', isOwner: true },
      })
      if (type !== 'student') {
        await tx.workflowTemplate.create({
          data: {
            workspaceId: workspace.id,
            name: 'التقاضي القياسي',
            description: 'مسار القضايا الافتراضي من الاستقبال حتى الإغلاق',
            stages: JSON.stringify(['intake', 'drafting', 'client_review', 'pleading', 'filed', 'hearing', 'appeal', 'enforcement', 'closed']),
            isDefault: true,
            createdById: user.id,
          },
        })
      }
      await tx.verificationToken.deleteMany({ where: { email: cleanEmail } })
      await tx.verificationToken.create({ data: { email: cleanEmail, tokenHash: hashToken(verifyToken), expiresAt: expiresIn(TOKEN_TTL.emailVerification) } })
      await recordPrivacyAcceptance(tx, user.id, ip, userAgent)
      await tx.auditLog.create({
        data: { workspaceId: workspace.id, userId: user.id, action: 'auth.register.self', entityType: 'User', entityId: user.id, ipAddress: ip, metadata: JSON.stringify({ accountType: type, isAcademic, institution }) },
      })
      const welcomeMsg = isAcademic
        ? `تم توثيق حسابك الأكاديمي مجاناً بنجاح${institution ? ` التابع لـ (${institution})` : ''}. يمكنك الاستفادة من بنك المصطلحات ومصحح العقود والتدريب العملي.`
        : 'تم إنشاء مساحة العمل الخاصة بك.'
      await tx.notification.create({
        data: { workspaceId: workspace.id, userId: user.id, type: 'system', title: 'مرحباً بك في سند', message: welcomeMsg, link: homePathFor(role) },
      })
    })

    const verifyUrl = publicAppUrl(`/verify-email?token=${encodeURIComponent(verifyToken)}`)
    let delivery: 'email' | 'manual' = 'manual'
    if (emailConfigured()) {
      await sendTransactionalEmail({
        to: cleanEmail,
        subject: 'تأكيد البريد الإلكتروني — سند',
        heading: 'أكّد بريدك الإلكتروني',
        text: 'شكراً لتسجيلك في سند. أكّد بريدك الإلكتروني لتفعيل حسابك. ينتهي الرابط خلال 24 ساعة.',
        actionUrl: verifyUrl,
        actionLabel: 'تأكيد البريد',
      })
      delivery = 'email'
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      delivery,
      message: delivery === 'email' ? 'تم إنشاء الحساب. تحقق من بريدك لتفعيله.' : 'تم إنشاء الحساب. يلزم تأكيد البريد قبل تسجيل الدخول.',
      // Only surfaced outside production when no mail transport is configured.
      ...(delivery === 'manual' && process.env.NODE_ENV !== 'production' ? { devVerifyUrl: verifyUrl } : {}),
    }, { status: 201 })
  } catch (error) {
    logError(error, { req, msg: 'Registration error', route: 'POST /api/auth/register' })
    return NextResponse.json({ error: 'تعذر إتمام التسجيل في الوقت الحالي. يرجى المحاولة لاحقاً.' }, { status: 500 })
  }
}

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0]

async function recordPrivacyAcceptance(tx: Tx, userId: string, ip: string, userAgent: string | undefined) {
  const notice = await tx.privacyNotice.upsert({
    where: { version_locale: { version: PRIVACY_NOTICE_VERSION, locale: 'ar' } },
    create: { version: PRIVACY_NOTICE_VERSION, locale: 'ar', contentHash: privacyNoticeHash('ar') },
    update: {},
  })
  await tx.privacyAcceptance.create({ data: { userId, noticeId: notice.id, ipAddress: ip, userAgent } })
}
