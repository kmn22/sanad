import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const tasks = await db.task.findMany({ orderBy: { dueDate: 'asc' } })
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks failed:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const t = await db.task.create({ data: body })
    return NextResponse.json(t)
  } catch (error) {
    console.error('POST /api/tasks failed:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
