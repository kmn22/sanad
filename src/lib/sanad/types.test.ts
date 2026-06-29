import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  daysUntil,
  formatDate,
  formatDuration,
  formatSAR,
  formatHijri,
  getDaysUntilColor,
  getDaysUntilBg,
  COMPLIANCE_COLORS,
  CASE_STAGE_ACCENTS,
  PRIORITY_COLORS,
  DOC_STATUS_COLORS,
  SOURCE_COLORS,
} from './types'

describe('daysUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 for today', () => {
    expect(daysUntil('2026-06-15')).toBe(0)
  })

  it('returns positive days for future dates', () => {
    expect(daysUntil('2026-06-20')).toBe(5)
  })

  it('returns negative days for past dates', () => {
    expect(daysUntil('2026-06-10')).toBe(-5)
  })

  it('handles Date objects', () => {
    expect(daysUntil(new Date('2026-06-25'))).toBe(10)
  })

  it('handles large differences', () => {
    expect(daysUntil('2027-06-15')).toBe(365)
  })
})

describe('formatDate', () => {
  it('returns em dash for null input', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('formats a date string in Arabic locale', () => {
    const result = formatDate('2026-03-15', 'ar')
    expect(result).toBeTruthy()
    expect(result).not.toBe('—')
  })

  it('formats a date string in English locale', () => {
    const result = formatDate('2026-03-15', 'en')
    expect(result).toBeTruthy()
    expect(result).toContain('2026')
  })

  it('handles Date objects', () => {
    const result = formatDate(new Date('2026-01-01'), 'en')
    expect(result).toContain('2026')
  })

  it('defaults to Arabic locale', () => {
    const arResult = formatDate('2026-03-15')
    const arExplicit = formatDate('2026-03-15', 'ar')
    expect(arResult).toBe(arExplicit)
  })
})

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45, 'en')).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125, 'en')).toBe('2m 05s')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(3725, 'en')).toBe('1h 02m')
  })

  it('formats zero seconds', () => {
    expect(formatDuration(0, 'en')).toBe('0s')
  })

  it('formats exactly one hour', () => {
    expect(formatDuration(3600, 'en')).toBe('1h 00m')
  })

  it('formats in Arabic by default', () => {
    const result = formatDuration(45)
    expect(result).toContain('ث')
  })

  it('formats minutes in Arabic', () => {
    const result = formatDuration(125, 'ar')
    expect(result).toContain('د')
  })

  it('formats hours in Arabic', () => {
    const result = formatDuration(3725, 'ar')
    expect(result).toContain('س')
  })
})

describe('formatSAR', () => {
  it('formats number with SAR suffix in English', () => {
    const result = formatSAR(1500, 'en')
    expect(result).toContain('SAR')
    expect(result).toContain('1,500')
  })

  it('formats number with ر.س suffix in Arabic', () => {
    const result = formatSAR(1500, 'ar')
    expect(result).toContain('ر.س')
  })

  it('formats zero', () => {
    const result = formatSAR(0, 'en')
    expect(result).toContain('0')
    expect(result).toContain('SAR')
  })

  it('formats large numbers with separators', () => {
    const result = formatSAR(1000000, 'en')
    expect(result).toContain('1,000,000')
  })

  it('defaults to Arabic locale', () => {
    const result = formatSAR(100)
    expect(result).toContain('ر.س')
  })
})

describe('formatHijri', () => {
  it('formats date in Arabic Hijri calendar', () => {
    const result = formatHijri(new Date('2026-06-15'), 'ar')
    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats date in English Hijri calendar', () => {
    const result = formatHijri(new Date('2026-06-15'), 'en')
    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(0)
  })

  it('defaults to Arabic', () => {
    const arResult = formatHijri(new Date('2026-06-15'))
    const arExplicit = formatHijri(new Date('2026-06-15'), 'ar')
    expect(arResult).toBe(arExplicit)
  })
})

