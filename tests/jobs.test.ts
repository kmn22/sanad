import { describe, expect, it } from 'vitest'
import { quietDelayMinutes } from '../src/lib/jobs'

function at(hours: number, minutes = 0) {
  const date = new Date('2026-10-06T00:00:00Z')
  date.setHours(hours, minutes, 0, 0)
  return date
}

describe('quietDelayMinutes', () => {
  it('returns 0 outside quiet hours', () => {
    expect(quietDelayMinutes('22:00', '07:00', at(12))).toBe(0)
    expect(quietDelayMinutes('09:00', '17:00', at(8))).toBe(0)
  })

  it('returns minutes until quiet end for overnight windows', () => {
    expect(quietDelayMinutes('22:00', '07:00', at(23))).toBe(8 * 60)
    expect(quietDelayMinutes('22:00', '07:00', at(5))).toBe(2 * 60)
  })

  it('returns minutes until quiet end for same-day windows', () => {
    expect(quietDelayMinutes('12:00', '14:00', at(13))).toBe(60)
  })

  it('treats malformed or missing times as no quiet hours', () => {
    expect(quietDelayMinutes(null, '07:00', at(3))).toBe(0)
    expect(quietDelayMinutes('bad', '07:00', at(3))).toBe(0)
    expect(quietDelayMinutes('22:00', null, at(23))).toBe(0)
  })
})
