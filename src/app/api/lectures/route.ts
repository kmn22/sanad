import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCreateHandler } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const where = courseId ? { courseId } : {}
  const lectures = await db.lecture.findMany({ where, orderBy: { lectureDate: 'desc' }, include: { course: true } })
  return NextResponse.json(lectures)
}

export const POST = createCreateHandler('lecture')
