import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createTaskSchema } from '@/lib/validations'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const tasks = await db.task.findMany({ where: { workspaceId }, orderBy: { dueDate: 'asc' } })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const rawBody = await req.json()
    const parsed = createTaskSchema.parse(rawBody)
    if (parsed.caseId) {
      const legalCase = await db.legalCase.findFirst({ where: { id: parsed.caseId, workspaceId }, select: { id: true } })
      if (!legalCase) return notFoundJson()
    }
    const t = await db.task.create({ data: { ...parsed, workspaceId } })
    return NextResponse.json(t)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create task' }, { status: 500 })
  }
}
