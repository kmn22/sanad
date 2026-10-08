import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWrite, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { processZatcaPhase2, ZatcaInvoiceData, ZATCA_PIH_GENESIS } from '@/lib/zatca'
import { safeErrorResponse } from '@/lib/http'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const denied = denyUnless(auth, canWrite(auth))
    if (denied) return denied
    const budgeted = await enforceMutationBudget(auth)
    if (budgeted) return budgeted
    const workspaceId = auth.workspaceId

    const body = await req.json().catch(() => null)
    const invoiceId = body?.invoiceId

    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json({ error: 'invoiceId is required and must be a string' }, { status: 400 })
    }
    if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_DEMO_ZATCA !== 'true') {
      return NextResponse.json({
        error: 'ZATCA integration is not configured; no official clearance has been issued',
        code: 'ZATCA_PROVIDER_NOT_CONFIGURED',
      }, { status: 503 })
    }

    // Retrieve invoice scoped to workspace
    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, workspaceId, deletedAt: null },
      include: {
        client: true,
        case: true,
        timeEntries: true,
        workspace: true,
      },
    })

    if (!invoice) return notFoundJson()

    // Retrieve previous invoice in this workspace for cryptographic hash chaining
    const previousInvoice = await db.invoice.findFirst({
      where: {
        workspaceId,
        id: { not: invoice.id },
        zatcaHash: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      select: { zatcaHash: true },
    })

    const previousInvoiceHash = previousInvoice?.zatcaHash
      ? Buffer.from(previousInvoice.zatcaHash, 'hex').toString('base64')
      : ZATCA_PIH_GENESIS

    const now = new Date()
    const issueDate = (invoice.createdAt || now).toISOString().split('T')[0]
    const issueTime = (invoice.createdAt || now).toISOString().split('T')[1].slice(0, 8)

    // Build line items from time entries or fallback to invoice services
    const lineItems =
      invoice.timeEntries && invoice.timeEntries.length > 0
        ? invoice.timeEntries.map((te, idx) => {
            const hours = Number(((te.durationSec || 3600) / 3600).toFixed(2))
            const rate = Number(te.hourlyRate || 500)
            const itemSubtotal = Number((hours * rate).toFixed(2))
            const itemVat = Number((itemSubtotal * 0.15).toFixed(2))
            return {
              id: te.id || idx + 1,
              name: te.description || `خدمات استشارة وقضايا (${invoice.case?.title || 'أعمال قانونية'})`,
              quantity: hours,
              unitPrice: rate,
              subtotal: itemSubtotal,
              vatAmount: itemVat,
              total: Number((itemSubtotal + itemVat).toFixed(2)),
            }
          })
        : [
            {
              id: '1',
              name: `أتعاب خدمات قانونية — قضية: ${invoice.case?.title || 'استشارة عامة'}`,
              quantity: 1,
              unitPrice: Number(invoice.subtotal || invoice.total),
              subtotal: Number(invoice.subtotal) || Number((Number(invoice.total) / 1.15).toFixed(2)),
              vatAmount: Number(invoice.vatAmount) || Number((Number(invoice.total) - Number(invoice.total) / 1.15).toFixed(2)),
              total: Number(invoice.total),
            },
          ]

    const zatcaPayload: ZatcaInvoiceData = {
      invoiceNumber: invoice.number,
      uuid: crypto.randomUUID(),
      issueDate,
      issueTime,
      invoiceTypeCode: '388',
      subtype: invoice.client?.type === 'corporate' ? '0100000' : '0200000',
      seller: {
        name: invoice.workspace.name || 'مكتب المحاماة والاستشارات القانونية',
        vatNumber: '310123456700003', // Standard 15-digit legal firm VAT number
        city: 'الرياض',
        streetName: 'طريق الملك فهد',
        buildingNumber: '7234',
        postalZone: '12211',
      },
      buyer: {
        name: invoice.client?.name || 'عميل المكتب',
        vatNumber: invoice.client?.company ? '300987654300003' : undefined,
      },
      lineItems,
      subtotal: Number(invoice.subtotal),
      vatAmount: Number(invoice.vatAmount),
      total: Number(invoice.total),
      previousInvoiceHash,
    }

    const result = processZatcaPhase2(zatcaPayload)

    // Update invoice with cryptographic audit data
    const updatedInvoice = await db.invoice.update({
      where: { id: invoice.id },
      data: {
        zatcaStatus: 'preview',
        zatcaHash: result.invoiceHashHex,
        zatcaXml: result.ublXml,
      },
    })

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      zatca: {
        status: 'preview',
        hashHex: result.invoiceHashHex,
        hashBase64: result.invoiceHashBase64,
        qrCodeBase64: result.qrCodeBase64,
        digitalSignature: result.digitalSignatureBase64,
        validation: result.validation,
      },
    })
  } catch (error) {
    console.error('ZATCA Phase 2 submission failed:', error)
    return safeErrorResponse(error)
  }
}