describe('getDaysUntilColor', () => {
  it('returns rose color for expired (negative days)', () => {
    const result = getDaysUntilColor(-1)
    expect(result).toContain('text-rose')
  })

  it('returns rose semibold for 0-7 days', () => {
    const result = getDaysUntilColor(5)
    expect(result).toContain('text-rose')
    expect(result).toContain('font-semibold')
  })

  it('returns amber for days within notify range', () => {
    const result = getDaysUntilColor(15)
    expect(result).toContain('text-amber')
    expect(result).toContain('font-semibold')
  })

  it('returns emerald for safe days', () => {
    const result = getDaysUntilColor(45)
    expect(result).toContain('text-emerald')
  })

  it('respects custom notifyDays', () => {
    const result = getDaysUntilColor(15, 10)
    expect(result).toContain('text-emerald')
  })

  it('boundary: exactly 7 days is rose', () => {
    const result = getDaysUntilColor(7)
    expect(result).toContain('text-rose')
  })

  it('boundary: exactly 30 days (default notifyDays) is amber', () => {
    const result = getDaysUntilColor(30)
    expect(result).toContain('text-amber')
  })

  it('boundary: 31 days is emerald', () => {
    const result = getDaysUntilColor(31)
    expect(result).toContain('text-emerald')
  })
})

describe('getDaysUntilBg', () => {
  it('returns rose bg for expired (negative days)', () => {
    const result = getDaysUntilBg(-1)
    expect(result).toContain('bg-rose')
  })

  it('returns rose bg for 0-7 days', () => {
    const result = getDaysUntilBg(5)
    expect(result).toContain('bg-rose')
  })

  it('returns amber bg for days within notify range', () => {
    const result = getDaysUntilBg(15)
    expect(result).toContain('bg-amber')
  })

  it('returns card bg for safe days', () => {
    const result = getDaysUntilBg(45)
    expect(result).toContain('bg-card')
  })

  it('respects custom notifyDays', () => {
    const result = getDaysUntilBg(15, 10)
    expect(result).toContain('bg-card')
  })

  it('boundary: exactly 7 days is rose', () => {
    const result = getDaysUntilBg(7)
    expect(result).toContain('bg-rose')
  })

  it('boundary: exactly 30 days (default) is amber', () => {
    const result = getDaysUntilBg(30)
    expect(result).toContain('bg-amber')
  })
})

describe('color constants', () => {
  it('COMPLIANCE_COLORS has all categories', () => {
    const keys = Object.keys(COMPLIANCE_COLORS)
    expect(keys).toContain('ikama')
    expect(keys).toContain('cr')
    expect(keys).toContain('contract')
    expect(keys).toContain('license')
    expect(keys).toContain('tax')
    expect(keys).toContain('gosi')
    expect(keys).toHaveLength(6)
  })

  it('CASE_STAGE_ACCENTS has all stages', () => {
    const keys = Object.keys(CASE_STAGE_ACCENTS)
    expect(keys).toContain('drafting')
    expect(keys).toContain('client_review')
    expect(keys).toContain('filed')
    expect(keys).toContain('closed')
    expect(keys).toHaveLength(4)
  })

  it('PRIORITY_COLORS has all priorities with color and dot', () => {
    for (const key of ['low', 'normal', 'high', 'urgent']) {
      expect(PRIORITY_COLORS[key]).toHaveProperty('color')
      expect(PRIORITY_COLORS[key]).toHaveProperty('dot')
    }
  })

  it('DOC_STATUS_COLORS has all statuses', () => {
    const keys = Object.keys(DOC_STATUS_COLORS)
    expect(keys).toContain('draft')
    expect(keys).toContain('sent')
    expect(keys).toContain('active')
    expect(keys).toContain('expiring')
    expect(keys).toContain('expired')
    expect(keys).toHaveLength(5)
  })

  it('SOURCE_COLORS has all sources', () => {
    const keys = Object.keys(SOURCE_COLORS)
    expect(keys).toContain('MoJ')
    expect(keys).toContain('MHRSD')
    expect(keys).toContain('VAT')
    expect(keys).toContain('local_tip')
    expect(keys).toHaveLength(4)
  })
})
