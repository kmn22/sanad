import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  const limited = await rateLimit(`invite:preview:${req.headers.get('x-forwarded-for') || 'unknown'}`, 30, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!/^[a-f0-9]{64}$/i.test(token)) return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 })
  const invitation = await db.invitation.findUnique({
    where: { tokenHash: createHash('sha256').update(token).digest('hex') },
    include: { workspace: { select: { name: true } } },
  })
  if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
    return NextResponse.json({ error: 'Invitation is invalid or expired' }, { status: 404 })
  }
  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    workspaceName: invitation.workspace.name,
    expiresAt: invitation.expiresAt,
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}
