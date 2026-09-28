import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'

const hash = (value: string) => createHash('sha256').update(value).digest('hex')

export async function POST(req: Request) {
  const { token, password } = await req.json()
  if (typeof token !== 'string' || typeof password !== 'string' || password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return NextResponse.json({ error: 'Invalid token or password policy' }, { status: 400 })
  }
  const reset = await db.passwordResetToken.findUnique({ where: { tokenHash: hash(token) } })
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) return NextResponse.json({ error: 'Token is invalid or expired' }, { status: 400 })
  const user = await db.user.findUnique({ where: { email: reset.email }, select: { id: true, workspaceId: true } })
  if (!user) return NextResponse.json({ error: 'Token is invalid or expired' }, { status: 400 })
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { password: hashPassword(password), passwordChangedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null, sessionVersion: { increment: 1 } } }),
    db.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    db.auditLog.create({ data: { workspaceId: user.workspaceId, userId: user.id, action: 'auth.password_reset', entityType: 'User', entityId: user.id } }),
  ])
  return NextResponse.json({ success: true })
}
