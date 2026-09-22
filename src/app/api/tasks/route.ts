import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createTaskSchema } from '@/lib/validations'

export async function GET() {
  const tasks = await db.task.findMany({ orderBy: { dueDate: 'asc' } })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const parsed = createTaskSchema.parse(rawBody)
    const t = await db.task.create({ data: parsed })
    return NextResponse.json(t)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create task' }, { status: 500 })
  }
}
