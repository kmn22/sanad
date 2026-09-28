import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const existing = await db.legalTerm.findFirst({ where: { id, workspaceId }, select: { id: true } })
  if (!existing) return notFoundJson()
  const body = await req.json()
  const updated = await db.legalTerm.update({ where: { id }, data: { ...body, id: undefined, workspaceId: undefined } })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const result = await db.legalTerm.deleteMany({ where: { id, workspaceId } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ ok: true })
}
