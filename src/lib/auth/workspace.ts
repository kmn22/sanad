import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/options'

export type AuthContext = {
  userId: string
  workspaceId: string
  role: string
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; workspaceId?: string; role?: string } | undefined
  if (!user?.id || !user.workspaceId) return null
  return { userId: user.id, workspaceId: user.workspaceId, role: user.role || 'lawyer' }
}

export async function getSessionWorkspaceId(): Promise<string | null> {
  return (await getAuthContext())?.workspaceId || null
}

export function unauthorizedJson() {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
}

export function notFoundJson() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export function forbiddenJson() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export function hasRole(auth: AuthContext, roles: string[]) {
  return roles.includes(auth.role)
}

export function canManageUsers(auth: AuthContext) {
  return hasRole(auth, ['admin', 'workspace_owner'])
}

export function communicationWorkspaceWhere(workspaceId: string) {
  return {
    OR: [
      { client: { is: { workspaceId } } },
      { case: { is: { workspaceId } } },
    ],
  }
}
