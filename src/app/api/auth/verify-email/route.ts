import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export async function POST(req: Request) {
  const { token } = await req.json()
  if (typeof token !== 'string') return NextResponse.json({ error: 'Invalid token' }, { status: 400 })

  const verification = await db.verificationToken.findUnique({ where: { tokenHash: hashToken(token) } })
  if (!verification || verification.expiresAt <= new Date()) {
    return NextResponse.json({ error: 'Token is invalid or expired' }, { status: 400 })
  }

  await db.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { email: verification.email }, data: { emailVerified: new Date() } })
    await tx.verificationToken.deleteMany({ where: { email: verification.email } })
    await tx.auditLog.create({
      data: { workspaceId: user.workspaceId, userId: user.id, action: 'auth.email_verified', entityType: 'User', entityId: user.id },
    })
  })

  return NextResponse.json({ success: true })
}
