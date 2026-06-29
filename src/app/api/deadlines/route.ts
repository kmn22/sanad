import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const deadlines = await db.academicDeadline.findMany({ orderBy: { dueDate: 'asc' }, include: { course: true } })
    return NextResponse.json(deadlines)
  } catch (error) {
    console.error('GET /api/deadlines failed:', error)
    return NextResponse.json({ error: 'Failed to fetch deadlines' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const d = await db.academicDeadline.create({ data: body })
    return NextResponse.json(d)
  } catch (error) {
    console.error('POST /api/deadlines failed:', error)
    return NextResponse.json({ error: 'Failed to create deadline' }, { status: 500 })
  }
}
