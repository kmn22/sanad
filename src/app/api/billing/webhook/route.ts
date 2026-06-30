import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'

// Stripe webhook (simulated billing flow). Verifies the HMAC signature when
// STRIPE_WEBHOOK_SECRET is configured; in demo mode (no secret set) the check
// is skipped so the sandbox keeps working without real Stripe credentials.
function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected)
  const providedBuf = Buffer.from(signatureHeader)
  if (expectedBuf.length !== providedBuf.length) return false
  return timingSafeEqual(expectedBuf, providedBuf)
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (secret) {
      const signature = req.headers.get('stripe-signature')
      if (!isValidSignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody)

    if (event?.type === 'invoice.payment_succeeded') {
      const stripeSubscriptionId = event?.data?.object?.subscription
      if (!stripeSubscriptionId) {
        return NextResponse.json({ error: 'Missing subscription id in event payload' }, { status: 400 })
      }

      // Extend subscription by 1 month (Simulated)
      await db.subscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Billing webhook failed:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
