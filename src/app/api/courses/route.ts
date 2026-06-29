import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const courses = await db.course.findMany({ include: { lectures: true, deadlines: true }, orderBy: { createdAt: 'asc' } })
    return NextResponse.json(courses)
  } catch (error) {
    console.error('GET /api/courses failed:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const c = await db.course.create({ data: body })
    return NextResponse.json(c)
  } catch (error) {
    console.error('POST /api/courses failed:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
