import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, hasRole, unauthorizedJson } from '@/lib/auth/workspace'
import { getWorkspaceUsageSummary } from '@/lib/saas/entitlements'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!hasRole(auth, ['admin'])) return forbiddenJson()

  const workspaces = await db.workspace.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      subscription: { include: { plan: { select: { code: true, name: true, seatLimit: true } } } },
      memberships: { where: { isOwner: true, status: 'active' }, take: 1, include: { user: { select: { id: true, email: true, name: true } } } },
      _count: { select: { memberships: true, cases: true, clients: true } },
    },
  })

  const rows = await Promise.all(workspaces.map(async (workspace) => ({
    id: workspace.id,
    name: workspace.name,
    type: workspace.type,
    domain: workspace.domain,
    status: workspace.status,
    onboardingStatus: workspace.onboardingStatus,
    suspendedAt: workspace.suspendedAt,
    suspensionReason: workspace.suspensionReason,
    createdAt: workspace.createdAt,
    owner: workspace.memberships[0]?.user || null,
    plan: workspace.subscription?.plan || null,
    subscriptionStatus: workspace.subscription?.status || null,
    counts: workspace._count,
    usage: await getWorkspaceUsageSummary(workspace.id),
  })))

  return NextResponse.json(rows)
}
