import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const all = req.nextUrl.searchParams.get('all') === '1'
  const memberships = await db.workspaceMembership.findMany({
    where: all ? { userId: auth.userId, status: 'active' } : { workspaceId: auth.workspaceId },
    orderBy: [{ isOwner: 'desc' }, { joinedAt: 'asc' }],
    select: {
      id: true,
      workspaceId: true,
      userId: true,
      role: true,
      status: true,
      isOwner: true,
      joinedAt: true,
      suspendedAt: true,
      workspace: { select: { id: true, name: true, type: true, status: true } },
      user: { select: { id: true, name: true, email: true, mfaEnabled: true, disabledAt: true } },
    },
  })
  return NextResponse.json(memberships, { headers: { 'Cache-Control': 'private, no-store' } })
}
