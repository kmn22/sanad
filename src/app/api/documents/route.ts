import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const docs = await db.legalDocument.findMany({ orderBy: { updatedAt: 'desc' } })
    return NextResponse.json(docs)
  } catch (error) {
    console.error('GET /api/documents failed:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const doc = await db.legalDocument.create({ data: body })
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
          },
        })
      }
    }
    return NextResponse.json(doc)
  } catch (error) {
    console.error('POST /api/documents failed:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
