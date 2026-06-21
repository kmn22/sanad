import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const entries = await db.timeEntry.findMany({
    orderBy: { date: 'desc' },
    take: 50,
    include: { case: true },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const te = await db.timeEntry.create({ data: body })
  return NextResponse.json(te)
}
