import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner'].includes(auth.role)) return forbiddenJson()
  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const domain = typeof body?.domain === 'string' ? body.domain.trim().toLowerCase().slice(0, 253) : ''
  if (name.length < 2 || (domain && !/^(?!-)(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(domain))) {
    return NextResponse.json({ error: 'Invalid workspace name or domain' }, { status: 400 })
  }
  try {
    const workspace = await db.$transaction(async (tx) => {
      const updated = await tx.workspace.update({ where: { id: auth.workspaceId }, data: { name, domain: domain || null }, select: { id: true, name: true, domain: true, type: true } })
      await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'workspace.update', entityType: 'Workspace', entityId: auth.workspaceId } })
      return updated
    })
    return NextResponse.json(workspace)
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'Domain is already assigned to another workspace' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 })
  }
}
