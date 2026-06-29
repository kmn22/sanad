import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await db.lecture.update({ where: { id }, data: body })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/lectures/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to update lecture' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.lecture.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/lectures/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to delete lecture' }, { status: 500 })
  }
}
