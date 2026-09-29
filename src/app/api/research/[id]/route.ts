import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const existing = await db.researchItem.findFirst({ where: { id, workspaceId }, select: { id: true } })
  if (!existing) return notFoundJson()
  const body = await req.json()
  if (body.caseId) {
    const legalCase = await db.legalCase.findFirst({ where: { id: body.caseId, workspaceId }, select: { id: true } })
    if (!legalCase) return notFoundJson()
  }
  const item = await db.researchItem.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      isPinned: body.isPinned === undefined ? undefined : Boolean(body.isPinned),
      notes: body.notes,
      tags: body.tags,
      caseId: body.caseId,
      category: body.category,
    },
  })
  return NextResponse.json({ success: true, item })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const result = await db.researchItem.deleteMany({ where: { id, workspaceId } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ success: true })
}
