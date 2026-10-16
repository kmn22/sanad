import { describe, it, expect, vi } from 'vitest'
import { ANALYTICS_EVENTS } from '../src/lib/analytics/events'

describe('Repositioning Architecture & Analytics', () => {
  it('defines the required wedge analytics events', () => {
    expect(ANALYTICS_EVENTS.CLAUSE_CHECK_STARTED).toBe('clause_check_started')
    expect(ANALYTICS_EVENTS.CLAUSE_CHECK_COMPLETED).toBe('clause_check_completed')
    expect(ANALYTICS_EVENTS.WAITLIST_JOINED).toBe('waitlist_joined')
  })

  it('validates email format properly for waitlist submissions', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('lawyer@firm.sa')).toBe(true)
    expect(emailRegex.test('ahmed@sanad.sa')).toBe(true)
    expect(emailRegex.test('invalid-email')).toBe(false)
    expect(emailRegex.test('@sanad.sa')).toBe(false)
    expect(emailRegex.test('user@')).toBe(false)
  })
})
