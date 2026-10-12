import { NextResponse } from 'next/server'
import { OLLAMA_URL, OLLAMA_MODEL } from '@/lib/ai/ollama'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { canWrite, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { checkAiUsage, incrementUsage } from '@/lib/saas/entitlements'

const ANALYSIS_TYPES = new Set(['ocr_id', 'summarize_judgment', 'legal_analysis'])

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
    const { documentText, type = 'legal_analysis' } = await readJsonLimited<{ documentText?: unknown; type?: string }>(req, 128 * 1024)

    if (typeof documentText !== 'string' || !documentText.trim() || documentText.length > 100_000) {
      return NextResponse.json({ error: 'documentText must be between 1 and 100000 characters' }, { status: 400 })
    }
    if (!ANALYSIS_TYPES.has(type)) {
      return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }
    await incrementUsage(workspaceId, 'ai_requests')

    let systemPrompt = ''
    if (type === 'ocr_id') {
      systemPrompt = `أنت مساعد قانوني محترف. استخرج البيانات التالية من نص الهوية المدخلة: (الاسم الكامل، رقم الهوية، تاريخ الميلاد، مكان الإصدار). أعد الناتج بصيغة JSON فقط بدون أي نص آخر.`
    } else if (type === 'summarize_judgment') {
      systemPrompt = `أنت محامي سعودي ومستشار قانوني. قم بقراءة نص الحكم القضائي المدخل ولخصه في 3 أقسام:
1. وقائع الدعوى (باختصار)
2. الأسانيد الشرعية والنظامية
3. منطوق الحكم (القرار النهائي)
تأكد من أن اللغة احترافية وقانونية سليمة.`
    } else {
      systemPrompt = `أنت مستشار قانوني سعودي. قم بتحليل المستند التالي واستخراج أهم النقاط القانونية والمخاطر المحتملة.`
    }

    // Call local Ollama Qwen 2.5 14B model
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `System: ${systemPrompt}\n\nDocument Text:\n${documentText}`,
        stream: false,
      }),
      signal: AbortSignal.timeout(120_000),
    })

    if (!response.ok) {
      throw new Error('Failed to generate analysis from Ollama')
    }

    const data = await response.json()
    
    return NextResponse.json({ result: data.response })
  } catch (error) {
        return safeErrorResponse(error, req, { route: 'POST /api/ai/analyze' })
  }
}
