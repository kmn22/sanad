import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
  const { id } = await params
  const body = await req.json()
  const updated = await db.client.update({ where: { id }, data: body })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.client.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
