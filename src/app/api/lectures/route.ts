import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    const where = courseId ? { courseId } : {}
    const lectures = await db.lecture.findMany({ where, orderBy: { lectureDate: 'desc' }, include: { course: true } })
    return NextResponse.json(lectures)
  } catch (error) {
    console.error('GET /api/lectures failed:', error)
    return NextResponse.json({ error: 'Failed to fetch lectures' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const l = await db.lecture.create({ data: body })
    return NextResponse.json(l)
  } catch (error) {
    console.error('POST /api/lectures failed:', error)
    return NextResponse.json({ error: 'Failed to create lecture' }, { status: 500 })
  }
}
