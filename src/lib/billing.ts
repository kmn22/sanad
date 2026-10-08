import Stripe from 'stripe'

/**
 * Stripe is optional infrastructure: every billing surface returns 503 until
 * STRIPE_SECRET_KEY is configured, so a self-hosted deployment without billing
 * behaves honestly instead of simulating paid subscriptions.
 */
export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key)
}

/** Canonical absolute URL for Stripe success/cancel redirects. */
export function appUrl(path: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3001'
  return `${base.replace(/\/$/, '')}${path}`
}
