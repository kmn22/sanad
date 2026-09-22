import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createClientSchema } from '@/lib/validations'

export async function GET() {
  const clients = await db.client.findMany({
    include: {
      cases: { select: { id: true, title: true, stage: true } },
      _count: { select: { cases: true, documents: true, communications: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const parsed = createClientSchema.parse(rawBody)
    const client = await db.client.create({ data: parsed })
    return NextResponse.json(client)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create client' }, { status: 500 })
  }
}
