import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, hasRole, isPlatformSuperAdmin, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!hasRole(auth, ['admin', 'workspace_owner']) && !auth.isOwner) return forbiddenJson()

  const superAdmin = isPlatformSuperAdmin(auth)
  const scopeWhere = superAdmin ? {} : { workspaceId: auth.workspaceId }

  const [byStatus, recent, stuckProcessing] = await Promise.all([
    db.backgroundJob.groupBy({ by: ['status'], where: scopeWhere, _count: { _all: true } }),
    db.backgroundJob.findMany({
      where: scopeWhere,
      orderBy: { updatedAt: 'desc' },
      take: 25,
      select: { id: true, type: true, status: true, attempts: true, maxAttempts: true, runAt: true, lastError: true, createdAt: true, updatedAt: true, completedAt: true },
    }),
    db.backgroundJob.count({ where: { ...scopeWhere, status: 'processing', lockedAt: { lt: new Date(Date.now() - 10 * 60_000) } } }),
  ])

  return NextResponse.json({
    counts: Object.fromEntries(byStatus.map((row) => [row.status, row._count._all])),
    stuckProcessing,
    recent,
  })
}
