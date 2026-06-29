import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/cases/:id — used for kanban drag & drop (stage change) + edits
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await db.legalCase.update({ where: { id }, data: body })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/cases/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.legalCase.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/cases/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 })
  }
}
