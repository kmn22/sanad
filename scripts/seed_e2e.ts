// Idempotent staging fixture for authenticated E2E runs.
// Creates one firm workspace with an owner, a lawyer member, a client, a case, and a task.
// Usage: DATABASE_URL=... npx tsx scripts/seed_e2e.ts
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const db = new PrismaClient()

export const E2E = {
  ownerEmail: 'e2e.owner@sanad.test',
  lawyerEmail: 'e2e.lawyer@sanad.test',
  password: 'Sanad-E2E-Passw0rd!',
  workspaceName: 'مكتب الاختبار الآلي',
}

async function main() {
  const trialPlan = await db.plan.upsert({
    where: { code: 'trial' },
    create: { code: 'trial', name: 'Trial', price: 0, seatLimit: 10, storageLimitMb: 1024, aiRequestLimit: 100, portalUploadLimit: 100, features: JSON.stringify({ cases: true, clients: true, workflow: true, portal: true, ai: true }) },
    update: { seatLimit: 50 },
  })

  const existingOwner = await db.user.findUnique({ where: { email: E2E.ownerEmail } })
  const workspace = existingOwner?.workspaceId
    ? await db.workspace.findUnique({ where: { id: existingOwner.workspaceId } })
    : null
  const ws = workspace ?? (await db.workspace.create({
    data: { name: E2E.workspaceName, type: 'firm', status: 'active', onboardingStatus: 'completed' },
  }))
  if (ws.onboardingStatus !== 'completed' || ws.status !== 'active') {
    await db.workspace.update({ where: { id: ws.id }, data: { status: 'active', onboardingStatus: 'completed' } })
  }

  const password = hashPassword(E2E.password)
  const owner = await db.user.upsert({
    where: { email: E2E.ownerEmail },
    create: { email: E2E.ownerEmail, name: 'مالك الاختبار', role: 'workspace_owner', accountType: 'firm', password, workspaceId: ws.id, emailVerified: new Date(), privacyNoticeVersion: '2026-09-28' },
    update: { password, emailVerified: new Date(), privacyNoticeVersion: '2026-09-28', disabledAt: null, lockedUntil: null, failedLoginAttempts: 0, sessionVersion: { increment: 1 } },
  })
  const lawyer = await db.user.upsert({
    where: { email: E2E.lawyerEmail },
    create: { email: E2E.lawyerEmail, name: 'محامي الاختبار', role: 'lawyer', accountType: 'lawyer', password, workspaceId: ws.id, emailVerified: new Date(), privacyNoticeVersion: '2026-09-28' },
    update: { password, emailVerified: new Date(), privacyNoticeVersion: '2026-09-28', disabledAt: null, lockedUntil: null, failedLoginAttempts: 0, sessionVersion: { increment: 1 } },
  })

  for (const [user, role, isOwner] of [[owner, 'workspace_owner', true], [lawyer, 'lawyer', false]] as const) {
    await db.workspaceMembership.upsert({
      where: { workspaceId_userId: { workspaceId: ws.id, userId: user.id } },
      create: { workspaceId: ws.id, userId: user.id, role, status: 'active', isOwner },
      update: { role, status: 'active', isOwner },
    })
  }

  if (!ws.subscriptionId) {
    const sub = await db.subscription.create({
      data: { planId: trialPlan.id, status: 'trialing', quantity: 2, trialEndsAt: new Date(Date.now() + 14 * 864e5), currentPeriodEnd: new Date(Date.now() + 14 * 864e5) },
    })
    await db.workspace.update({ where: { id: ws.id }, data: { subscriptionId: sub.id, ownerId: owner.id } })
  } else if (!ws.ownerId) {
    await db.workspace.update({ where: { id: ws.id }, data: { ownerId: owner.id } })
  }

  const client = (await db.client.findFirst({ where: { workspaceId: ws.id, name: 'عميل اختبار آلي' } }))
    ?? (await db.client.create({ data: { workspaceId: ws.id, name: 'عميل اختبار آلي', type: 'individual', phone: '+966500000001' } }))
  const kase = (await db.legalCase.findFirst({ where: { workspaceId: ws.id, title: 'قضية اختبار E2E' } }))
    ?? (await db.legalCase.create({ data: { workspaceId: ws.id, title: 'قضية اختبار E2E', clientId: client.id, clientName: client.name, caseType: 'litigation', stage: 'intake', priority: 'normal' } }))
  await db.task.create({ data: { workspaceId: ws.id, title: 'مهمة اختبار E2E', status: 'todo', priority: 'normal', caseId: kase.id } }).catch(() => {})

  console.log(JSON.stringify({ workspaceId: ws.id, ownerEmail: E2E.ownerEmail, lawyerEmail: E2E.lawyerEmail }))
}

main().finally(() => db.$disconnect())
