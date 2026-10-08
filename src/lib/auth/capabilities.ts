import { NextResponse } from 'next/server'
import type { AuthContext } from '@/lib/auth/workspace'
import { forbiddenJson } from '@/lib/auth/workspace'
import { rateLimit } from '@/lib/rate-limit'
import { db } from '@/lib/db'

/** Roles that always see every case, including confidential ones. */
const ALL_CASE_ROLES = ['admin', 'workspace_owner']

function canSeeAllCases(auth: AuthContext) {
  return ALL_CASE_ROLES.includes(auth.role)
}

/**
 * Prisma `where` fragment scoping LegalCase queries: confidential matters are
 * visible only to owners/admins and members with an active assignment.
 */
export function caseAccessWhere(auth: AuthContext) {
  if (canSeeAllCases(auth)) return {}
  return {
    OR: [
      { confidential: false },
      { assignments: { some: { userId: auth.userId, active: true } } },
    ],
  }
}

/**
 * Same rule applied through a child entity's `case` relation (documents,
 * tasks, communications, time entries, invoices). Rows with no case stay
 * workspace-visible — only case-linked rows inherit confidentiality.
 */
export function caseLinkedAccessWhere(auth: AuthContext) {
  if (canSeeAllCases(auth)) return { OR: [{ caseId: null }, { case: { deletedAt: null } }] }
  return {
    OR: [
      { caseId: null },
      { case: { deletedAt: null, confidential: false } },
      { case: { deletedAt: null, assignments: { some: { userId: auth.userId, active: true } } } },
    ],
  }
}

/** Single-record access check for a (possibly confidential) case id. */
export async function canAccessCase(auth: AuthContext, caseId: string): Promise<boolean> {
  if (canSeeAllCases(auth)) return true
  const legalCase = await db.legalCase.findFirst({
    where: { id: caseId, workspaceId: auth.workspaceId, deletedAt: null },
    select: {
      confidential: true,
      assignments: { where: { userId: auth.userId, active: true }, select: { id: true }, take: 1 },
    },
  })
  return Boolean(legalCase && (!legalCase.confidential || legalCase.assignments.length > 0))
}

/**
 * Central role → capability matrix for workspace-scoped APIs.
 *
 * getAuthContext() already guarantees a non-client member of an active
 * workspace; this layer decides what each internal role may *write*.
 *
 * Roles: admin | workspace_owner | lawyer | staff | auditor | student
 * (client is fenced out entirely by getAuthContext/getClientContext)
 */

// Firm-operational writers: manage cases, clients, documents, billing, tasks.
const FIRM_WRITE_ROLES = new Set(['admin', 'workspace_owner', 'lawyer', 'staff'])

// Academic/study content additionally allows students — these entities back
// the student portal (courses, lectures, deadlines, terms, casebook, reviews).
const ACADEMIC_WRITE_ROLES = new Set([...FIRM_WRITE_ROLES, 'student'])

// Workspace administration (settings, invites, membership changes).
const MANAGE_ROLES = new Set(['admin', 'workspace_owner'])

/** May create/update/delete firm-operational records. Auditors and students may not. */
export function canWrite(auth: AuthContext) {
  return FIRM_WRITE_ROLES.has(auth.role)
}

/** May write academic/study entities — firm roles plus students. */
export function canWriteAcademic(auth: AuthContext) {
  return ACADEMIC_WRITE_ROLES.has(auth.role)
}

/** May administer the workspace (non-MFA-gated; use canManageUsers for user admin). */
export function canManage(auth: AuthContext) {
  return MANAGE_ROLES.has(auth.role)
}

/** 403 response when the role lacks a capability; null when allowed. */
export function denyUnless(auth: AuthContext, allowed: boolean): NextResponse | null {
  return allowed ? null : forbiddenJson()
}

/**
 * Per-user write budget — 240 mutations/hour. Generous for interactive use,
 * stops scripted record flooding on the ~40 endpoints that have no
 * endpoint-specific rate limit. Returns a 429 response or null.
 */
export async function enforceMutationBudget(auth: AuthContext): Promise<NextResponse | null> {
  const limited = await rateLimit(`mut:${auth.userId}`, 240, 60 * 60 * 1000)
  return limited.success ? null : NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}

/**
 * 409 response when an entity is covered by an unreleased LegalHold —
 * deletions must never destroy hold-protected records. null when clear.
 */
export async function legalHoldBlock(workspaceId: string, entityType: string, entityId: string): Promise<NextResponse | null> {
  const hold = await db.legalHold.findFirst({
    where: { workspaceId, entityType, entityId, releasedAt: null },
    select: { id: true },
  })
  return hold
    ? NextResponse.json({ error: 'This record is under a legal hold and cannot be deleted', code: 'LEGAL_HOLD' }, { status: 409 })
    : null
}
