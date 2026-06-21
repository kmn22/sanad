import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const where = courseId ? { courseId } : {}
  const lectures = await db.lecture.findMany({ where, orderBy: { lectureDate: 'desc' }, include: { course: true } })
  return NextResponse.json(lectures)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const l = await db.lecture.create({ data: body })
  return NextResponse.json(l)
}
