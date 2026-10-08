import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { hashPortalToken } from '@/lib/portal'
import type { ClientAuthContext } from '@/lib/auth/workspace'

// Label used for short-lived portal sessions minted for logged-in clients, so
// they can be told apart from (and never revoke) links a lawyer shared.
export const CLIENT_ACCOUNT_SESSION_LABEL = 'client-account-session'
const SESSION_TTL_MS = 2 * 60 * 60 * 1000

/**
 * Everything the authenticated client portal shows. Every query is scoped by
 * BOTH workspaceId and clientId — a client must never see another client's data.
 */
export async function getClientPortalData(ctx: ClientAuthContext) {
  const scope = { workspaceId: ctx.workspaceId, clientId: ctx.clientId }
  const now = new Date()

  const [client, workspace, cases, invoices, requests, files] = await Promise.all([
    db.client.findFirst({ where: { id: ctx.clientId, workspaceId: ctx.workspaceId, deletedAt: null }, select: { id: true, name: true, type: true, email: true, phone: true, company: true } }),
    db.workspace.findUnique({ where: { id: ctx.workspaceId }, select: { name: true } }),
    db.legalCase.findMany({
      where: { ...scope, deletedAt: null },
      orderBy: [{ hearingDate: 'asc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        caseType: true,
        stage: true,
        priority: true,
        caseNumber: true,
        court: true,
        hearingDate: true,
        dueDate: true,
        updatedAt: true,
        assignments: { where: { active: true }, select: { role: true, user: { select: { name: true } } } },
      },
    }),
    db.invoice.findMany({
      where: { ...scope, status: { notIn: ['draft', 'cancelled'] }, deletedAt: null },
      orderBy: { issueDate: 'desc' },
      take: 50,
      select: { id: true, number: true, issueDate: true, dueDate: true, status: true, total: true, paidAmount: true, paidAt: true, paymentUrl: true, caseId: true },
    }),
    db.portalRequest.findMany({
      where: scope,
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, title: true, message: true, status: true, priority: true, dueDate: true, createdAt: true, caseId: true, case: { select: { title: true } } },
    }),
    db.portalFile.findMany({
      where: { ...scope, status: { not: 'deleted' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, originalName: true, mimeType: true, sizeBytes: true, createdAt: true, caseId: true },
    }),
  ])

  // Internal drafts stay inside the firm; clients see sent/active documents.
  const documents = await db.legalDocument.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      status: { not: 'draft' },
      deletedAt: null,
      OR: [{ clientId: ctx.clientId }, { caseId: { in: cases.map((c) => c.id) } }],
    },
    orderBy: { updatedAt: 'desc' },
    take: 30,
    select: { id: true, title: true, docType: true, status: true, signedDate: true, updatedAt: true, caseId: true },
  })

  const outstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + Math.max(0, Number(i.total) - Number(i.paidAmount || 0)), 0)

  return {
    client,
    firmName: workspace?.name || '',
    cases: cases.map(({ assignments, ...c }) => ({
      ...c,
      // Only expose lawyer names, never internal user ids/emails.
      lawyers: assignments.map((a) => ({ name: a.user.name, role: a.role })),
    })),
    invoices,
    requests,
    files,
    documents,
    stats: {
      activeCases: cases.filter((c) => c.stage !== 'closed').length,
      upcomingHearings: cases.filter((c) => c.hearingDate && c.hearingDate >= now).length,
      openRequests: requests.filter((r) => r.status === 'open').length,
      outstanding: Math.round(outstanding),
      overdueInvoices: invoices.filter((i) => i.status === 'overdue' || ((i.status === 'sent') && i.dueDate && i.dueDate < now)).length,
    },
  }
}

export type ClientPortalData = Awaited<ReturnType<typeof getClientPortalData>>

/**
 * Mint a short-lived portal session so a logged-in client can use the full
 * case workspace (requests, uploads, e-sign) at /portal/[token]. Previous
 * account sessions for the same case are revoked; lawyer-shared links are untouched.
 */
export async function createClientCaseSession(ctx: ClientAuthContext, caseId: string | null) {
  if (caseId) {
    const legalCase = await db.legalCase.findFirst({ where: { id: caseId, workspaceId: ctx.workspaceId, clientId: ctx.clientId, deletedAt: null }, select: { id: true } })
    if (!legalCase) return null
  }
  const token = randomBytes(32).toString('hex')
  const now = new Date()
  await db.$transaction(async (tx) => {
    await tx.portalAccess.updateMany({
      where: { workspaceId: ctx.workspaceId, clientId: ctx.clientId, caseId, label: CLIENT_ACCOUNT_SESSION_LABEL, revokedAt: null },
      data: { revokedAt: now },
    })
    const created = await tx.portalAccess.create({
      data: {
        workspaceId: ctx.workspaceId,
        clientId: ctx.clientId,
        caseId,
        tokenHash: hashPortalToken(token),
        label: CLIENT_ACCOUNT_SESSION_LABEL,
        allowUpload: true,
        expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
        createdById: ctx.userId,
      },
    })
    await tx.auditLog.create({
      data: { workspaceId: ctx.workspaceId, userId: ctx.userId, action: 'client.portal.session', entityType: 'PortalAccess', entityId: created.id },
    })
  })
  return token
}
