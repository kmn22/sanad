import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createDocumentSchema } from '@/lib/validations'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { parsePagination, paginatedResponse } from '@/lib/http'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { limit, cursor } = parsePagination(new URL(req.url))
  const [rows, total] = await Promise.all([
    db.legalDocument.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    db.legalDocument.count({ where: { workspaceId } }),
  ])
  return NextResponse.json(paginatedResponse(rows, limit, { total }))
}


export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const rawBody = await req.json()
    const parsed = createDocumentSchema.parse(rawBody)
    if (parsed.clientId) {
      const client = await db.client.findFirst({ where: { id: parsed.clientId, workspaceId }, select: { id: true } })
      if (!client) return notFoundJson()
    }
    if (parsed.caseId) {
      const legalCase = await db.legalCase.findFirst({ where: { id: parsed.caseId, workspaceId }, select: { id: true } })
      if (!legalCase) return notFoundJson()
    }
    const doc = await db.legalDocument.create({ data: { ...parsed, workspaceId } })
    // Auto-generate follow-up task when a doc is created
  if (doc.docType === 'nda' && doc.status === 'sent') {
    const due = new Date()
    due.setDate(due.getDate() + 3)
    await db.task.create({
      data: {
        title: `Follow up on ${doc.title} signature`,
        description: `${doc.title} sent — chase signature in 3 days`,
        status: 'todo',
        priority: 'high',
        dueDate: due,
        relatedDoc: doc.title,
        autoGen: true,
        workspaceId,
      },
    })
  }
  if (doc.expiryDate && (doc.docType === 'employment' || doc.docType === 'non_compete')) {
    const due = new Date(doc.expiryDate)
    due.setDate(due.getDate() - 30)
    if (due > new Date()) {
      await db.task.create({
        data: {
          title: `Renew ${doc.title}`,
          description: `${doc.title} expires ${doc.expiryDate.toISOString().slice(0, 10)}`,
          status: 'todo',
          priority: 'normal',
          dueDate: due,
          relatedDoc: doc.title,
          autoGen: true,
          workspaceId,
        },
      })
    }
  }
    return NextResponse.json(doc)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create document' }, { status: 500 })
  }
}
