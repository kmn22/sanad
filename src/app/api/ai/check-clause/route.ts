import { NextResponse } from 'next/server'
import { requestIp } from '@/lib/audit'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'
import { OLLAMA_URL, OLLAMA_MODEL } from '@/lib/ai/ollama'
import { runDeterministicClauseRules, type ClauseCheckResult } from '@/lib/ai/clause-checker'

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

    const ruleOutcome = runDeterministicClauseRules(clauseText)
    if (ruleOutcome.matchedRule) {
      const { matchedRule: _m, ...result } = ruleOutcome
      return NextResponse.json(result)
    }

    // Custom clause not covered by a deterministic regex: consult local Ollama
    // (qwen2.5:14b takes ~9s on cold start; allow 25s before falling back).
    try {
      const res = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'أنت مدقق عقود سعودي. افحص البند التعاقدي التالي مقابل نظام العمل السعودي ونظام المعاملات المدنية ونظام حماية البيانات الشخصية (PDPL). ' +
                'أعد كائن JSON فقط بالحقول التالية بالعربية: ' +
                '{"valid": boolean, "score": number (0-100), "law": string, "article": string, "violation": string, "recommendation": string}.',
            },
            { role: 'user', content: clauseText },
          ],
        }),
        signal: AbortSignal.timeout(25_000),
      })
      if (res.ok) {
        const data = await res.json()
        const raw = data?.choices?.[0]?.message?.content
        if (typeof raw === 'string') {
          const parsed = JSON.parse(raw)
          if (
            typeof parsed.valid === 'boolean' &&
            typeof parsed.violation === 'string' &&
            typeof parsed.recommendation === 'string'
          ) {
            return NextResponse.json({
              valid: parsed.valid,
              score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.score))) : parsed.valid ? 92 : 52,
              law: typeof parsed.law === 'string' && parsed.law ? parsed.law.slice(0, 120) : 'الأنظمة السعودية السارية',
              article: typeof parsed.article === 'string' && parsed.article ? parsed.article.slice(0, 160) : 'ضوابط الصياغة النظامية',
              violation: parsed.violation.slice(0, 800),
              recommendation: parsed.recommendation.slice(0, 1000),
              engine: 'ollama',
            } satisfies ClauseCheckResult)
          }
        }
      }
    } catch {
      // Fall back to deterministic result below
    }

    const { matchedRule: _m, ...fallback } = ruleOutcome
    return NextResponse.json(fallback)
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/ai/check-clause' })
  }
}
