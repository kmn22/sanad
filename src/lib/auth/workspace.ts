import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db'

export type AuthContext = {
  userId: string
  orgId?: string
  workspaceId: string
  role: string
  email?: string
  mfaEnabled: boolean
  isOwner?: boolean
}

export type ResolvedAuthContext = AuthContext & {
  orgId: string
}

export async function getAuthContext(): Promise<ResolvedAuthContext | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as
    | {
        id?: string
        orgId?: string
        workspaceId?: string
        role?: string
        email?: string | null
        mfaEnabled?: boolean
        isOwner?: boolean
      }
    | undefined
  if (!user?.id || !user.workspaceId) return null
  // Client logins share the firm's workspaceId but must never be authorised
  // by it — every workspace-scoped API would otherwise expose firm data.
  if (user.role === 'client') return null

  let orgId = user.orgId
  if (!orgId) {
    const ws = await db.workspace.findUnique({
      where: { id: user.workspaceId },
      select: { orgId: true, status: true, organization: { select: { isActive: true } } },
    })
    if (!ws || ws.status !== 'active' || ws.organization?.isActive === false || !ws.orgId) {
      return null
    }
    orgId = ws.orgId
  }

  return {
    userId: user.id,
    orgId,
    workspaceId: user.workspaceId,
    role: user.role || 'lawyer',
    email: user.email || undefined,
    mfaEnabled: Boolean(user.mfaEnabled),
    isOwner: Boolean(user.isOwner),
  }
}

export type ClientAuthContext = {
  userId: string
  orgId: string
  workspaceId: string
  clientId: string
}

/** Auth context for the client portal — scoped strictly to one Client record. */
export async function getClientContext(): Promise<ClientAuthContext | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as
    | { id?: string; orgId?: string; workspaceId?: string; role?: string; clientId?: string }
    | undefined
  if (!user?.id || !user.workspaceId || user.role !== 'client' || !user.clientId) return null

  let orgId = user.orgId
  if (!orgId) {
    const ws = await db.workspace.findUnique({
      where: { id: user.workspaceId },
      select: { orgId: true, status: true },
    })
    if (!ws || ws.status !== 'active' || !ws.orgId) return null
    orgId = ws.orgId
  }

  return { userId: user.id, orgId, workspaceId: user.workspaceId, clientId: user.clientId }
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
  return auth.mfaEnabled && (hasRole(auth, ['admin', 'workspace_owner']) || Boolean(auth.isOwner))
}

/**
 * Strictly separates SaaS platform super-operators from tenant-level admins
 * (`role === 'admin'` in Corporate CLM workspaces). Cross-tenant platform
 * administration is permitted ONLY for MFA-verified accounts explicitly listed
 * in `PLATFORM_ADMIN_EMAILS`.
 */
export function isPlatformSuperAdmin(auth: AuthContext): boolean {
  if (!auth.mfaEnabled || !auth.email) return false
  const allowlist = (process.env.PLATFORM_ADMIN_EMAILS || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
  if (allowlist.length === 0) return false
  return allowlist.includes(auth.email.toLowerCase())
}

export function communicationWorkspaceWhere(workspaceId: string) {
  return { workspaceId }
}
