import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const tasks = await db.task.findMany({ orderBy: { dueDate: 'asc' } })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const t = await db.task.create({ data: body })
  return NextResponse.json(t)
}
