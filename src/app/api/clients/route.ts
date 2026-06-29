import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clientSchema } from '@/lib/validations'

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
  const body = await req.json()
  const parsed = clientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const client = await db.client.create({ data: parsed.data })
  return NextResponse.json(client)
}
