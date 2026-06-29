import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const subject = searchParams.get('subject')
    const where = subject ? { subject } : {}
    const cases = await db.caseEntry.findMany({ where, orderBy: { rating: 'desc' } })
    return NextResponse.json(cases)
  } catch (error) {
    console.error('GET /api/casebook failed:', error)
    return NextResponse.json({ error: 'Failed to fetch casebook entries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const c = await db.caseEntry.create({ data: body })
    return NextResponse.json(c)
  } catch (error) {
    console.error('POST /api/casebook failed:', error)
    return NextResponse.json({ error: 'Failed to create casebook entry' }, { status: 500 })
  }
}
