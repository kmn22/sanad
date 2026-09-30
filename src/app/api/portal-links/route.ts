import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'
import { hashPortalToken } from '@/lib/portal'
import { rateLimit } from '@/lib/rate-limit'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner', 'lawyer'].includes(auth.role)) return forbiddenJson()
  const links = await db.portalAccess.findMany({
    where: { workspaceId: auth.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      client: { select: { id: true, name: true, email: true } },
      case: { select: { id: true, title: true, stage: true } },
      _count: { select: { files: true, requests: true } },
    },
  })
  return NextResponse.json(links.map(({ tokenHash: _tokenHash, ...link }) => link))
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!['admin', 'workspace_owner', 'lawyer'].includes(auth.role)) return forbiddenJson()
  const limited = await rateLimit(`portal-link:create:${auth.userId}`, 20, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const clientId = typeof body?.clientId === 'string' ? body.clientId : ''
  const caseId = typeof body?.caseId === 'string' && body.caseId ? body.caseId : null
  const label = typeof body?.label === 'string' ? body.label.trim().slice(0, 120) : null
  const days = Number(body?.days || 30)
  const allowUpload = body?.allowUpload !== false
  if (!clientId || !Number.isFinite(days) || days < 1 || days > 90) {
    return NextResponse.json({ error: 'Invalid client or expiry' }, { status: 400 })
  }

  const client = await db.client.findFirst({ where: { id: clientId, workspaceId: auth.workspaceId }, select: { id: true, name: true, email: true } })
  if (!client) return notFoundJson()
  if (caseId) {
    const legalCase = await db.legalCase.findFirst({ where: { id: caseId, workspaceId: auth.workspaceId }, select: { id: true, clientId: true } })
    if (!legalCase || (legalCase.clientId && legalCase.clientId !== client.id)) return notFoundJson()
  }

  const token = randomBytes(32).toString('hex')
  const access = await db.$transaction(async (tx) => {
    const created = await tx.portalAccess.create({
      data: {
        workspaceId: auth.workspaceId,
        clientId: client.id,
        caseId,
        tokenHash: hashPortalToken(token),
        label,
        allowUpload,
        expiresAt: new Date(Date.now() + Math.floor(days) * 24 * 60 * 60 * 1000),
        createdById: auth.userId,
      },
    })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'portal.link.create', entityType: 'PortalAccess', entityId: created.id } })
    return created
  })

  const url = publicAppUrl(`/portal/${token}`)
  let delivery: 'manual' | 'email' = 'manual'
  if (client.email && body?.sendEmail === true && emailConfigured()) {
    await sendTransactionalEmail({
      to: client.email,
      subject: 'رابط بوابة العميل الآمنة',
      heading: 'بوابة متابعة القضية',
      text: 'يمكنك استخدام هذا الرابط لرفع الملفات المطلوبة ومتابعة حالة الطلب. لا تشارك الرابط مع أي شخص آخر.',
      actionUrl: url,
      actionLabel: 'فتح البوابة',
    })
    delivery = 'email'
  }

  return NextResponse.json({
    portal: { id: access.id, clientId: access.clientId, caseId: access.caseId, expiresAt: access.expiresAt, allowUpload: access.allowUpload },
    url,
    delivery,
  }, { status: 201 })
}
