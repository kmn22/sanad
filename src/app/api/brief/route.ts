import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const briefs = await db.dailyBrief.findMany({ orderBy: { publishedAt: 'desc' }, take: 12 })
    return NextResponse.json(briefs)
  } catch (error) {
    console.error('GET /api/brief failed:', error)
    return NextResponse.json({ error: 'Failed to fetch briefs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const b = await db.dailyBrief.create({ data: body })
    return NextResponse.json(b)
  } catch (error) {
    console.error('POST /api/brief failed:', error)
    return NextResponse.json({ error: 'Failed to create brief' }, { status: 500 })
  }
}
