import { NextResponse } from 'next/server'
import { requestIp } from '@/lib/audit'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'
import { ollamaChat } from '@/lib/ai/ollama'
import {
  buildDeterministicContractSummary,
  type ContractSummaryResult,
  type ExtractionFocus,
  type ClauseTag,
} from '@/lib/ai/contract-summarizer'

const VALID_FOCUS = new Set<ExtractionFocus>(['all', 'core_clauses', 'obligations', 'durations', 'risks'])
const VALID_TAGS = new Set<ClauseTag>(['core', 'attention', 'risk', 'safe'])

const TAG_LABELS: Record<ClauseTag, string> = {
  core: 'بند جوهري',
  attention: 'يحتاج انتباهاً',
  risk: 'مخاطرة محتملة',
  safe: 'سليم',
}

export async function POST(req: Request) {
  try {
    const ip = requestIp(req)
    const limiter = await rateLimit(`summarize-contract:ip:${ip}`, 25, 15 * 60 * 1000)
    if (!limiter.success) {
      return NextResponse.json({ error: 'تم تجاوز حد طلبات التلخيص المؤقت، يرجى المحاولة بعد قليل' }, { status: 429 })
    }

    const body = await readJsonLimited<{ contractText?: unknown; focus?: unknown }>(req, 256 * 1024)
    const contractText = typeof body?.contractText === 'string' ? body.contractText.trim().slice(0, 60_000) : ''
    const focus: ExtractionFocus =
      typeof body?.focus === 'string' && VALID_FOCUS.has(body.focus as ExtractionFocus)
        ? (body.focus as ExtractionFocus)
        : 'all'

    if (!contractText || contractText.length < 20) {
      return NextResponse.json({ error: 'الرجاء إدخال نص العقد (20 حرفاً على الأقل) لتلخيصه' }, { status: 400 })
    }

    const base = buildDeterministicContractSummary(contractText, focus)
    if (base.isSample) {
      const { isSample: _s, ...sampleResult } = base
      return NextResponse.json(sampleResult)
    }

    // Consult local GPU model (qwen3-coder:30b) for custom contracts
    try {
      const raw = await ollamaChat(
        [
          {
            role: 'system',
            content:
              'أنت مستشار قانوني سعودي خبير في تلخيص العقود الطويلة وكشف مخاطرها وفق نظام المعاملات المدنية ونظام العمل ونظام المحاكم التجارية. ' +
              'لخّص العقد المرفق باللغة العربية الفصحى فقط وأعد كائن JSON حصراً بالشكل التالي:\n' +
              '{\n' +
              '  "contractTitle": "عنوان العقد",\n' +
              '  "clauses": [\n' +
              '    {\n' +
              '      "number": 1,\n' +
              '      "tag": "core" | "attention" | "risk" | "safe",\n' +
              '      "title": "عنوان البند",\n' +
              '      "summary": "ملخص واضح ومباشر للبند",\n' +
              '      "actionNote": "توصية عملية إن وجد خطر أو تنبيه",\n' +
              '      "statuteRef": "النظام السعودي والمادة ذات الصلة"\n' +
              '    }\n' +
              '  ],\n' +
              '  "alerts": [\n' +
              '    {\n' +
              '      "title": "عنوان التنبيه التنفيذي",\n' +
              '      "clauseRef": "البند X",\n' +
              '      "detail": "توضيح المخاطرة والإجراء الموصى به قبل الاعتماد",\n' +
              '      "severity": "high" | "medium" | "low"\n' +
              '    }\n' +
              '  ],\n' +
              '  "obligations": {\n' +
              '    "firstParty": ["التزام الطرف الأول 1"],\n' +
              '    "secondParty": ["التزام الطرف الثاني 1"]\n' +
              '  },\n' +
              '  "durationsAndNotices": [\n' +
              '    {"label": "المدة أو الإشعار", "value": "القيمة المستخرجة", "warning": "تنبيه إن وجد"}\n' +
              '  ],\n' +
              '  "closingNote": "خلاصة ختامية حول سلامة الاختصاص والمرجعية النظامية"\n' +
              '}',
          },
          { role: 'user', content: contractText.slice(0, 12_000) },
        ],
        { json: true, timeoutMs: 30_000 },
      )

      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed?.clauses) && parsed.clauses.length > 0) {
          const clauses = parsed.clauses.slice(0, 10).map((c: any, idx: number) => {
            const tag: ClauseTag = VALID_TAGS.has(c?.tag) ? c.tag : 'core'
            return {
              number: idx + 1,
              tag,
              tagLabel: TAG_LABELS[tag],
              title: typeof c?.title === 'string' && c.title ? c.title.slice(0, 140) : `البند ${idx + 1}`,
              summary: typeof c?.summary === 'string' ? c.summary.slice(0, 500) : '',
              actionNote: typeof c?.actionNote === 'string' && c.actionNote ? c.actionNote.slice(0, 300) : undefined,
              statuteRef:
                typeof c?.statuteRef === 'string' && c.statuteRef
                  ? c.statuteRef.slice(0, 160)
                  : 'نظام المعاملات المدنية السعودي',
            }
          })
          const attentionCount = clauses.filter((c: any) => c.tag === 'attention' || c.tag === 'risk').length
          const alerts = Array.isArray(parsed.alerts)
            ? parsed.alerts.slice(0, 6).map((a: any) => ({
                title: typeof a?.title === 'string' ? a.title.slice(0, 140) : 'تنبيه تعاقدي',
                clauseRef: typeof a?.clauseRef === 'string' ? a.clauseRef.slice(0, 40) : 'العقد',
                detail: typeof a?.detail === 'string' ? a.detail.slice(0, 400) : '',
                severity: (['high', 'medium', 'low'].includes(a?.severity) ? a.severity : 'medium') as
                  | 'high'
                  | 'medium'
                  | 'low',
              }))
            : base.executiveSummary.alerts

          const result: ContractSummaryResult = {
            contractTitle:
              typeof parsed.contractTitle === 'string' && parsed.contractTitle
                ? parsed.contractTitle.slice(0, 120)
                : base.contractTitle,
            estimatedPages: base.estimatedPages,
            focus,
            executiveSummary: {
              headline: `${clauses.length} بنود جوهرية مستخرجة، منها ${attentionCount} تحتاج انتباهاً قبل الاعتماد.`,
              totalClauses: clauses.length,
              attentionCount,
              alerts,
              closingNote:
                typeof parsed.closingNote === 'string' && parsed.closingNote
                  ? parsed.closingNote.slice(0, 300)
                  : base.executiveSummary.closingNote,
            },
            clauses,
            obligations: {
              firstParty: Array.isArray(parsed?.obligations?.firstParty)
                ? parsed.obligations.firstParty.slice(0, 6).map(String)
                : base.obligations.firstParty,
              secondParty: Array.isArray(parsed?.obligations?.secondParty)
                ? parsed.obligations.secondParty.slice(0, 6).map(String)
                : base.obligations.secondParty,
            },
            durationsAndNotices: Array.isArray(parsed?.durationsAndNotices)
              ? parsed.durationsAndNotices.slice(0, 6).map((d: any) => ({
                  label: typeof d?.label === 'string' ? d.label.slice(0, 100) : 'مدة تعاقدية',
                  value: typeof d?.value === 'string' ? d.value.slice(0, 200) : '',
                  warning: typeof d?.warning === 'string' && d.warning ? d.warning.slice(0, 200) : undefined,
                }))
              : base.durationsAndNotices,
            engine: 'ollama',
          }
          return NextResponse.json(result)
        }
      }
    } catch {
      // Fall back to deterministic summary below
    }

    const { isSample: _s, ...fallback } = base
    return NextResponse.json(fallback)
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/ai/summarize-contract' })
  }
}
