import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext } from '@/lib/auth/workspace'
import { getPortalAccess } from '@/lib/portal'
import { publicAppUrl } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { createMoyasarInvoice, isMoyasarConfigured } from '@/lib/payments/moyasar'

const PLAN_PRICES_SAR: Record<'solo' | 'office', { monthly: number; yearly: number; nameAr: string }> = {
  solo: { monthly: 199, yearly: 159 * 12, nameAr: 'باقة المحامي المستقل — مقر' },
  office: { monthly: 449, yearly: 359 * 12, nameAr: 'باقة المكتب الصغير — مقر' },
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const limited = await rateLimit(`moyasar:checkout:${ip}`, 20, 15 * 60 * 1000)
  if (!limited.success) {
    return NextResponse.json({ error: 'Too many checkout requests' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const portalToken = typeof body?.portalToken === 'string' ? body.portalToken.trim() : ''
  const invoiceId = typeof body?.invoiceId === 'string' ? body.invoiceId.trim() : ''
  const planId = body?.planId === 'solo' || body?.planId === 'office' ? (body.planId as 'solo' | 'office') : null
  const cycle = body?.cycle === 'monthly' ? 'monthly' : 'yearly'

  // Case 1: Client Portal Fee Statement Checkout
  if (portalToken && invoiceId) {
    const access = await getPortalAccess(portalToken)
    if (!access) {
      return NextResponse.json({ error: 'Portal link is invalid or expired' }, { status: 404 })
    }
    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        workspaceId: access.workspaceId,
        clientId: access.clientId,
        deletedAt: null,
      },
      select: { id: true, number: true, total: true, status: true },
    })
    if (!invoice) {
      return NextResponse.json({ error: 'Fee statement not found' }, { status: 404 })
    }
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Fee statement is already paid' }, { status: 409 })
    }

    if (!isMoyasarConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          code: 'MOYASAR_NOT_CONFIGURED',
          bankTransferAvailable: true,
          message:
            'بوابة الدفع الإلكتروني (Moyasar — مدى / Apple Pay) غير مفعّلة لهذا المكتب حالياً. يمكنك السداد عبر التحويل البنكي وإشعار المكتب مباشرة.',
        },
        { status: 503 }
      )
    }

    try {
      const moyasarInv = await createMoyasarInvoice({
        amountSar: Number(invoice.total),
        description: `سداد بيان أتعاب رقم ${invoice.number} — ${access.workspace.name}`,
        callbackUrl: publicAppUrl(`/portal/${portalToken}`),
        metadata: {
          kind: 'fee_statement',
          workspaceId: access.workspaceId,
          invoiceId: invoice.id,
          clientId: access.clientId,
        },
      })
      return NextResponse.json({
        configured: true,
        checkoutUrl: moyasarInv.url,
        moyasarInvoiceId: moyasarInv.id,
      })
    } catch {
      return NextResponse.json(
        { error: 'تعذر الاتصال ببوابة الدفع الإلكتروني حالياً، يرجى المحاولة لاحقاً أو التحويل البنكي' },
        { status: 502 }
      )
    }
  }

  // Case 2: Authenticated Workspace Plan Subscription Checkout
  if (planId) {
    const auth = await getAuthContext()
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const plan = PLAN_PRICES_SAR[planId]
    const amountSar = cycle === 'yearly' ? plan.yearly : plan.monthly

    if (!isMoyasarConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          code: 'MOYASAR_NOT_CONFIGURED',
          bankTransferAvailable: true,
          message:
            'الدفع الآلي عبر Moyasar (مدى / Apple Pay) قيد التفعيل؛ يمكنك بدء التجربة المجانية 14 يوماً أو التفعيل عبر التحويل البنكي.',
        },
        { status: 503 }
      )
    }

    try {
      const moyasarInv = await createMoyasarInvoice({
        amountSar,
        description: `${plan.nameAr} (${cycle === 'yearly' ? 'سنوي' : 'شهري'})`,
        callbackUrl: publicAppUrl('/firm/settings'),
        metadata: {
          kind: 'workspace_subscription',
          workspaceId: auth.workspaceId,
          userId: auth.userId,
          planId,
          cycle,
        },
      })
      return NextResponse.json({
        configured: true,
        checkoutUrl: moyasarInv.url,
        moyasarInvoiceId: moyasarInv.id,
      })
    } catch {
      return NextResponse.json({ error: 'تعذر إنشاء جلسة الدفع الإلكتروني' }, { status: 502 })
    }
  }

  return NextResponse.json({ error: 'Invalid checkout parameters' }, { status: 400 })
}
