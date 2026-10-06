import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner'].includes(auth.role)) return forbiddenJson()
  const body = await req.json().catch(() => null)
  const status = body?.status
  if (!['in_progress', 'completed'].includes(status)) return NextResponse.json({ error: 'Invalid onboarding status' }, { status: 400 })
  const workspace = await db.$transaction(async (tx) => {
    const updated = await tx.workspace.update({ where: { id: auth.workspaceId }, data: { onboardingStatus: status }, select: { id: true, onboardingStatus: true } })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'workspace.onboarding.update', entityType: 'Workspace', entityId: auth.workspaceId, metadata: JSON.stringify({ status }) } })
    return updated
  })
  return NextResponse.json(workspace)
}
