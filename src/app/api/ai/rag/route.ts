import { NextRequest, NextResponse } from 'next/server'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { executeLegalRag } from '@/lib/ai/rag-engine'
import { db } from '@/lib/db'
import { checkAiUsage, incrementUsage } from '@/lib/saas/entitlements'

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()

    const { prompt } = await readJsonLimited<{ prompt?: unknown }>(req, 16 * 1024)

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 8000) {
      return NextResponse.json({ error: 'Prompt must be between 1 and 8000 characters' }, { status: 400 })
    }

    // Direct count query shortcut
    if (/كم\s+(عدد\s+)?القضايا|عدد\s+القضايا/.test(prompt)) {
      const caseCount = await db.legalCase.count({ where: { workspaceId } })
      return NextResponse.json({
        success: true,
        reply: `عدد القضايا المسجلة في مساحة عملك هو ${caseCount} قضية.`,
        sources: [],
      })
    }

    const quota = await checkAiUsage(workspaceId)
    if (!quota.allowed) {
      return NextResponse.json({ error: 'AI usage limit reached for the current plan', code: quota.code, used: quota.used, limit: quota.limit }, { status: 403 })
    }

    // Execute Semantic Arabic Legal RAG Pipeline
    const ragResult = await executeLegalRag(prompt, workspaceId)
    await incrementUsage(workspaceId, 'ai_requests')

    return NextResponse.json({
      success: true,
      reply: ragResult.reply,
      sources: ragResult.sources,
      retrievedCount: ragResult.totalRetrieved,
    })
  } catch (error) {
        return safeErrorResponse(error, req, { route: 'POST /api/ai/rag' })
  }
}
