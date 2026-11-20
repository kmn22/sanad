import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logError } from '@/lib/observability'
import { OLLAMA_MODEL, OLLAMA_URL } from '@/lib/ai/ollama'
import {
  getIndexedStatutoryChunks,
  computeDeterministicMultilingualEmbedding,
} from '@/lib/ai/maqar-rag-pipeline'

export const dynamic = 'force-dynamic'

export type AiState = 'loaded' | 'cold' | 'unavailable'

export interface VectorStoreHealth {
  status: 'ok' | 'degraded' | 'unavailable'
  provider: 'pgvector-hybrid' | 'in-memory-hybrid'
  indexedStatutoryChunks: number
  embeddingModel: string
  embeddingDimension: number
}

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

async function probeVectorStore(): Promise<VectorStoreHealth> {
  try {
    const chunks = getIndexedStatutoryChunks()
    const sampleVec = computeDeterministicMultilingualEmbedding('نظام المعاملات المدنية')
    const hasValidEmbeddings =
      chunks.length > 0 &&
      sampleVec.length > 0 &&
      chunks.every((c) => Array.isArray(c.embedding) && c.embedding.length === sampleVec.length)

    let pgvectorInstalled = false
    try {
      const extRows = await db.$queryRaw<Array<{ extname: string }>>`
        SELECT extname FROM pg_extension WHERE extname = 'vector'
      `
      pgvectorInstalled = Array.isArray(extRows) && extRows.length > 0
    } catch {
      // pgvector extension check is optional if running on standard Postgres with hybrid vector engine
    }

    return {
      status: hasValidEmbeddings ? 'ok' : 'degraded',
      provider: pgvectorInstalled || Boolean(process.env.VECTOR_DATABASE_URL)
        ? 'pgvector-hybrid'
        : 'in-memory-hybrid',
      indexedStatutoryChunks: chunks.length,
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      embeddingDimension: sampleVec.length,
    }
  } catch {
    return {
      status: 'unavailable',
      provider: 'in-memory-hybrid',
      indexedStatutoryChunks: 0,
      embeddingModel: 'unavailable',
      embeddingDimension: 0,
    }
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
    const [, ai, vectorStore, queue] = await Promise.all([
      db.$queryRaw`SELECT 1`,
      probeAi(),
      probeVectorStore(),
      probeQueue(),
    ])

    const overallHealthy =
      vectorStore.status !== 'unavailable' && queue.status !== 'unavailable'

    return NextResponse.json(
      {
        status: overallHealthy ? 'ok' : 'degraded',
        service: 'maqar-core',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startMs,
        database: 'ok',
        vectorStore,
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
        vectorStore: { status: 'unavailable' },
        queue: { status: 'unavailable' },
      },
      { status: 503 }
    )
  }
}
