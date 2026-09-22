import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateClientSchema } from '@/lib/validations'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  return NextResponse.json(client)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rawBody = await req.json()
    const parsed = updateClientSchema.parse(rawBody)
    const updated = await db.client.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.client.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
