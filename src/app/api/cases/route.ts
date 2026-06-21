import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const cases = await db.legalCase.findMany({ orderBy: { updatedAt: 'desc' }, include: { timeEntries: true } })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const c = await db.legalCase.create({ data: body })
  return NextResponse.json(c)
}
