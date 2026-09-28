import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { canManageUsers, forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const status = req.nextUrl.searchParams.get('status')
  const items = await db.dataSubjectRequest.findMany({
    where: { ...(auth.role === 'admin' ? {} : { workspaceId: auth.workspaceId }), ...(status ? { status } : {}) },
    orderBy: [{ dueAt: 'asc' }, { receivedAt: 'asc' }],
    take: 100,
  })
  return NextResponse.json(items)
}
