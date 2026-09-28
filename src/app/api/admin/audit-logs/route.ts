import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { canManageUsers, forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()

  const cursor = req.nextUrl.searchParams.get('cursor') || undefined
  const requestedLimit = Number(req.nextUrl.searchParams.get('limit') || 50)
  const limit = Math.min(100, Math.max(1, Number.isFinite(requestedLimit) ? requestedLimit : 50))
  const logs = await db.auditLog.findMany({
    where: auth.role === 'admin' ? {} : { workspaceId: auth.workspaceId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })
  const nextCursor = logs.length > limit ? logs[limit - 1].id : null
  return NextResponse.json({ items: logs.slice(0, limit), nextCursor })
}
