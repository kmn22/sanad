import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isFeatureEnabled } from '@/lib/feature-flags'

export type EntitlementKey = 'cases' | 'clients' | 'workflow' | 'portal' | 'ai' | 'education'

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['trialing', 'active'])

export function isSubscriptionActive(subscription: { status: string; currentPeriodEnd: Date; trialEndsAt: Date | null } | null | undefined, now = new Date()) {
  return Boolean(
    subscription &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status) &&
      subscription.currentPeriodEnd > now &&
      (!subscription.trialEndsAt || subscription.status !== 'trialing' || subscription.trialEndsAt > now),
  )
}

const defaultEntitlements: Record<EntitlementKey, boolean> = {
  cases: true,
  clients: true,
  workflow: true,
  portal: true,
  ai: true,
  // The education/study module is excluded from the legal product by default;
  // it is enabled implicitly for academic workspaces (see getWorkspacePlan) or
  // explicitly via a plan's features JSON.
  education: false,
}

export async function getWorkspacePlan(workspaceId: string) {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: { subscription: { include: { plan: true } } },
  })
  if (!workspace) return null
  const plan = workspace.subscription?.plan
  const subscription = workspace.subscription
  // Workspaces created before billing was introduced retain the legacy trial
  // behavior until an explicit subscription is attached.
  const subscriptionActive = !subscription || isSubscriptionActive(subscription)
  let entitlements = defaultEntitlements
  if (plan?.features) {
    try {
      entitlements = { ...defaultEntitlements, ...JSON.parse(plan.features) }
    } catch {
      entitlements = defaultEntitlements
    }
  }
  // Academic workspaces always carry the education module regardless of plan.
  if (workspace.type === 'academic') entitlements = { ...entitlements, education: true }
  const activeSeats = await db.workspaceMembership.count({ where: { workspaceId, status: 'active', user: { role: { not: 'client' } } } })
  return {
    workspace: { id: workspace.id, name: workspace.name, domain: workspace.domain, type: workspace.type, status: workspace.status, onboardingStatus: workspace.onboardingStatus },
    subscription: subscription ? {
      id: subscription.id,
      status: subscription.status,
      trialEndsAt: subscription.trialEndsAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      active: subscriptionActive,
    } : null,
    plan: plan ? {
      code: plan.code,
      name: plan.name,
      seatLimit: plan.seatLimit,
      storageLimitMb: plan.storageLimitMb,
      aiRequestLimit: plan.aiRequestLimit,
      portalUploadLimit: plan.portalUploadLimit,
    } : { code: 'trial', name: 'Trial', seatLimit: 3, storageLimitMb: 1024, aiRequestLimit: 100, portalUploadLimit: 100 },
    entitlements: subscriptionActive && workspace.status === 'active' ? entitlements : Object.fromEntries(Object.keys(defaultEntitlements).map((key) => [key, false])) as Record<EntitlementKey, boolean>,
    usage: { seats: activeSeats },
  }
}

