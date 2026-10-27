import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logError } from '@/lib/observability'
import { OLLAMA_MODEL, OLLAMA_URL } from '@/lib/ai/ollama'

export const dynamic = 'force-dynamic'

type AiState = 'loaded' | 'cold' | 'unavailable'

async function probeAi(): Promise<AiState> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/ps`, { signal: AbortSignal.timeout(1500), cache: 'no-store' })
    if (!res.ok) return 'unavailable'
    const data = (await res.json()) as { models?: { name?: string; model?: string }[] }
    const loaded = (data.models ?? []).some((m) => m.name === OLLAMA_MODEL || m.model === OLLAMA_MODEL)
    return loaded ? 'loaded' : 'cold'
  } catch {
    return 'unavailable'
  }
}

export async function GET() {
  try {
    const [, ai] = await Promise.all([db.$queryRaw`SELECT 1`, probeAi()])
    return NextResponse.json({ status: 'ok', database: 'ok', ai, model: OLLAMA_MODEL })
  } catch (error) {
    logError(error, { route: 'GET /api/health' })
    return NextResponse.json(
      { status: 'error', database: 'unavailable' },
      { status: 503 }
    )
  }
}
