import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runGroundedSemanticLegalSearch } from '@/lib/academic/semantic-rag'

const semanticSearchSchema = z.object({
  query: z.string().min(2).max(2000),
  topK: z.number().int().min(1).max(10).optional().default(3),
})

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = semanticSearchSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid semantic search request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = runGroundedSemanticLegalSearch(parsed.data.query, parsed.data.topK)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Semantic legal search failed' },
      { status: 500 }
    )
  }
}

