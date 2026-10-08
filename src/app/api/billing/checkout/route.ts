import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, hasRole, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { enforceMutationBudget } from '@/lib/auth/capabilities'
import { appUrl, stripeClient } from '@/lib/billing'

export const runtime = 'nodejs'

/**
 * POST /api/billing/checkout { planCode } — create a Stripe Checkout session
 * for a paid plan. 503 STRIPE_NOT_CONFIGURED when the platform has no Stripe
 * key or the plan has no Stripe price; nothing is simulated locally.
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!hasRole(auth, ['admin', 'workspace_owner'])) return forbiddenJson()
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted

  const stripe = stripeClient()
  if (!stripe) {
    return NextResponse.json({ error: 'Billing is not configured on this deployment', code: 'STRIPE_NOT_CONFIGURED' }, { status: 503 })
  }

  let body: { planCode?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const planCode = typeof body?.planCode === 'string' ? body.planCode.trim() : ''
  if (!planCode) return NextResponse.json({ error: 'planCode is required' }, { status: 400 })

  const plan = await db.plan.findFirst({ where: { code: planCode, active: true } })
  if (!plan) return notFoundJson()
  if (!plan.stripePriceId) {
    return NextResponse.json({ error: 'This plan is not linked to a Stripe price', code: 'PLAN_PRICE_NOT_CONFIGURED' }, { status: 503 })
  }

  const workspace = await db.workspace.findUnique({
    where: { id: auth.workspaceId },
    select: { id: true, name: true, subscription: { select: { id: true, stripeCustomerId: true } } },
  })
  if (!workspace?.subscription) return notFoundJson()

  let customerId = workspace.subscription.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: workspace.name,
      metadata: { workspaceId: workspace.id, subscriptionId: workspace.subscription.id },
    })
    customerId = customer.id
    await db.subscription.update({ where: { id: workspace.subscription.id }, data: { stripeCustomerId: customerId } })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: workspace.subscription.id,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: appUrl('/settings/billing?checkout=success'),
    cancel_url: appUrl('/settings/billing?checkout=cancelled'),
    metadata: { subscriptionId: workspace.subscription.id, planId: plan.id },
    subscription_data: { metadata: { subscriptionId: workspace.subscription.id, planId: plan.id } },
  })

  await db.auditLog.create({
    data: {
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      action: 'billing.checkout.created',
      entityType: 'Subscription',
      entityId: workspace.subscription.id,
      metadata: JSON.stringify({ planCode, sessionId: session.id }),
    },
  })
  return NextResponse.json({ url: session.url })
}
