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

// ============================================================================
// Maqar (مقر) Multi-Tenant Dynamic Dashboard Router Helpers (Edge-Safe)
// ============================================================================

export type MaqarPersonaType = 'ENTERPRISE_CORP' | 'LAW_FIRM' | 'LAW_STUDENT' | 'SUPER_ADMIN'

export const MAQAR_DASHBOARD_PATHS: Record<MaqarPersonaType, string> = {
  ENTERPRISE_CORP: '/dashboard/corporate',
  LAW_FIRM: '/dashboard/practice',
  LAW_STUDENT: '/dashboard/academy',
  SUPER_ADMIN: '/admin',
}

export interface MaqarRoutingContext {
  organizationType?: string | null
  userType?: string | null
  workspaceType?: string | null
  role?: string | null
}

/**
 * Resolves the canonical Maqar persona ('ENTERPRISE_CORP' | 'LAW_FIRM' | 'LAW_STUDENT' | 'SUPER_ADMIN')
 * from user metadata and active organization type.
 */
export function resolveMaqarPersona(ctx: MaqarRoutingContext): MaqarPersonaType {
  const role = (ctx.role || '').toLowerCase()
  if (role === 'admin') {
    return 'SUPER_ADMIN'
  }

  const orgType = (ctx.organizationType || '').toUpperCase()
  const userType = (ctx.userType || '').toUpperCase()
  const wsType = (ctx.workspaceType || '').toLowerCase()

  // 1. Explicit Organization Type priority
  if (orgType === 'ENTERPRISE_CORP' || orgType === 'SME_STARTUP') {
    return 'ENTERPRISE_CORP'
  }
  if (orgType === 'ACADEMIC_INSTITUTION' || orgType === 'LAW_STUDENT') {
    return 'LAW_STUDENT'
  }
  if (orgType === 'LAW_FIRM') {
    return 'LAW_FIRM'
  }

  // 2. UserType / WorkspaceType fallback
  if (
    userType === 'CORPORATE_COUNSEL' ||
    userType === 'GRC_OFFICER' ||
    wsType === 'corporate_clm' ||
    wsType === 'enterprise'
  ) {
    return 'ENTERPRISE_CORP'
  }

  if (
    userType === 'LAW_STUDENT' ||
    wsType === 'academic' ||
    role === 'student' ||
    role === 'trainee_student'
  ) {
    return 'LAW_STUDENT'
  }

  return 'LAW_FIRM'
}

/**
 * Maps the active user/organization context to its target Maqar dashboard route:
 * - 'ENTERPRISE_CORP' -> '/dashboard/corporate'
 * - 'LAW_FIRM'        -> '/dashboard/practice'
 * - 'LAW_STUDENT'     -> '/dashboard/academy'
 * - 'SUPER_ADMIN'     -> '/admin'
 */
export function resolveMaqarDashboardPath(ctx: MaqarRoutingContext): string {
  const persona = resolveMaqarPersona(ctx)
  return MAQAR_DASHBOARD_PATHS[persona]
}

/**
 * Inspects a `/dashboard/*` pathname and determines which Maqar persona it belongs to.
 */
export function maqarPersonaForDashboardPath(pathname: string): MaqarPersonaType | null {
  if (
    pathname === '/dashboard/admin' ||
    pathname.startsWith('/dashboard/admin/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  ) {
    return 'SUPER_ADMIN'
  }
  if (
    pathname === '/dashboard/corporate' ||
    pathname.startsWith('/dashboard/corporate/') ||
    pathname === '/dashboard/enterprise'
  ) {
    return 'ENTERPRISE_CORP'
  }
  if (
    pathname === '/dashboard/practice' ||
    pathname.startsWith('/dashboard/practice/') ||
    pathname === '/dashboard/firm' ||
    pathname.startsWith('/dashboard/firm/') ||
    pathname === '/dashboard/lawyer' ||
    pathname.startsWith('/dashboard/lawyer/')
  ) {
    return 'LAW_FIRM'
  }
  if (
    pathname === '/dashboard/academy' ||
    pathname.startsWith('/dashboard/academy/') ||
    pathname === '/dashboard/student' ||
    pathname.startsWith('/dashboard/student/')
  ) {
    return 'LAW_STUDENT'
  }
  return null
}

/**
 * Checks whether a resolved Maqar persona is allowed to access a specific `/dashboard/*` sub-route.
 */
export function canAccessMaqarDashboard(
  persona: MaqarPersonaType,
  pathname: string,
  userRole?: string
): boolean {
  if (pathname === '/dashboard/admin' || pathname.startsWith('/dashboard/admin/')) {
    return userRole === 'admin' || userRole === 'workspace_owner' || persona === 'SUPER_ADMIN'
  }
  const targetPersona = maqarPersonaForDashboardPath(pathname)
  if (!targetPersona) return false
  if (targetPersona === 'SUPER_ADMIN') {
    return userRole === 'admin' || persona === 'SUPER_ADMIN'
  }
  return targetPersona === persona || userRole === 'admin'
}