function currentPeriod(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

export async function getUsageQuantity(workspaceId: string, metric: string, now = new Date()) {
  const row = await db.usageMetric.findUnique({
    where: { workspaceId_metric_period: { workspaceId, metric, period: currentPeriod(now) } },
    select: { quantity: true },
  })
  return row?.quantity ?? 0
}

export async function storageBytesUsed(workspaceId: string) {
  const result = await db.legalDocument.aggregate({
    where: { workspaceId, fileKey: { not: null } },
    _sum: { sizeBytes: true },
  })
  return result._sum.sizeBytes ?? 0
}

export type UsageCheck =
  | { allowed: true; code: null; used: number; limit: number | null }
  | { allowed: false; code: string; used: number; limit: number | null }

export async function checkAiUsage(workspaceId: string): Promise<UsageCheck> {
  const plan = await getWorkspacePlan(workspaceId)
  const fail = (code: string): UsageCheck => ({ allowed: false, code, used: 0, limit: plan?.plan.aiRequestLimit ?? null })
  if (!plan || plan.workspace.status !== 'active') return fail('WORKSPACE_INACTIVE')
  if (plan.subscription && !plan.subscription.active) return fail('SUBSCRIPTION_INACTIVE')
  if (!plan.entitlements.ai) return fail('AI_NOT_INCLUDED')
  if (!(await isFeatureEnabled(workspaceId, 'ai_drafting'))) return fail('AI_FLAG_DISABLED')
  const limit = plan.plan.aiRequestLimit
  if (limit > 0) {
    const used = await getUsageQuantity(workspaceId, 'ai_requests')
    if (used >= limit) return { allowed: false, code: 'AI_LIMIT_REACHED', used, limit }
    return { allowed: true, code: null, used, limit }
  }
  return { allowed: true, code: null, used: 0, limit: null }
}

export async function checkStorageUsage(workspaceId: string, sizeBytes: number): Promise<UsageCheck> {
  const plan = await getWorkspacePlan(workspaceId)
  if (!plan || plan.workspace.status !== 'active') return { allowed: false, code: 'WORKSPACE_INACTIVE', used: 0, limit: null }
  if (plan.subscription && !plan.subscription.active) return { allowed: false, code: 'SUBSCRIPTION_INACTIVE', used: 0, limit: null }
  const storageLimit = plan.plan.storageLimitMb
  if (storageLimit > 0) {
    const usedBytes = await storageBytesUsed(workspaceId)
    const limitBytes = storageLimit * 1024 * 1024
    if (usedBytes + sizeBytes > limitBytes) return { allowed: false, code: 'STORAGE_LIMIT_REACHED', used: usedBytes, limit: limitBytes }
    return { allowed: true, code: null, used: usedBytes, limit: limitBytes }
  }
  return { allowed: true, code: null, used: 0, limit: null }
}

export async function checkPortalUpload(workspaceId: string, sizeBytes: number): Promise<UsageCheck> {
  const plan = await getWorkspacePlan(workspaceId)
  const fail = (code: string): UsageCheck => ({ allowed: false, code, used: 0, limit: null })
  if (!plan || plan.workspace.status !== 'active') return fail('WORKSPACE_INACTIVE')
  if (plan.subscription && !plan.subscription.active) return fail('SUBSCRIPTION_INACTIVE')
  if (!plan.entitlements.portal) return fail('PORTAL_NOT_INCLUDED')
  if (!(await isFeatureEnabled(workspaceId, 'client_portal'))) return fail('PORTAL_FLAG_DISABLED')
  const uploadLimit = plan.plan.portalUploadLimit
  if (uploadLimit > 0) {
    const used = await getUsageQuantity(workspaceId, 'portal_uploads')
    if (used >= uploadLimit) return { allowed: false, code: 'PORTAL_UPLOAD_LIMIT_REACHED', used, limit: uploadLimit }
  }
  const storage = await checkStorageUsage(workspaceId, sizeBytes)
  if (!storage.allowed) return storage
  return { allowed: true, code: null, used: 0, limit: uploadLimit > 0 ? uploadLimit : null }
}

export async function getWorkspaceUsageSummary(workspaceId: string) {
  const plan = await getWorkspacePlan(workspaceId)
  if (!plan) return null
  const [aiRequests, portalUploads, storageBytes] = await Promise.all([
    getUsageQuantity(workspaceId, 'ai_requests'),
    getUsageQuantity(workspaceId, 'portal_uploads'),
    storageBytesUsed(workspaceId),
  ])
  return {
    ...plan.usage,
    aiRequests: { used: aiRequests, limit: plan.plan.aiRequestLimit > 0 ? plan.plan.aiRequestLimit : null },
    portalUploads: { used: portalUploads, limit: plan.plan.portalUploadLimit > 0 ? plan.plan.portalUploadLimit : null },
    storage: { usedBytes: storageBytes, limitBytes: plan.plan.storageLimitMb > 0 ? plan.plan.storageLimitMb * 1024 * 1024 : null },
  }
}

export async function canInviteWorkspaceMember(workspaceId: string) {
  const plan = await getWorkspacePlan(workspaceId)
  if (!plan || plan.workspace.status !== 'active') return { allowed: false, reason: 'Workspace is not active', plan }
  if (plan.usage.seats >= plan.plan.seatLimit) return { allowed: false, reason: 'Seat limit reached', plan }
  return { allowed: true, reason: null, plan }
}

export async function incrementUsage(workspaceId: string, metric: string, amount = 1, now = new Date()) {
  const period = currentPeriod(now)
  return db.usageMetric.upsert({
    where: { workspaceId_metric_period: { workspaceId, metric, period } },
    create: { workspaceId, metric, period, quantity: amount },
    update: { quantity: { increment: amount } },
  })
}

export async function hasEntitlement(workspaceId: string, key: EntitlementKey) {
  const plan = await getWorkspacePlan(workspaceId)
  return Boolean(plan && plan.workspace.status === 'active' && (!plan.subscription || plan.subscription.active) && plan.entitlements[key])
}

/**
 * Route guard for the education/study module. Returns a 403 NextResponse when
 * the workspace is not entitled to education (i.e. not an academic workspace
 * and not granted via plan features), or null when access is allowed.
 */
export async function requireEducation(workspaceId: string): Promise<NextResponse | null> {
  if (await hasEntitlement(workspaceId, 'education')) return null
  return NextResponse.json(
    { error: 'The education module is not enabled for this workspace', code: 'EDUCATION_NOT_ENABLED' },
    { status: 403 },
  )
}
