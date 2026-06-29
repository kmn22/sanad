import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communicationSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
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
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = communicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const data = parsed.data
  const c = await db.communication.create({
    data: {
      ...data,
      clientId: data.clientId || null,
      caseId: data.caseId || null,
      date: data.date ? new Date(data.date) : new Date(),
      durationMin: data.durationMin || null,
    },
  })
  return NextResponse.json(c)
}
