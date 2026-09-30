import { describe, it, expect } from 'vitest'
import { evaluateComplianceStatus } from '../src/lib/sanad/compliance-calc'

describe('Compliance Expiration Evaluation', () => {
  const referenceDate = new Date(2026, 8, 30, 12, 0, 0) // Sep 30, 2026

  it('marks an item as active when expiry is well into the future', () => {
    // Expires in 60 days, notify threshold is 30 days
    const expiry = new Date(2026, 10, 29, 12, 0, 0)
    const result = evaluateComplianceStatus(expiry, 30, referenceDate)

    expect(result.isExpired).toBe(false)
    expect(result.isExpiring).toBe(false)
    expect(result.recommendedStatus).toBe('active')
    expect(result.diffDays).toBeGreaterThan(30)
  })

  it('marks an item as expiring when within notifyDays threshold', () => {
    // Expires in 15 days, notify threshold is 30 days
    const expiry = new Date(2026, 9, 15, 12, 0, 0)
    const result = evaluateComplianceStatus(expiry, 30, referenceDate)

    expect(result.isExpired).toBe(false)
    expect(result.isExpiring).toBe(true)
    expect(result.recommendedStatus).toBe('expiring')
    expect(result.diffDays).toBe(15)
  })

  it('marks an item as expiring on the exact notify day boundary', () => {
    const expiry = new Date(2026, 9, 30, 12, 0, 0) // exactly 30 days away
    const result = evaluateComplianceStatus(expiry, 30, referenceDate)

    expect(result.isExpired).toBe(false)
    expect(result.isExpiring).toBe(true)
    expect(result.recommendedStatus).toBe('expiring')
  })

  it('marks an item as expired when past the expiry date', () => {
    // Expired 5 days ago
    const expiry = new Date(2026, 8, 25, 12, 0, 0)
    const result = evaluateComplianceStatus(expiry, 30, referenceDate)

    expect(result.isExpired).toBe(true)
    expect(result.isExpiring).toBe(false)
    expect(result.recommendedStatus).toBe('expired')
    expect(result.diffDays).toBeLessThan(0)
  })
})
