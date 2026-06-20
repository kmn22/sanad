import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const courses = await db.course.findMany({ include: { lectures: true, deadlines: true }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const c = await db.course.create({ data: body })
  return NextResponse.json(c)
}
