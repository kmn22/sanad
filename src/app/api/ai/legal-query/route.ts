/**
 * ============================================================================
 * Maqar (مقر) AI Legal Assistant — Grounded Query Endpoint
 * (`POST /api/ai/legal-query`)
 * ============================================================================
 *
 * Accepts a user legal query or case summary, performs hybrid search
 * (Vector cosine similarity + Okapi BM25 keyword matching), enforces
 * Anti-Hallucination Guardrails, and returns the grounded response enriched
 * with interactive clickable footnote citations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resolveMaqarLegalQuery } from '@/lib/ai/maqar-rag-pipeline'

const legalQueryRequestSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, 'يرجى إدخال استفسار قانوني واضح (3 أحرف على الأقل)'),
  caseSummary: z.string().trim().optional(),
  statuteFilter: z.string().trim().optional(),
  topK: z.number().int().min(1).max(10).optional().default(4),
})

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null)
    const parsed = legalQueryRequestSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || 'بيانات الاستفسار القانوني غير صالحة',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const result = await resolveMaqarLegalQuery({
      query: parsed.data.query,
      caseSummary: parsed.data.caseSummary,
      statuteFilter: parsed.data.statuteFilter,
      topK: parsed.data.topK,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'تعذر معالجة الاستفسار القانوني في محرك الاسترجاع الدلالي (RAG).',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

