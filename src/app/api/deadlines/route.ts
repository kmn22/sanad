import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const deadlines = await db.academicDeadline.findMany({ orderBy: { dueDate: 'asc' }, include: { course: true } })
  return NextResponse.json(deadlines)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const d = await db.academicDeadline.create({ data: body })
  return NextResponse.json(d)
}
