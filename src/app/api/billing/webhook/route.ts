import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const value = (invoice as any).subscription || (invoice as any).parent?.subscription_details?.subscription
  return typeof value === 'string' ? value : value?.id || null
}

async function processEvent(event: Stripe.Event) {
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription
    const periodEnd = (subscription as any).current_period_end
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        ...(typeof periodEnd === 'number' ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
      },
    })
    return
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'canceled' },
    })
    return
  }

  if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = subscriptionIdFromInvoice(invoice)
    if (!subscriptionId) return
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: event.type === 'invoice.payment_succeeded' ? 'active' : 'past_due' },
    })
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!apiKey || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    if (Buffer.byteLength(rawBody, 'utf8') > 1024 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }
    const stripe = new Stripe(apiKey)
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret, 300)
  } catch (error) {
    console.error('Billing webhook signature verification failed:', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    await db.billingWebhookEvent.create({
      data: { id: event.id, type: event.type, livemode: event.livemode },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    throw error
  }

  try {
    await processEvent(event)
    await db.billingWebhookEvent.update({
      where: { id: event.id },
      data: { status: 'processed', processedAt: new Date() },
    })
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Billing webhook processing failed:', error)
    await db.billingWebhookEvent.update({
      where: { id: event.id },
      data: { status: 'failed', error: 'Event processing failed' },
    })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
