import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { evaluateStudentDraftingSubmission } from '@/lib/academic/drafting-simulator'

const evaluateSchema = z.object({
  scenarioId: z.string().min(1),
  submissionText: z.string().min(10).max(20_000),
})

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = evaluateSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid drafting simulator submission', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const evaluation = evaluateStudentDraftingSubmission(
      parsed.data.scenarioId,
      parsed.data.submissionText
    )

    return NextResponse.json(evaluation, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Simulator evaluation failed' },
      { status: 500 }
    )
  }
}

