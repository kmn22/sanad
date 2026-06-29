import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const caseId = searchParams.get('caseId')

    const where: Record<string, string> = {}
    if (clientId) where.clientId = clientId
    if (caseId) where.caseId = caseId

    const communications = await db.communication.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        case: { select: { id: true, title: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    })
    return NextResponse.json(communications)
  } catch (error) {
    console.error('GET /api/communications failed:', error)
    return NextResponse.json({ error: 'Failed to fetch communications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const c = await db.communication.create({
      data: {
        ...body,
        clientId: body.clientId || null,
        caseId: body.caseId || null,
        date: body.date ? new Date(body.date) : new Date(),
        durationMin: body.durationMin || null,
      },
    })
    return NextResponse.json(c)
  } catch (error) {
    console.error('POST /api/communications failed:', error)
    return NextResponse.json({ error: 'Failed to create communication' }, { status: 500 })
  }
}
