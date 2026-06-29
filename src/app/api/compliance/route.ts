import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.complianceItem.findMany({ orderBy: { expiryDate: 'asc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/compliance failed:', error)
    return NextResponse.json({ error: 'Failed to fetch compliance items' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.complianceItem.create({ data: body })
    return NextResponse.json(item)
  } catch (error) {
    console.error('POST /api/compliance failed:', error)
    return NextResponse.json({ error: 'Failed to create compliance item' }, { status: 500 })
  }
}
