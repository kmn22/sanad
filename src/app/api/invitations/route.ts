import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
const ALLOWED_ROLES = new Set(['lawyer', 'staff', 'student', 'auditor'])

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner'].includes(auth.role)) return forbiddenJson()
  const invitations = await db.invitation.findMany({
    where: { workspaceId: auth.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, email: true, role: true, expiresAt: true, acceptedAt: true, createdAt: true },
  })
  return NextResponse.json(invitations)
}

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner'].includes(auth.role)) return forbiddenJson()
  const limited = await rateLimit(`invitation:create:${auth.userId}`, 30, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const cleanEmail = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
  const role = body?.role || 'staff'
  const sendEmail = body?.sendEmail !== false
  if (!cleanEmail.includes('@') || !ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 })
  }
  if (await db.user.findUnique({ where: { email: cleanEmail }, select: { id: true } })) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 })
  }

  const token = randomBytes(32).toString('hex')
  const url = publicAppUrl(`/register?invite=${encodeURIComponent(token)}`)
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

  let delivery: 'manual' | 'email' = 'manual'
  if (sendEmail && emailConfigured()) {
    await sendTransactionalEmail({
      to: cleanEmail,
      subject: 'دعوة للانضمام إلى سند',
      heading: 'دعوة إلى مساحة عمل سند',
      text: 'تلقيت دعوة لإنشاء حساب وإعداد عضويتك. تنتهي صلاحية الرابط خلال سبعة أيام ويمكن استخدامه مرة واحدة فقط.',
      actionUrl: url,
      actionLabel: 'إعداد الحساب',
    })
    delivery = 'email'
  }

  return NextResponse.json({
    invitation: { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt },
    url,
    delivery,
  }, { status: 201 })
}
