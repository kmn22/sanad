import { NextResponse } from 'next/server'
import { requestIp } from '@/lib/audit'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { logEvent } from '@/lib/observability'
import { rateLimit } from '@/lib/rate-limit'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'

const KNOWN_EVENTS = new Set<string>(Object.values(ANALYTICS_EVENTS))

export async function POST(req: Request) {
  try {
    const ip = requestIp(req)
    const limiter = await rateLimit(`analytics:ip:${ip}`, 120, 60 * 1000)
    if (!limiter.success) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 })
    }

    const payload = await readJsonLimited<Record<string, unknown>>(req, 16 * 1024)
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.event !== 'string' ||
      !KNOWN_EVENTS.has(payload.event)
    ) {
      return NextResponse.json({ ok: false, error: 'Invalid event payload' }, { status: 400 })
    }

    logEvent('info', `[analytics] ${payload.event}`, {
      event: payload.event,
      timestamp: typeof payload.timestamp === 'string' ? payload.timestamp.slice(0, 64) : new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, received: true })
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/analytics/events' })
  }
}
