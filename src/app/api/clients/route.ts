import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createClientSchema } from '@/lib/validations'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'
import { parsePagination, paginatedResponse } from '@/lib/http'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { limit, cursor } = parsePagination(new URL(req.url))
  const [rows, total] = await Promise.all([
    db.client.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { cases: true, documents: true, communications: true, invoices: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    db.client.count({ where: { workspaceId } }),
  ])
  return NextResponse.json(paginatedResponse(rows, limit, { total }))
}


export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createClientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }

  try {
    const client = await db.client.create({ data: { ...parsed.data, workspaceId } })
    return NextResponse.json(client)
  } catch (err) {
    // Log server-side; never echo internal/driver messages back to the caller.
    console.error('Failed to create client:', err)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
