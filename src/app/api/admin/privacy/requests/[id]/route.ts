import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requestIp, writeAudit } from '@/lib/audit'
import { canManageUsers, forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

const STATUSES = new Set(['received', 'identity_verification', 'in_progress', 'extended', 'completed', 'rejected'])

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const { id } = await params
  const existing = await db.dataSubjectRequest.findFirst({ where: { id, ...(auth.role === 'admin' ? {} : { workspaceId: auth.workspaceId }) } })
  if (!existing) return notFoundJson()
  const { status, identityVerified, responseNotes, rejectionReason, extend, executeDestruction } = await req.json()
  if (status && !STATUSES.has(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  if (executeDestruction === true) {
    if (existing.requestType !== 'destruction' || !existing.identityVerified || !existing.userId) {
      return NextResponse.json({ error: 'Verified destruction request is required' }, { status: 400 })
    }
    const hold = await db.legalHold.findFirst({ where: { workspaceId: existing.workspaceId || undefined, entityType: 'User', entityId: existing.userId, releasedAt: null } })
    if (hold) return NextResponse.json({ error: 'Destruction is blocked by an active legal hold' }, { status: 409 })
    await db.$transaction([
      db.privacyAcceptance.deleteMany({ where: { userId: existing.userId } }),
      db.consentRecord.deleteMany({ where: { userId: existing.userId } }),
      db.notification.deleteMany({ where: { userId: existing.userId } }),
      db.user.update({ where: { id: existing.userId }, data: { email: `deleted-${existing.userId}@invalid.local`, name: 'Deleted User', password: null, disabledAt: new Date(), sessionVersion: { increment: 1 }, mfaSecret: null, mfaRecoveryCodes: null } }),
    ])
  }
  const updated = await db.dataSubjectRequest.update({
    where: { id },
    data: {
      status,
      identityVerified: typeof identityVerified === 'boolean' ? identityVerified : undefined,
      responseNotes: typeof responseNotes === 'string' ? responseNotes.slice(0, 8000) : undefined,
      rejectionReason: typeof rejectionReason === 'string' ? rejectionReason.slice(0, 2000) : undefined,
      assignedToId: auth.userId,
      extendedDueAt: extend === true ? new Date(existing.dueAt.getTime() + 30 * 24 * 60 * 60 * 1000) : undefined,
      completedAt: status === 'completed' || status === 'rejected' ? new Date() : undefined,
    },
  })
  await writeAudit({ workspaceId: existing.workspaceId, userId: auth.userId, action: 'privacy.request.update', entityType: 'DataSubjectRequest', entityId: id, ipAddress: requestIp(req), metadata: { status, identityVerified, extend } })
  return NextResponse.json(updated)
}
