import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createComplianceSchema } from '@/lib/validations'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'
import { parsePagination, paginatedResponse } from '@/lib/http'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { limit, cursor } = parsePagination(new URL(req.url))
  const [rows, total] = await Promise.all([
    db.complianceItem.findMany({
      where: { workspaceId },
      orderBy: { expiryDate: 'asc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    db.complianceItem.count({ where: { workspaceId } }),
  ])
  return NextResponse.json(paginatedResponse(rows, limit, { total }))
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const rawBody = await req.json()
    const parsed = createComplianceSchema.parse(rawBody)
    const item = await db.complianceItem.create({ data: { ...parsed, workspaceId } })
    return NextResponse.json(item)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create compliance item' }, { status: 500 })
  }
}
