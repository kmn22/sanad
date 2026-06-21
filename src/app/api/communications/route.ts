import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const caseId = searchParams.get('caseId')

  const where: any = {}
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
}

export async function POST(req: NextRequest) {
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
}
