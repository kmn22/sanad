import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await db.client.findUnique({
      where: { id },
      include: {
        cases: { orderBy: { updatedAt: 'desc' } },
        documents: { orderBy: { updatedAt: 'desc' } },
        communications: { orderBy: { date: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(client)
  } catch (error) {
    console.error('GET /api/clients/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await db.client.update({ where: { id }, data: body })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/clients/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.client.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/clients/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
