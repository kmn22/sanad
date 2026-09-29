import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createClientSchema } from '@/lib/validations'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const clients = await db.client.findMany({
    where: { workspaceId },
    include: {
      cases: { select: { id: true, title: true, stage: true } },
      _count: { select: { cases: true, documents: true, communications: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(clients)
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
