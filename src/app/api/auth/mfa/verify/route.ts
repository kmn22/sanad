import { verifySync } from 'otplib'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decryptMfaSecret, generateRecoveryCodes, hashRecoveryCode } from '@/lib/auth/mfa'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { writeAudit } from '@/lib/audit'

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const { token } = await req.json()
  const user = await db.user.findUnique({ where: { id: auth.userId }, select: { mfaSecret: true, mfaEnabled: true } })
  if (!user?.mfaSecret || user.mfaEnabled) return NextResponse.json({ error: 'MFA setup is not pending' }, { status: 400 })
  const result = verifySync({ secret: decryptMfaSecret(user.mfaSecret), token: String(token), epochTolerance: 30 })
  if (!result.valid) return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
  const recoveryCodes = generateRecoveryCodes()
  await db.user.update({
    where: { id: auth.userId },
    data: { mfaEnabled: true, mfaRecoveryCodes: JSON.stringify(recoveryCodes.map(hashRecoveryCode)), sessionVersion: { increment: 1 } },
  })
  await writeAudit({ workspaceId: auth.workspaceId, userId: auth.userId, action: 'auth.mfa_enabled', entityType: 'User', entityId: auth.userId })
  return NextResponse.json({ success: true, recoveryCodes })
}
