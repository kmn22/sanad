import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communicationWorkspaceWhere, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const existing = await db.communication.findFirst({
    where: { id, ...communicationWorkspaceWhere(workspaceId) },
    select: { id: true },
  })
  if (!existing) return notFoundJson()
  const body = await req.json()
  const updated = await db.communication.update({
    where: { id },
    data: {
      subject: body.subject,
      body: body.body,
      type: body.type,
      direction: body.direction,
      date: body.date ? new Date(body.date) : undefined,
      durationMin: body.durationMin ?? undefined,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const existing = await db.communication.findFirst({
    where: { id, ...communicationWorkspaceWhere(workspaceId) },
    select: { id: true },
  })
  if (!existing) return notFoundJson()
  await db.communication.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
