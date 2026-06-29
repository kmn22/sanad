import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await db.task.update({ where: { id }, data: body })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/tasks/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.task.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/tasks/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
