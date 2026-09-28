import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
const ALLOWED_ROLES = new Set(['lawyer', 'staff', 'student', 'auditor'])

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner'].includes(auth.role)) return forbiddenJson()

  const { email, role = 'staff' } = await req.json()
  const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : ''
  if (!cleanEmail.includes('@') || !ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 })
  }
  if (await db.user.findUnique({ where: { email: cleanEmail }, select: { id: true } })) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 })
  }

  const token = randomBytes(32).toString('hex')
  const invitation = await db.$transaction(async (tx) => {
    await tx.invitation.deleteMany({ where: { email: cleanEmail, workspaceId: auth.workspaceId, acceptedAt: null } })
    const created = await tx.invitation.create({
      data: {
        tokenHash: hashToken(token),
        email: cleanEmail,
        role,
        workspaceId: auth.workspaceId,
        createdById: auth.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    await tx.auditLog.create({
      data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'invitation.create', entityType: 'Invitation', entityId: created.id },
    })
    return created
  })

  return NextResponse.json({
    invitation: { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt },
    token,
    delivery: 'manual',
  }, { status: 201 })
}
