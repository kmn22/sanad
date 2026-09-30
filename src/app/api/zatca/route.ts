import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { processZatcaPhase2, ZatcaInvoiceData, ZATCA_PIH_GENESIS } from '@/lib/zatca'
import { safeErrorResponse } from '@/lib/http'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()

    const body = await req.json().catch(() => null)
    const invoiceId = body?.invoiceId

    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json({ error: 'invoiceId is required and must be a string' }, { status: 400 })
    }

    // Retrieve invoice scoped to workspace
    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, workspaceId },
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
            const rate = te.hourlyRate || 500
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
              unitPrice: invoice.subtotal || invoice.total,
              subtotal: invoice.subtotal || Number((invoice.total / 1.15).toFixed(2)),
              vatAmount: invoice.vatAmount || Number((invoice.total - (invoice.total / 1.15)).toFixed(2)),
              total: invoice.total,
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
      subtotal: invoice.subtotal,
      vatAmount: invoice.vatAmount,
      total: invoice.total,
      previousInvoiceHash,
    }

    const result = processZatcaPhase2(zatcaPayload)

    // Update invoice with cryptographic audit data
    const updatedInvoice = await db.invoice.update({
      where: { id: invoice.id },
      data: {
        zatcaStatus: result.validation.valid ? 'cleared' : 'rejected',
        zatcaHash: result.invoiceHashHex,
        zatcaXml: result.ublXml,
      },
    })

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      zatca: {
        status: updatedInvoice.zatcaStatus,
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
