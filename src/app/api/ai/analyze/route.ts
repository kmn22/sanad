import { NextResponse } from 'next/server'
import { ollamaChat } from '@/lib/ai/ollama'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { canWrite, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { checkAiUsage, incrementUsage } from '@/lib/saas/entitlements'
import { logEvent } from '@/lib/observability'

const ANALYSIS_TYPES = new Set(['ocr_id', 'summarize_judgment', 'legal_analysis', 'document', 'litigation'])

interface StructuredAnalysis {
  summary: string
  risks: Array<{ severity: 'high' | 'medium' | 'low'; description: string }>
  recommendations: string[]
  entities: Array<{ name: string; role: string }>
}

function buildFallbackAnalysis(rawText: string): StructuredAnalysis {
  const snippet = rawText.replace(/\s+/g, ' ').trim().slice(0, 220)
  return {
    summary: `تحليل أولي للمستند/القضية: ${snippet}${rawText.length > 220 ? '...' : ''}`,
    risks: [
      {
        severity: 'medium',
        description: 'التحقق من استيفاء المتطلبات الشكلية والمواعيد النظامية المقررة في نظام المرافعات الشرعية ونظام العمل.',
      },
      {
        severity: 'low',
        description: 'مراجعة أسانيد المطالبة ومطابقتها مع المستندات الثبوتية المرفقة بملف القضية.',
      },
    ],
    recommendations: [
      'توثيق كافة المراسلات والإخطارات الرسمية بين الأطراف.',
      'فحص البنود التعاقدية مقابل المواد الإلزامية في نظام المعاملات المدنية ونظام العمل.',
    ],
    entities: [],
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const denied = denyUnless(auth, canWrite(auth))
    if (denied) return denied
    const budgeted = await enforceMutationBudget(auth)
    if (budgeted) return budgeted
    const workspaceId = auth.workspaceId
    const quota = await checkAiUsage(workspaceId)
    if (!quota.allowed) {
      return NextResponse.json({ error: 'AI usage limit reached for the current plan', code: quota.code }, { status: 403 })
    }

    const body = await readJsonLimited<{
      documentText?: unknown
      text?: unknown
      caseDetails?: unknown
      type?: string
    }>(req, 128 * 1024)

    const rawInput =
      typeof body.documentText === 'string'
        ? body.documentText
        : typeof body.text === 'string'
          ? body.text
          : typeof body.caseDetails === 'string'
            ? body.caseDetails
            : ''
    const type = body.type || 'legal_analysis'

    if (!rawInput.trim() || rawInput.length > 100_000) {
      return NextResponse.json({ error: 'documentText must be between 1 and 100000 characters' }, { status: 400 })
    }
    if (!ANALYSIS_TYPES.has(type)) {
      return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }
    await incrementUsage(workspaceId, 'ai_requests')

    const systemPrompt =
      'أنت مستشار قانوني سعودي خبير في نظام المعاملات المدنية ونظام العمل ونظام المرافعات الشرعية. ' +
      'حلل النص المرفق وأعد كائن JSON فقط باللغة العربية الفصحى يحتوي على الحقول التالية:\n' +
      '{\n' +
      '  "summary": "ملخص تنفيذي قانوني دقيق ومباشر",\n' +
      '  "risks": [{"severity": "high" | "medium" | "low", "description": "وصف الخطر النظامي أو الإجرائي"}],\n' +
      '  "recommendations": ["توصية عملية 1", "توصية عملية 2"],\n' +
      '  "entities": [{"name": "اسم الطرف أو الجهة", "role": "صفته في المستند/القضية"}]\n' +
      '}'

    let analysis: StructuredAnalysis = buildFallbackAnalysis(rawInput)
    try {
      const rawJson = await ollamaChat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawInput.slice(0, 12_000) },
        ],
        { json: true },
      )
      const parsed = JSON.parse(rawJson)
      if (parsed && typeof parsed.summary === 'string') {
        analysis = {
          summary: parsed.summary,
          risks: Array.isArray(parsed.risks)
            ? parsed.risks.map((r: any) => ({
                severity: ['high', 'medium', 'low'].includes(r?.severity) ? r.severity : 'medium',
                description: typeof r?.description === 'string' ? r.description : String(r || ''),
              }))
            : analysis.risks,
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations.map((rec: any) => String(rec))
            : Array.isArray(parsed.nextSteps)
              ? parsed.nextSteps.map((rec: any) => String(rec))
              : analysis.recommendations,
          entities: Array.isArray(parsed.entities)
            ? parsed.entities.map((e: any) => ({
                name: typeof e?.name === 'string' ? e.name : '',
                role: typeof e?.role === 'string' ? e.role : '',
              }))
            : [],
        }
      }
    } catch (err: any) {
      logEvent('warn', 'Ollama analyze fallback used', { req, errMessage: err?.message, route: 'POST /api/ai/analyze' })
    }

    return NextResponse.json({
      success: true,
      result: analysis.summary,
      summary: analysis.summary,
      risks: analysis.risks,
      nextSteps: analysis.recommendations,
      analysis,
    })
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/ai/analyze' })
  }
}
