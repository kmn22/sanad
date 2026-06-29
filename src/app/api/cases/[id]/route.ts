import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { casePatchSchema } from '@/lib/validations'

// PATCH /api/cases/:id — used for kanban drag & drop (stage change) + edits
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = casePatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const updated = await db.legalCase.update({ where: { id }, data: parsed.data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.legalCase.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
