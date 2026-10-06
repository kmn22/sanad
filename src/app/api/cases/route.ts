import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCaseSchema } from '@/lib/validations'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { parsePagination, paginatedResponse } from '@/lib/http'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { limit, cursor } = parsePagination(new URL(req.url))
  const [rows, total] = await Promise.all([
    db.legalCase.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { timeEntries: true } } },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    db.legalCase.count({ where: { workspaceId } }),
  ])
  return NextResponse.json(paginatedResponse(rows, limit, { total }))
}


export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createCaseSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }

  try {
    if (parsed.data.clientId) {
      const client = await db.client.findFirst({ where: { id: parsed.data.clientId, workspaceId }, select: { id: true } })
      if (!client) return notFoundJson()
    }
    const c = await db.legalCase.create({ data: { ...parsed.data, workspaceId } })
    return NextResponse.json(c)
  } catch (err) {
    console.error('Failed to create case:', err)
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}
