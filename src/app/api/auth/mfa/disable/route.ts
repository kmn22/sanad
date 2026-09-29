import { verifySync } from 'otplib'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decryptMfaSecret, hashRecoveryCode } from '@/lib/auth/mfa'
import { verifyPassword } from '@/lib/auth/password'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { rateLimit } from '@/lib/rate-limit'
import { requestIp, writeAudit } from '@/lib/audit'

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (auth.role === 'admin' || auth.role === 'workspace_owner') {
    return NextResponse.json({ error: 'MFA is required for privileged accounts' }, { status: 400 })
  }
  const limited = await rateLimit(`mfa-disable:${auth.userId}`, 5, 15 * 60 * 1000, 30 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })

  const { password, otp } = await req.json()
  if (typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
  }
  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, workspaceId: true, password: true, mfaEnabled: true, mfaSecret: true, mfaRecoveryCodes: true },
  })
  if (!user?.password || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }
  if (!user.mfaEnabled || !user.mfaSecret) return NextResponse.json({ error: 'MFA is not enabled' }, { status: 400 })

  const token = typeof otp === 'string' ? otp.replace(/\s/g, '').toUpperCase() : ''
  const totpValid = /^\d{6}$/.test(token) && verifySync({ secret: decryptMfaSecret(user.mfaSecret), token, epochTolerance: 30 }).valid
  const recoveryCodes: string[] = user.mfaRecoveryCodes ? JSON.parse(user.mfaRecoveryCodes) : []
  const recoveryIndex = recoveryCodes.indexOf(hashRecoveryCode(token))
  if (!totpValid && recoveryIndex < 0) return NextResponse.json({ error: 'Authenticator or recovery code is required' }, { status: 400 })
  if (recoveryIndex >= 0) recoveryCodes.splice(recoveryIndex, 1)

  await db.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaRecoveryCodes: null,
      sessionVersion: { increment: 1 },
    },
  })
  await writeAudit({
    workspaceId: user.workspaceId,
    userId: user.id,
    action: 'auth.mfa_disabled',
    entityType: 'User',
    entityId: user.id,
    ipAddress: requestIp(req),
  })
  return NextResponse.json({ success: true })
}
