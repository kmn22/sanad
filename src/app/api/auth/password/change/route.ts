import { verifySync } from 'otplib'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decryptMfaSecret } from '@/lib/auth/mfa'
import { hashPassword, isStrongPassword, verifyPassword } from '@/lib/auth/password'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { rateLimit } from '@/lib/rate-limit'
import { requestIp, writeAudit } from '@/lib/audit'

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const limited = await rateLimit(`password-change:${auth.userId}`, 5, 15 * 60 * 1000, 30 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })

  const { currentPassword, newPassword, otp } = await req.json()
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !isStrongPassword(newPassword)) {
    return NextResponse.json({ error: 'Password does not meet the security policy' }, { status: 400 })
  }
  if (currentPassword === newPassword) {
    return NextResponse.json({ error: 'New password must be different' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, workspaceId: true, password: true, mfaEnabled: true, mfaSecret: true },
  })
  if (!user?.password || !verifyPassword(currentPassword, user.password)) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }
  if (user.mfaEnabled) {
    const token = typeof otp === 'string' ? otp.replace(/\s/g, '') : ''
    const valid = user.mfaSecret && verifySync({ secret: decryptMfaSecret(user.mfaSecret), token, epochTolerance: 30 }).valid
    if (!valid) return NextResponse.json({ error: 'Current authenticator code is required' }, { status: 400 })
  }

  await db.user.update({
    where: { id: auth.userId },
    data: {
      password: hashPassword(newPassword),
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
      sessionVersion: { increment: 1 },
    },
  })
  await writeAudit({
    workspaceId: user.workspaceId,
    userId: user.id,
    action: 'auth.password_changed',
    entityType: 'User',
    entityId: user.id,
    ipAddress: requestIp(req),
  })
  return NextResponse.json({ success: true })
}
