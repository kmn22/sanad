import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateClientSchema } from '@/lib/validations'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const client = await db.client.findFirst({
    where: { id, workspaceId },
    include: {
      cases: { where: { workspaceId }, orderBy: { updatedAt: 'desc' } },
      documents: { where: { workspaceId }, orderBy: { updatedAt: 'desc' } },
      communications: { orderBy: { date: 'desc' } },
      invoices: { where: { workspaceId }, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!client) return notFoundJson()
  return NextResponse.json(client)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const { id } = await params
    const parsed = updateClientSchema.parse(await req.json())
    const existing = await db.client.findFirst({ where: { id, workspaceId }, select: { id: true } })
    if (!existing) return notFoundJson()
    const updated = await db.client.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const result = await db.client.deleteMany({ where: { id, workspaceId } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ ok: true })
}
