import { generateSecret, generateURI } from 'otplib'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { encryptMfaSecret } from '@/lib/auth/mfa'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function POST() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const user = await db.user.findUnique({ where: { id: auth.userId }, select: { email: true, mfaEnabled: true } })
  if (!user || user.mfaEnabled) return NextResponse.json({ error: 'MFA is already enabled' }, { status: 409 })
  const secret = generateSecret()
  await db.user.update({ where: { id: auth.userId }, data: { mfaSecret: encryptMfaSecret(secret), mfaRecoveryCodes: null } })
  return NextResponse.json({ secret, uri: generateURI({ issuer: 'Sanad', label: user.email, secret }) })
}
