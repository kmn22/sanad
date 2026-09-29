import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { canManageUsers, forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()

  const users = await db.user.findMany({
    where: auth.role === 'admin' ? {} : { workspaceId: auth.workspaceId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      workspaceId: true,
      emailVerified: true,
      disabledAt: true,
      lockedUntil: true,
      mfaEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}
