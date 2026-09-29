import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { updateDocumentSchema } from '@/lib/validations'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const { id } = await params
    const parsed = updateDocumentSchema.parse(await req.json())
    const existing = await db.legalDocument.findFirst({ where: { id, workspaceId }, select: { id: true } })
    if (!existing) return notFoundJson()
    if (parsed.clientId) {
      const client = await db.client.findFirst({ where: { id: parsed.clientId, workspaceId }, select: { id: true } })
      if (!client) return notFoundJson()
    }
    if (parsed.caseId) {
      const legalCase = await db.legalCase.findFirst({ where: { id: parsed.caseId, workspaceId }, select: { id: true } })
      if (!legalCase) return notFoundJson()
    }
    const updated = await db.legalDocument.update({ where: { id }, data: parsed })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const result = await db.legalDocument.deleteMany({ where: { id, workspaceId } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ ok: true })
}
