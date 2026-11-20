import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { analyzeContractClauses } from '@/lib/clm/clause-analyzer'

const analyzePayloadSchema = z.object({
  contractText: z.string().min(10, 'Contract text must be at least 10 characters').max(50_000),
  enableLlmEnrichment: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = analyzePayloadSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid contract audit payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const report = await analyzeContractClauses(parsed.data.contractText, {
      enableLlmEnrichment: parsed.data.enableLlmEnrichment,
    })

    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Clause analysis failed' },
      { status: 500 }
    )
  }
}

