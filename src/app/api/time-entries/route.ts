import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const entries = await db.timeEntry.findMany({
      orderBy: { date: 'desc' },
      take: 50,
      include: { case: true },
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('GET /api/time-entries failed:', error)
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const te = await db.timeEntry.create({ data: body })
    return NextResponse.json(te)
  } catch (error) {
    console.error('POST /api/time-entries failed:', error)
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 })
  }
}
