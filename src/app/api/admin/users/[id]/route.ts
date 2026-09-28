import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requestIp, writeAudit } from '@/lib/audit'
import { canManageUsers, forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

const ASSIGNABLE_ROLES = new Set(['lawyer', 'staff', 'student', 'auditor'])

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const { id } = await params
  const target = await db.user.findFirst({
    where: { id, ...(auth.role === 'admin' ? {} : { workspaceId: auth.workspaceId }) },
  })
  if (!target) return notFoundJson()

  const { role, disabled, revokeSessions, unlock } = await req.json()
  if (role !== undefined && !ASSIGNABLE_ROLES.has(role)) {
    return NextResponse.json({ error: 'Role is not assignable' }, { status: 400 })
  }
  if (id === auth.userId && (disabled === true || role !== undefined)) {
    return NextResponse.json({ error: 'You cannot disable or change your own role' }, { status: 400 })
  }

  const updated = await db.user.update({
    where: { id },
    data: {
      role,
      disabledAt: disabled === undefined ? undefined : disabled ? new Date() : null,
      sessionVersion: revokeSessions || disabled ? { increment: 1 } : undefined,
      lockedUntil: unlock ? null : undefined,
      failedLoginAttempts: unlock ? 0 : undefined,
    },
    select: { id: true, email: true, name: true, role: true, disabledAt: true, lockedUntil: true, sessionVersion: true },
  })

  await writeAudit({
    workspaceId: target.workspaceId,
    userId: auth.userId,
    action: 'admin.user.update',
    entityType: 'User',
    entityId: target.id,
    ipAddress: requestIp(req),
    metadata: { role, disabled, revokeSessions: Boolean(revokeSessions), unlock: Boolean(unlock) },
  })
  return NextResponse.json(updated)
}
