import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner'].includes(auth.role)) return forbiddenJson()
  const { id } = await params
  const invitation = await db.invitation.findFirst({
    where: { id, workspaceId: auth.workspaceId, acceptedAt: null },
    select: { id: true, email: true, role: true },
  })
  if (!invitation) return notFoundJson()
  await db.$transaction(async (tx) => {
    await tx.invitation.delete({ where: { id: invitation.id } })
    await tx.auditLog.create({
      data: {
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        action: 'invitation.revoke',
        entityType: 'Invitation',
        entityId: invitation.id,
        metadata: JSON.stringify({ email: invitation.email, role: invitation.role }),
      },
    })
  })
  return NextResponse.json({ ok: true })
}
