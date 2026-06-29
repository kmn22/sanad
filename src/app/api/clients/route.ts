import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const clients = await db.client.findMany({
      include: {
        cases: { select: { id: true, title: true, stage: true } },
        _count: { select: { cases: true, documents: true, communications: true, invoices: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error('GET /api/clients failed:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const client = await db.client.create({ data: body })
    return NextResponse.json(client)
  } catch (error) {
    console.error('POST /api/clients failed:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
