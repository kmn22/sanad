import { NextResponse } from 'next/server'
import { requestIp } from '@/lib/audit'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'
import {
  buildDeterministicContractSummary,
  type ExtractionFocus,
} from '@/lib/ai/contract-summarizer'

const VALID_FOCUS = new Set<ExtractionFocus>(['all', 'core_clauses', 'obligations', 'durations', 'risks'])

export async function POST(req: Request) {
  try {
    const ip = requestIp(req)
    const limiter = await rateLimit(`summarize-contract:ip:${ip}`, 25, 15 * 60 * 1000)
    if (!limiter.success) {
      return NextResponse.json({ error: 'تم تجاوز حد طلبات التلخيص المؤقت، يرجى المحاولة بعد قليل' }, { status: 429 })
    }

    const body = await readJsonLimited<{ contractText?: unknown; focus?: unknown }>(req, 256 * 1024)
    const contractText = typeof body?.contractText === 'string' ? body.contractText.trim().slice(0, 60_000) : ''
    const focus: ExtractionFocus =
      typeof body?.focus === 'string' && VALID_FOCUS.has(body.focus as ExtractionFocus)
        ? (body.focus as ExtractionFocus)
        : 'all'

    if (!contractText || contractText.length < 20) {
      return NextResponse.json({ error: 'الرجاء إدخال نص العقد (20 حرفاً على الأقل) لتلخيصه' }, { status: 400 })
    }

    const { isSample: _s, ...summary } = buildDeterministicContractSummary(contractText, focus)
    return NextResponse.json(summary)
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/ai/summarize-contract' })
  }
}
