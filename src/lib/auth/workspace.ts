import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/options'

export type AuthContext = {
  userId: string
  workspaceId: string
  role: string
  mfaEnabled: boolean
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; workspaceId?: string; role?: string; mfaEnabled?: boolean } | undefined
  if (!user?.id || !user.workspaceId) return null
  // Client logins share the firm's workspaceId but must never be authorised
  // by it — every workspace-scoped API would otherwise expose firm data.
  if (user.role === 'client') return null
  return { userId: user.id, workspaceId: user.workspaceId, role: user.role || 'lawyer', mfaEnabled: Boolean(user.mfaEnabled) }
}

export type ClientAuthContext = {
  userId: string
  workspaceId: string
  clientId: string
}

/** Auth context for the client portal — scoped strictly to one Client record. */
export async function getClientContext(): Promise<ClientAuthContext | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; workspaceId?: string; role?: string; clientId?: string } | undefined
  if (!user?.id || !user.workspaceId || user.role !== 'client' || !user.clientId) return null
  return { userId: user.id, workspaceId: user.workspaceId, clientId: user.clientId }
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
  return auth.mfaEnabled && hasRole(auth, ['admin', 'workspace_owner'])
}

export function communicationWorkspaceWhere(workspaceId: string) {
  return { workspaceId }
}
