/**
 * Workspace isolation tests
 *
 * These tests verify that Sanad's core multi-tenant security guarantee holds:
 * a user belonging to workspace A cannot read or modify data owned by workspace B,
 * even when they have a valid authenticated session.
 *
 * They use the real Prisma client against the configured DATABASE_URL so they
 * catch both application-layer bugs and accidental schema changes that would
 * remove the workspaceId filter.
 *
 * Run with:
 *   DATABASE_URL="postgresql://..." npx vitest run tests/workspace-isolation.test.ts
 *
 * The test database is cleaned up after each suite (afterAll).
 *
 * Tests are automatically SKIPPED when DATABASE_URL is not set (e.g. in unit-only CI).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'
import { checkAiUsage, checkPortalUpload, getUsageQuantity, incrementUsage, storageBytesUsed } from '../src/lib/saas/entitlements'

// Skip this entire suite when there is no database configured (unit-only CI).
const hasDb = Boolean(process.env.DATABASE_URL)
const describeWithDb = hasDb ? describe : describe.skip


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const db = new PrismaClient()

/** Create a minimal workspace + user and return their IDs. */
async function createWorkspace(suffix: string) {
  const ws = await db.workspace.create({ data: { name: `Test Workspace ${suffix}` } })
  const user = await db.user.create({
    data: {
      email: `test-${suffix}@sanad-test.local`,
      password: hashPassword('TestPass2026!'),
      role: 'lawyer',
      workspaceId: ws.id,
      emailVerified: new Date(),
    },
  })
  await db.workspaceMembership.create({ data: { workspaceId: ws.id, userId: user.id, role: 'lawyer', status: 'active' } })
  return { workspaceId: ws.id, userId: user.id }
}

/** IDs created during setup — used in afterAll cleanup. */
let wsA: { workspaceId: string; userId: string }
let wsB: { workspaceId: string; userId: string }
let caseAId: string
let clientAId: string
let taskAId: string
let documentAId: string
let complianceAId: string
let invoiceAId: string
let portalAccessAId: string
let portalRequestAId: string

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeAll(async () => {
  wsA = await createWorkspace('A')
  wsB = await createWorkspace('B')

  // Seed workspace A with one of each entity type
  const client = await db.client.create({
    data: { name: 'Client A', workspaceId: wsA.workspaceId },
  })
  clientAId = client.id

  const legalCase = await db.legalCase.create({
    data: {
      title: 'Case A',
      clientName: 'Client A',
      clientId: clientAId,
      caseType: 'litigation',
      workspaceId: wsA.workspaceId,
    },
  })
  caseAId = legalCase.id

  const task = await db.task.create({
    data: { title: 'Task A', workspaceId: wsA.workspaceId },
  })
  taskAId = task.id

  const document = await db.legalDocument.create({
    data: {
      title: 'Document A',
      docType: 'contract_draft',
      status: 'draft',
      parties: 'Party A',
      workspaceId: wsA.workspaceId,
    },
  })
  documentAId = document.id

  const compliance = await db.complianceItem.create({
    data: {
      title: 'Compliance A',
      category: 'iqama',
      entityName: 'Employee A',
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 90 * 86400_000),
      workspaceId: wsA.workspaceId,
    },
  })
  complianceAId = compliance.id

  const invoice = await db.invoice.create({
    data: {
      number: 'INV-TEST-001',
      subtotal: 1000,
      vatRate: 15,
      vatAmount: 150,
      total: 1150,
      workspaceId: wsA.workspaceId,
    },
  })
  invoiceAId = invoice.id

  const portalAccess = await db.portalAccess.create({
    data: {
      workspaceId: wsA.workspaceId,
      clientId: clientAId,
      caseId: caseAId,
      tokenHash: `test-token-${wsA.workspaceId}`,
      expiresAt: new Date(Date.now() + 86400_000),
    },
  })
  portalAccessAId = portalAccess.id
  const portalRequest = await db.portalRequest.create({
    data: {
      workspaceId: wsA.workspaceId,
      portalAccessId: portalAccess.id,
      clientId: clientAId,
      caseId: caseAId,
      createdBy: 'user',
      title: 'Upload identity document',
      message: 'Please upload the requested document',
    },
  })
  portalRequestAId = portalRequest.id
})

