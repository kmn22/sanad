import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createDocumentSchema } from '@/lib/validations'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const docs = await db.legalDocument.findMany({ where: { workspaceId }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const rawBody = await req.json()
    const parsed = createDocumentSchema.parse(rawBody)
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
