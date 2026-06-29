import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const cases = await db.legalCase.findMany({ orderBy: { updatedAt: 'desc' }, include: { timeEntries: true } })
    return NextResponse.json(cases)
  } catch (error) {
    console.error('GET /api/cases failed:', error)
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const c = await db.legalCase.create({ data: body })
    return NextResponse.json(c)
  } catch (error) {
    console.error('POST /api/cases failed:', error)
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}
