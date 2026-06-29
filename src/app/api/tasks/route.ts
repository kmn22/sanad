import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { taskSchema } from '@/lib/validations'

export async function GET() {
  const tasks = await db.task.findMany({ orderBy: { dueDate: 'asc' } })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = taskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const t = await db.task.create({ data: parsed.data })
  return NextResponse.json(t)
}
