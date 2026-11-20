import { NextResponse } from 'next/server'
import { requestIp } from '@/lib/audit'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'
import { runDeterministicClauseRules } from '@/lib/ai/clause-checker'

export async function POST(req: Request) {
  try {
    const ip = requestIp(req)
    const limiter = await rateLimit(`clause-check:ip:${ip}`, 30, 15 * 60 * 1000)
    if (!limiter.success) {
      return NextResponse.json({ error: 'تم تجاوز حد طلبات الفحص المؤقت، يرجى المحاولة بعد قليل' }, { status: 429 })
    }

    const body = await readJsonLimited<{ clauseText?: unknown }>(req, 16 * 1024)
    const clauseText = typeof body?.clauseText === 'string' ? body.clauseText.trim().slice(0, 3000) : ''
    if (!clauseText) {
      return NextResponse.json({ error: 'الرجاء إدخال نص البند أولاً' }, { status: 400 })
    }

    const { matchedRule: _m, ...result } = runDeterministicClauseRules(clauseText)
    return NextResponse.json(result)
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/ai/check-clause' })
  }
}