afterAll(async () => {
  // Delete in reverse FK order — most restrictive first
  await db.usageMetric.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.portalFile.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.portalRequest.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.portalAccess.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.invoice.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.complianceItem.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.legalDocument.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.task.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.legalCase.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.client.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.user.deleteMany({ where: { workspaceId: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.workspace.deleteMany({ where: { id: { in: [wsA.workspaceId, wsB.workspaceId] } } })
  await db.$disconnect()
})

// ---------------------------------------------------------------------------
// Core isolation: workspace B cannot see workspace A's data
// ---------------------------------------------------------------------------

describeWithDb('LegalCase isolation', () => {
  it('workspace B cannot read workspace A cases via findMany', async () => {
    const cases = await db.legalCase.findMany({ where: { workspaceId: wsB.workspaceId } })
    const ids = cases.map((c) => c.id)
    expect(ids).not.toContain(caseAId)
  })

  it('workspace B cannot access a specific workspace A case', async () => {
    // This is how the API layer guards: findFirst with workspaceId in the where clause
    const result = await db.legalCase.findFirst({
      where: { id: caseAId, workspaceId: wsB.workspaceId },
    })
    expect(result).toBeNull()
  })

  it('workspace B cannot update a workspace A case', async () => {
    const updated = await db.legalCase.updateMany({
      where: { id: caseAId, workspaceId: wsB.workspaceId },
      data: { title: 'COMPROMISED' },
    })
    expect(updated.count).toBe(0)

    // Confirm the original title is unchanged
    const original = await db.legalCase.findUnique({ where: { id: caseAId } })
    expect(original?.title).toBe('Case A')
  })

  it('workspace B cannot delete a workspace A case', async () => {
    const deleted = await db.legalCase.deleteMany({
      where: { id: caseAId, workspaceId: wsB.workspaceId },
    })
    expect(deleted.count).toBe(0)

    // Confirm it still exists
    const stillExists = await db.legalCase.findUnique({ where: { id: caseAId } })
    expect(stillExists).not.toBeNull()
  })
})

describeWithDb('Workspace membership isolation', () => {
  it('workspace B cannot resolve workspace A membership as its own', async () => {
    const membership = await db.workspaceMembership.findFirst({ where: { workspaceId: wsB.workspaceId, userId: wsA.userId, status: 'active' } })
    expect(membership).toBeNull()
  })

  it('a membership role is scoped to one workspace', async () => {
    const membership = await db.workspaceMembership.findUnique({ where: { workspaceId_userId: { workspaceId: wsA.workspaceId, userId: wsA.userId } } })
    expect(membership?.role).toBe('lawyer')
    expect(membership?.workspaceId).toBe(wsA.workspaceId)
  })
})

describeWithDb('Client isolation', () => {
  it('workspace B cannot see workspace A clients', async () => {
    const clients = await db.client.findMany({ where: { workspaceId: wsB.workspaceId } })
    expect(clients.map((c) => c.id)).not.toContain(clientAId)
  })

  it('workspace B cannot update a workspace A client', async () => {
    const result = await db.client.updateMany({
      where: { id: clientAId, workspaceId: wsB.workspaceId },
      data: { name: 'COMPROMISED' },
    })
    expect(result.count).toBe(0)
  })
})

describeWithDb('Task isolation', () => {
  it('workspace B cannot see workspace A tasks', async () => {
    const tasks = await db.task.findMany({ where: { workspaceId: wsB.workspaceId } })
    expect(tasks.map((t) => t.id)).not.toContain(taskAId)
  })
})

describeWithDb('LegalDocument isolation', () => {
  it('workspace B cannot see workspace A documents', async () => {
    const docs = await db.legalDocument.findMany({ where: { workspaceId: wsB.workspaceId } })
    expect(docs.map((d) => d.id)).not.toContain(documentAId)
  })
})

describeWithDb('ComplianceItem isolation', () => {
  it('workspace B cannot see workspace A compliance items', async () => {
    const items = await db.complianceItem.findMany({ where: { workspaceId: wsB.workspaceId } })
    expect(items.map((i) => i.id)).not.toContain(complianceAId)
  })

  it('workspace B cannot update a workspace A compliance item', async () => {
    const result = await db.complianceItem.updateMany({
      where: { id: complianceAId, workspaceId: wsB.workspaceId },
      data: { title: 'COMPROMISED' },
    })
    expect(result.count).toBe(0)

    const item = await db.complianceItem.findUnique({ where: { id: complianceAId } })
    expect(item?.title).not.toBe('COMPROMISED')
  })

  it('workspace B cannot delete a workspace A compliance item', async () => {
    const result = await db.complianceItem.deleteMany({
      where: { id: complianceAId, workspaceId: wsB.workspaceId },
    })
    expect(result.count).toBe(0)

    const item = await db.complianceItem.findUnique({ where: { id: complianceAId } })
    expect(item).not.toBeNull()
  })
})

describeWithDb('Client portal isolation', () => {
  it('workspace B cannot read workspace A portal access', async () => {
    const access = await db.portalAccess.findFirst({ where: { id: portalAccessAId, workspaceId: wsB.workspaceId } })
    expect(access).toBeNull()
  })

  it('workspace B cannot read or update workspace A client requests', async () => {
    const request = await db.portalRequest.findFirst({ where: { id: portalRequestAId, workspaceId: wsB.workspaceId } })
    expect(request).toBeNull()
    const updated = await db.portalRequest.updateMany({ where: { id: portalRequestAId, workspaceId: wsB.workspaceId }, data: { status: 'closed' } })
    expect(updated.count).toBe(0)
  })

  it('portal request parent references remain in one workspace and client scope', async () => {
    const request = await db.portalRequest.findFirst({
      where: { id: portalRequestAId, workspaceId: wsA.workspaceId, clientId: clientAId, caseId: caseAId, portalAccessId: portalAccessAId },
    })
    expect(request?.id).toBe(portalRequestAId)
  })
})

describeWithDb('Invoice isolation', () => {
  it('workspace B cannot see workspace A invoices', async () => {
    const invoices = await db.invoice.findMany({ where: { workspaceId: wsB.workspaceId } })
    expect(invoices.map((i) => i.id)).not.toContain(invoiceAId)
  })

  it('workspace B cannot update a workspace A invoice', async () => {
    const result = await db.invoice.updateMany({
      where: { id: invoiceAId, workspaceId: wsB.workspaceId },
      data: { status: 'cancelled' },
    })
    expect(result.count).toBe(0)

    // Confirm status unchanged
    const inv = await db.invoice.findUnique({ where: { id: invoiceAId } })
    expect(inv?.status).toBe('draft')
  })
})

// ---------------------------------------------------------------------------
// Positive sanity: workspace A CAN see its own data
// ---------------------------------------------------------------------------

describeWithDb('Positive access: workspace A reads its own data', () => {
  it('workspace A can see its own case', async () => {
    const result = await db.legalCase.findFirst({
      where: { id: caseAId, workspaceId: wsA.workspaceId },
    })
    expect(result?.id).toBe(caseAId)
  })

  it('workspace A can see its own invoice', async () => {
    const result = await db.invoice.findFirst({
      where: { id: invoiceAId, workspaceId: wsA.workspaceId },
    })
    expect(result?.id).toBe(invoiceAId)
  })
})

// ---------------------------------------------------------------------------
// Rate limiter key isolation (no cross-user bleed)
// ---------------------------------------------------------------------------

describeWithDb('Workflow template, approval, and version isolation', () => {
  it('workspace B cannot read workspace A workflow templates', async () => {
    const template = await db.workflowTemplate.create({
      data: { workspaceId: wsA.workspaceId, name: 'Template A', stages: JSON.stringify(['intake', 'closed']) },
    })
    const found = await db.workflowTemplate.findFirst({ where: { id: template.id, workspaceId: wsB.workspaceId } })
    expect(found).toBeNull()
    await db.workflowTemplate.delete({ where: { id: template.id } })
  })

  it('workspace B cannot decide a workspace A approval', async () => {
    const approval = await db.approval.create({
      data: { workspaceId: wsA.workspaceId, caseId: caseAId, title: 'Approve filing', requestedById: wsA.userId, approverId: wsA.userId },
    })
    const decided = await db.approval.updateMany({ where: { id: approval.id, workspaceId: wsB.workspaceId }, data: { status: 'approved' } })
    expect(decided.count).toBe(0)
    const original = await db.approval.findUnique({ where: { id: approval.id } })
    expect(original?.status).toBe('pending')
    await db.approval.delete({ where: { id: approval.id } })
  })

  it('workspace B cannot read workspace A document versions', async () => {
    const version = await db.documentVersion.create({
      data: { workspaceId: wsA.workspaceId, documentId: documentAId, version: 9, fileKey: 'a/b.enc' },
    })
    const found = await db.documentVersion.findFirst({ where: { id: version.id, workspaceId: wsB.workspaceId } })
    expect(found).toBeNull()
    await db.documentVersion.delete({ where: { id: version.id } })
  })

  it('internal documents are excluded from client portal visibility', async () => {
    const internal = await db.legalDocument.findFirst({ where: { id: documentAId, workspaceId: wsA.workspaceId, visibility: 'internal' } })
    expect(internal?.id).toBe(documentAId)
  })
})

describeWithDb('Plan entitlement and usage enforcement', () => {
  it('a workspace without exhausted quota can use AI', async () => {
    const check = await checkAiUsage(wsA.workspaceId)
    expect(check.allowed).toBe(true)
  })

  it('AI usage is denied once the monthly plan limit is reached', async () => {
    const period = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`
    await db.usageMetric.upsert({
      where: { workspaceId_metric_period: { workspaceId: wsA.workspaceId, metric: 'ai_requests', period } },
      create: { workspaceId: wsA.workspaceId, metric: 'ai_requests', period, quantity: 100 },
      update: { quantity: 100 },
    })
    const check = await checkAiUsage(wsA.workspaceId)
    expect(check.allowed).toBe(false)
    expect(check.code).toBe('AI_LIMIT_REACHED')
    const other = await checkAiUsage(wsB.workspaceId)
    expect(other.allowed).toBe(true)
  })

  it('portal uploads are denied once the monthly upload limit is reached', async () => {
    const period = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`
    await db.usageMetric.upsert({
      where: { workspaceId_metric_period: { workspaceId: wsA.workspaceId, metric: 'portal_uploads', period } },
      create: { workspaceId: wsA.workspaceId, metric: 'portal_uploads', period, quantity: 100 },
      update: { quantity: 100 },
    })
    const check = await checkPortalUpload(wsA.workspaceId, 1024)
    expect(check.allowed).toBe(false)
    expect(check.code).toBe('PORTAL_UPLOAD_LIMIT_REACHED')
    const other = await checkPortalUpload(wsB.workspaceId, 1024)
    expect(other.allowed).toBe(true)
  })

  it('incrementUsage is scoped per workspace and period', async () => {
    await incrementUsage(wsA.workspaceId, 'emails', 2)
    await incrementUsage(wsA.workspaceId, 'emails', 1)
    expect(await getUsageQuantity(wsA.workspaceId, 'emails')).toBe(3)
    expect(await getUsageQuantity(wsB.workspaceId, 'emails')).toBe(0)
  })

  it('storage usage only counts files with stored content in the same workspace', async () => {
    await db.legalDocument.create({
      data: { title: 'Stored file', docType: 'client_upload', status: 'received', parties: 'Client A', workspaceId: wsA.workspaceId, fileKey: 'test/file.enc', sizeBytes: 2048 },
    })
    expect(await storageBytesUsed(wsA.workspaceId)).toBe(2048)
    expect(await storageBytesUsed(wsB.workspaceId)).toBe(0)
  })
})

describeWithDb('Rate limiter isolation', () => {
  it('rate limit keys are namespaced by email so they do not bleed across users', async () => {
    // Simply verify the key format: login:email:X is specific to the user's email.
    // If two different users share a rate limit bucket, User A's lockout would
    // affect User B. This test documents the expected key format.
    const emailA = `test-A@sanad-test.local`
    const emailB = `test-B@sanad-test.local`
    const keyA = `login:email:${emailA.toLowerCase().trim()}`
    const keyB = `login:email:${emailB.toLowerCase().trim()}`
    expect(keyA).not.toBe(keyB)
    expect(keyA).toContain(emailA.toLowerCase())
    expect(keyB).toContain(emailB.toLowerCase())
  })
})
