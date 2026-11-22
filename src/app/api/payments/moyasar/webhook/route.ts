import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publishNotification } from '@/lib/notifications/bus'
import { verifyMoyasarWebhookSecret } from '@/lib/payments/moyasar'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const headerSecret = req.headers.get('x-moyasar-secret') || req.headers.get('x-webhook-secret')
  const providedSecret = headerSecret || (typeof body?.secret_token === 'string' ? body.secret_token : null)

  if (!verifyMoyasarWebhookSecret(providedSecret)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const payload = body?.data && typeof body.data === 'object' ? body.data : body
  const status = typeof payload?.status === 'string' ? payload.status.toLowerCase() : ''
  const metadata = (payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}) as Record<
    string,
    string
  >

  if (status !== 'paid') {
    return NextResponse.json({ received: true, ignored: true })
  }

  const workspaceId = metadata.workspaceId
  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspaceId in payment metadata' }, { status: 400 })
  }

  if (metadata.kind === 'fee_statement' && metadata.invoiceId) {
    const invoice = await db.invoice.findFirst({
      where: { id: metadata.invoiceId, workspaceId, deletedAt: null },
      select: { id: true, number: true, total: true, status: true },
    })
    if (invoice && invoice.status !== 'paid') {
      await db.$transaction([
        db.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
            paidAmount: Number(invoice.total),
          },
        }),
        db.auditLog.create({
          data: {
            workspaceId,
            action: 'invoice.moyasar_paid',
            entityType: 'Invoice',
            entityId: invoice.id,
            metadata: JSON.stringify({ moyasarId: payload?.id || null }),
          },
        }),
      ])

      const owners = await db.user.findMany({
        where: { workspaceId, role: { in: ['workspace_owner', 'admin'] }, disabledAt: null },
        select: { id: true },
      })
      if (owners.length > 0) {
        await publishNotification(
          workspaceId,
          owners.map((o) => o.id),
          {
            type: 'billing',
            title: 'تم سداد بيان أتعاب إلكترونياً',
            body: `تم تحصيل البيان رقم ${invoice.number} بقيمة ${Number(invoice.total).toLocaleString('ar-SA')} ر.س عبر مدى / Apple Pay.`,
            link: '/lawyer/invoices',
            entityType: 'Invoice',
            entityId: invoice.id,
          }
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
