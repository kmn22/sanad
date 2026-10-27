import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { canManageUsers, forbiddenJson, getAuthContext, hasRole, unauthorizedJson } from '@/lib/auth/workspace'

// Workspace owners see their own tenant's feedback; platform admins see all.
export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()

  const items = await db.feedback.findMany({
    where: hasRole(auth, ['admin']) ? {} : { workspaceId: auth.workspaceId },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 300,
    select: {
      id: true,
      type: true,
      message: true,
      pagePath: true,
      status: true,
      adminNote: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
      workspace: { select: { name: true } },
    },
  })
  return NextResponse.json({ items, total: items.length, open: items.filter((i) => i.status === 'open').length })
}
