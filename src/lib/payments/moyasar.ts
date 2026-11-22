import crypto from 'crypto'

/**
 * Moyasar Saudi Payment Gateway integration (Mada, Apple Pay, Visa/Mastercard).
 * Fails closed and transparently reports configuration status when MOYASAR_SECRET_KEY is unset.
 */

export interface MoyasarInvoiceInput {
  amountSar: number
  description: string
  callbackUrl: string
  metadata?: Record<string, string>
}

export interface MoyasarInvoiceResponse {
  id: string
  status: string
  amount: number
  currency: string
  description: string
  url: string
  metadata?: Record<string, string>
}

export function isMoyasarConfigured(): boolean {
  const secret = process.env.MOYASAR_SECRET_KEY?.trim()
  return Boolean(secret && secret.length >= 12)
}

export function verifyMoyasarWebhookSecret(providedSecret?: string | null): boolean {
  const expected = process.env.MOYASAR_WEBHOOK_SECRET?.trim()
  if (!expected || !providedSecret) return false
  try {
    const a = Buffer.from(providedSecret.trim(), 'utf8')
    const b = Buffer.from(expected, 'utf8')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function createMoyasarInvoice(input: MoyasarInvoiceInput): Promise<MoyasarInvoiceResponse> {
  const secretKey = process.env.MOYASAR_SECRET_KEY?.trim()
  if (!secretKey) {
    throw new Error('MOYASAR_NOT_CONFIGURED')
  }
  if (!Number.isFinite(input.amountSar) || input.amountSar <= 0) {
    throw new Error('INVALID_PAYMENT_AMOUNT')
  }

  // Moyasar expects amount in Halalas (1 SAR = 100 Halalas)
  const amountHalalas = Math.round(input.amountSar * 100)
  const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`

  const res = await fetch('https://api.moyasar.com/v1/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountHalalas,
      currency: 'SAR',
      description: input.description,
      callback_url: input.callbackUrl,
      metadata: input.metadata || {},
    }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) {
    throw new Error(`Moyasar API returned HTTP ${res.status}`)
  }

  const data = (await res.json()) as MoyasarInvoiceResponse
  return data
}
