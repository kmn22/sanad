import { describe, expect, it } from 'vitest'
import { isSubscriptionActive } from '../src/lib/saas/entitlements'

const now = new Date('2026-10-07T12:00:00.000Z')

function subscription(overrides: Partial<Parameters<typeof isSubscriptionActive>[0]> = {}) {
  return {
    status: 'active',
    currentPeriodEnd: new Date('2026-11-07T12:00:00.000Z'),
    trialEndsAt: null,
    ...overrides,
  }
}

describe('subscription entitlement gate', () => {
  it('allows an active subscription inside its billing period', () => {
    expect(isSubscriptionActive(subscription(), now)).toBe(true)
  })

  it('allows a trial only until the earlier trial or billing expiry', () => {
    expect(isSubscriptionActive(subscription({
      status: 'trialing',
      trialEndsAt: new Date('2026-10-08T12:00:00.000Z'),
    }), now)).toBe(true)
    expect(isSubscriptionActive(subscription({
      status: 'trialing',
      trialEndsAt: new Date('2026-10-06T12:00:00.000Z'),
    }), now)).toBe(false)
  })

  it.each(['past_due', 'suspended', 'canceled'])('rejects a %s subscription', (status) => {
    expect(isSubscriptionActive(subscription({ status }), now)).toBe(false)
  })

  it('rejects a subscription after its billing period ends', () => {
    expect(isSubscriptionActive(subscription({
      currentPeriodEnd: new Date('2026-10-07T11:59:59.999Z'),
    }), now)).toBe(false)
  })

  it('treats a missing subscription as inactive when checked directly', () => {
    expect(isSubscriptionActive(null, now)).toBe(false)
  })
})
