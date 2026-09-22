import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateDocumentSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rawBody = await req.json()
    const parsed = updateDocumentSchema.parse(rawBody)
    const updated = await db.legalDocument.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.legalDocument.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
