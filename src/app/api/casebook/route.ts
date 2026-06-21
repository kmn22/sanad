import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const where = subject ? { subject } : {}
  const cases = await db.caseEntry.findMany({ where, orderBy: { rating: 'desc' } })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const c = await db.caseEntry.create({ data: body })
  return NextResponse.json(c)
}
