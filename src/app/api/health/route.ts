import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logError } from '@/lib/observability'
import { OLLAMA_MODEL, OLLAMA_URL } from '@/lib/ai/ollama'

export const dynamic = 'force-dynamic'

export type AiState = 'loaded' | 'cold' | 'unavailable'

export interface QueueHealth {
  status: 'ok' | 'degraded' | 'unavailable'
  driver: 'postgres-background-jobs' | 'redis-backed'
  queuedJobs: number
  processingJobs: number
  failedJobs: number
}

async function probeAi(): Promise<AiState> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/ps`, {
      signal: AbortSignal.timeout(1500),
      cache: 'no-store',
    })
    if (!res.ok) return 'unavailable'
    const data = (await res.json()) as {
      models?: { name?: string; model?: string }[]
    }
    const loaded = (data.models ?? []).some(
      (m) => m.name === OLLAMA_MODEL || m.model === OLLAMA_MODEL
    )
    return loaded ? 'loaded' : 'cold'
  } catch {
    return 'unavailable'
  }
}

async function probeQueue(): Promise<QueueHealth> {
  try {
    const [queuedJobs, processingJobs, failedJobs] = await Promise.all([
      db.backgroundJob.count({ where: { status: 'queued' } }),
      db.backgroundJob.count({ where: { status: 'processing' } }),
      db.backgroundJob.count({ where: { status: 'failed' } }),
    ])

    return {
      status: 'ok',
      driver: process.env.REDIS_URL ? 'redis-backed' : 'postgres-background-jobs',
      queuedJobs,
      processingJobs,
      failedJobs,
    }
  } catch {
    return {
      status: 'unavailable',
      driver: 'postgres-background-jobs',
      queuedJobs: 0,
      processingJobs: 0,
      failedJobs: 0,
    }
  }
}

export async function GET() {
  const startMs = Date.now()
  try {
    const [, ai, queue] = await Promise.all([
      db.$queryRaw`SELECT 1`,
      probeAi(),
      probeQueue(),
    ])

    const overallHealthy = queue.status !== 'unavailable'

    return NextResponse.json(
      {
        status: overallHealthy ? 'ok' : 'degraded',
        service: 'maqar-core',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startMs,
        database: 'ok',
        queue,
        ai,
        model: OLLAMA_MODEL,
      },
      { status: overallHealthy ? 200 : 503 }
    )
  } catch (error) {
    logError(error, { route: 'GET /api/health' })
    return NextResponse.json(
      {
        status: 'error',
        service: 'maqar-core',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startMs,
        database: 'unavailable',
        queue: { status: 'unavailable' },
      },
      { status: 503 }
    )
  }
}
