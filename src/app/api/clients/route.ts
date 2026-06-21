import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
  const client = await db.client.create({ data: body })
  return NextResponse.json(client)
}
