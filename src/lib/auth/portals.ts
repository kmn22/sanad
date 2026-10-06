// Single source of truth for role → portal routing.
// Edge-safe (no Node/DB imports) because proxy.ts imports it.

export type PortalId = 'student' | 'lawyer' | 'firm' | 'client'

export const PORTAL_PATHS: Record<PortalId, string> = {
  student: '/student',
  lawyer: '/lawyer',
  firm: '/firm',
  client: '/client',
}

// Which roles may enter each portal. Firm owners/admins may also use the
// lawyer workspace for their own case work.
const PORTAL_ROLES: Record<PortalId, readonly string[]> = {
  student: ['student'],
  lawyer: ['lawyer', 'staff', 'auditor', 'workspace_owner', 'admin'],
  firm: ['workspace_owner', 'admin'],
  client: ['client'],
}

export function homePortalFor(role: string | null | undefined): PortalId {
  switch (role) {
    case 'student':
      return 'student'
    case 'client':
      return 'client'
    case 'workspace_owner':
    case 'admin':
      return 'firm'
    default:
      return 'lawyer'
  }
}

export function homePathFor(role: string | null | undefined): string {
  return PORTAL_PATHS[homePortalFor(role)]
}

export function portalForPath(pathname: string): PortalId | null {
  for (const id of Object.keys(PORTAL_PATHS) as PortalId[]) {
    const base = PORTAL_PATHS[id]
    if (pathname === base || pathname.startsWith(`${base}/`)) return id
  }
  return null
}

export function canAccessPortal(role: string | null | undefined, portal: PortalId): boolean {
  return Boolean(role) && PORTAL_ROLES[portal].includes(role as string)
}

/** Roles that only get read access inside the lawyer portal. */
export function isReadOnlyRole(role: string | null | undefined): boolean {
  return role === 'auditor'
}
