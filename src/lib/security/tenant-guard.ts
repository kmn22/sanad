/**
 * ============================================================================
 * Maqar (مقر) Security Hardening — Multi-Tenant Isolation Guard
 * (`src/lib/security/tenant-guard.ts`)
 * ============================================================================
 *
 * Application-layer defense-in-depth complementing PostgreSQL `FORCE ROW LEVEL SECURITY`:
 *   1. Verifies every database query carries a non-empty `orgId` or `workspaceId`.
 *   2. Rejects any cross-tenant access attempt (Firm A -> Firm B) with a
 *      deterministic `TenantIsolationViolationError` (HTTP 403).
 */

export class TenantIsolationViolationError extends Error {
  public readonly statusCode = 403
  public readonly code = 'CROSS_TENANT_ACCESS_DENIED'

  constructor(message: string) {
    super(message)
    this.name = 'TenantIsolationViolationError'
  }
}

export interface ActiveTenantSession {
  userId: string
  workspaceId: string
  orgId?: string | null
  role: string
}

/**
 * Ensures an active authenticated session possesses valid tenant identifiers
 * before any database query is executed.
 */
export function assertValidTenantSession(
  session: Partial<ActiveTenantSession> | null | undefined
): asserts session is ActiveTenantSession {
  if (!session || !session.userId || !session.workspaceId) {
    throw new TenantIsolationViolationError(
      'رفض الوصول الأمني: سياق المستأجر (workspace_id / organization_id) مفقود.'
    )
  }
}

/**
 * Verifies that a target resource (`resourceOrgId` / `resourceWorkspaceId`)
 * belongs strictly to the caller's active tenant boundary.
 * Guarantees Firm A can never inspect, query, or mutate Firm B's records.
 */
export function assertCrossTenantBoundary(params: {
  actor: ActiveTenantSession
  resourceWorkspaceId?: string | null
  resourceOrgId?: string | null
}): void {
  assertValidTenantSession(params.actor)

  const workspaceMatches =
    Boolean(params.resourceWorkspaceId) &&
    params.resourceWorkspaceId === params.actor.workspaceId

  const orgMatches =
    Boolean(params.actor.orgId) &&
    Boolean(params.resourceOrgId) &&
    params.resourceOrgId === params.actor.orgId

  if (!workspaceMatches && !orgMatches) {
    throw new TenantIsolationViolationError(
      'انتهاك عزل المستأجرين (PDPL / NCA CCC): لا يُسمح بالوصول إلى سجلات منشأة أخرى.'
    )
  }
}

/**
 * Constructs a mandatory Prisma `where` filter scoped strictly to the caller's
 * `workspaceId` (and `orgId` when applicable), preventing unscoped table scans.
 */
export function buildTenantScopedWhere<T extends Record<string, unknown>>(
  actor: ActiveTenantSession,
  extraWhere?: T,
  includeOrgFilter: boolean = false
): T & { workspaceId: string; orgId?: string } {
  assertValidTenantSession(actor)

  const baseFilter: { workspaceId: string; orgId?: string } = {
    workspaceId: actor.workspaceId,
  }

  if (includeOrgFilter && actor.orgId) {
    baseFilter.orgId = actor.orgId
  }

  return {
    ...(extraWhere || ({} as T)),
    ...baseFilter,
  }
}

