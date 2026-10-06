import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

// GET → portal account status for this client (accounts + pending invite).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const { id } = await params
  const client = await db.client.findFirst({ where: { id, workspaceId: auth.workspaceId }, select: { id: true } })
  if (!client) return notFoundJson()
  const [accounts, invitation] = await Promise.all([
    db.user.findMany({ where: { clientId: client.id, workspaceId: auth.workspaceId, role: 'client' }, select: { id: true, email: true, disabledAt: true, createdAt: true } }),
    db.invitation.findFirst({
      where: { clientId: client.id, workspaceId: auth.workspaceId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { email: true, expiresAt: true },
    }),
  ])
  return NextResponse.json({ accounts, invitation })
}

// POST { email?, sendEmail? } → invite this client to create a portal login.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner', 'lawyer'].includes(auth.role)) return forbiddenJson()
  const limited = await rateLimit(`client-invite:${auth.userId}`, 30, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { id } = await params
  const client = await db.client.findFirst({ where: { id, workspaceId: auth.workspaceId }, select: { id: true, name: true, email: true } })
  if (!client) return notFoundJson()

  const body = await req.json().catch(() => null)
  const cleanEmail = (typeof body?.email === 'string' && body.email ? body.email : client.email || '').toLowerCase().trim()
  if (!cleanEmail.includes('@')) {
    return NextResponse.json({ error: 'الموكّل لا يملك بريداً إلكترونياً صالحاً' }, { status: 400 })
  }
  if (await db.user.findUnique({ where: { email: cleanEmail }, select: { id: true } })) {
    return NextResponse.json({ error: 'هذا البريد مسجل بالفعل' }, { status: 409 })
  }

  const token = randomBytes(32).toString('hex')
  const url = publicAppUrl(`/register?invite=${encodeURIComponent(token)}`)
  await db.$transaction(async (tx) => {
    await tx.invitation.deleteMany({ where: { workspaceId: auth.workspaceId, clientId: client.id, acceptedAt: null } })
    const created = await tx.invitation.create({
      data: {
        tokenHash: hashToken(token),
        email: cleanEmail,
        role: 'client',
        clientId: client.id,
        workspaceId: auth.workspaceId,
        createdById: auth.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    await tx.auditLog.create({
      data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'client.portal.invite', entityType: 'Client', entityId: client.id, metadata: JSON.stringify({ invitationId: created.id }) },
    })
  })

  let delivery: 'manual' | 'email' = 'manual'
  if (body?.sendEmail !== false && emailConfigured()) {
    await sendTransactionalEmail({
      to: cleanEmail,
      subject: 'دعوة إلى بوابة الموكّل — سند',
      heading: 'بوابة الموكّل الآمنة',
      text: `مرحباً ${client.name}، دعاك مكتب المحاماة لإنشاء حساب في بوابة الموكّل لمتابعة قضاياك وفواتيرك ورفع المستندات. تنتهي صلاحية الرابط خلال سبعة أيام.`,
      actionUrl: url,
      actionLabel: 'إنشاء الحساب',
    })
    delivery = 'email'
  }

  return NextResponse.json({ url, delivery, email: cleanEmail }, { status: 201 })
}
