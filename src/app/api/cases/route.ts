import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCaseSchema } from '@/lib/validations'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const cases = await db.legalCase.findMany({ where: { workspaceId }, orderBy: { updatedAt: 'desc' }, include: { timeEntries: true } })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const rawBody = await req.json()
    const parsed = createCaseSchema.parse(rawBody)
    if (parsed.clientId) {
      const client = await db.client.findFirst({ where: { id: parsed.clientId, workspaceId }, select: { id: true } })
      if (!client) return notFoundJson()
    }
    const c = await db.legalCase.create({ data: { ...parsed, workspaceId } })
    return NextResponse.json(c)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create case' }, { status: 500 })
  }
}
