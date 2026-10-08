import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, hasRole, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { enforceMutationBudget } from '@/lib/auth/capabilities'
import { appUrl, stripeClient } from '@/lib/billing'

export const runtime = 'nodejs'

/**
 * POST /api/billing/portal — Stripe Billing Portal session so owners can
 * manage payment methods, cancel, or switch plans inside Stripe itself.
 */
export async function POST() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!hasRole(auth, ['admin', 'workspace_owner'])) return forbiddenJson()
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted

  const stripe = stripeClient()
  if (!stripe) {
    return NextResponse.json({ error: 'Billing is not configured on this deployment', code: 'STRIPE_NOT_CONFIGURED' }, { status: 503 })
  }

  const workspace = await db.workspace.findUnique({
    where: { id: auth.workspaceId },
    select: { subscription: { select: { id: true, stripeCustomerId: true } } },
  })
  const subscription = workspace?.subscription
  if (!subscription) return notFoundJson()
  if (!subscription.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No billing account exists yet — start a paid plan first', code: 'NO_BILLING_CUSTOMER' },
      { status: 409 },
    )
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: appUrl('/settings/billing'),
  })
  return NextResponse.json({ url: session.url })
}
