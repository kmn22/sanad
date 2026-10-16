import { NextResponse } from 'next/server'
import { requestIp } from '@/lib/audit'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'
import { OLLAMA_URL, OLLAMA_MODEL } from '@/lib/ai/ollama'

export interface ClauseCheckResult {
  valid: boolean
  score: number
  law: string
  article: string
  violation: string
  recommendation: string
  engine: 'rule' | 'ollama'
}

export function runDeterministicClauseRules(rawText: string): (ClauseCheckResult & { matchedRule: boolean }) {
  const text = rawText.trim()

  if (/منافس|عدم العمل|عدم المنافسة/.test(text)) {
    const hasOverLimit = /خمس|ثلاث|أربع|عشر|[3-9]\s*سنوات|مدى الحياة|دون قيد|كامل المملكة/.test(text)
    if (hasOverLimit) {
      return {
        valid: false,
        score: 42,
        law: 'نظام العمل (م/83)',
        article: 'المادة (83) من نظام العمل السعودي',
        violation:
          'اشتراط عدم المنافسة لمدة تتجاوز الحد الأقصى النظامي (سنتان)، أو إطلاق المنع في كامل المملكة دون تحديد مكاني ونوعي صريح يجعله عرضة للبطلان القضائي.',
        recommendation:
          'يلتزم الطرف الثاني بعدم منافسة الطرف الأول في نشاط (المقاولات) داخل مدينة (الرياض) لمدة (سنة واحدة) تبدأ من تاريخ انتهاء عقد العمل، حفظاً لأسرار العمل المشروعة.',
        engine: 'rule',
        matchedRule: true,
      }
    }
    return {
      valid: true,
      score: 94,
      law: 'نظام العمل (م/83)',
      article: 'المادة (83) من نظام العمل السعودي',
      violation: 'لم يرصد المحرك تجاوزاً للحد الأقصى النظامي (سنتان) أو إطلاقاً غير مقيد للمنع المكاني والنوعي.',
      recommendation: text,
      engine: 'rule',
      matchedRule: true,
    }
  }

  if (/تجربة|فترة التجربة/.test(text)) {
    const over90WithoutWrittenExtension =
      /(180|ستة أشهر|6 أشهر|مائة وثمان)/.test(text) && !/اتفاق كتابي لاحق|تمديد.*كتابي/.test(text)
    if (over90WithoutWrittenExtension) {
      return {
        valid: false,
        score: 48,
        law: 'نظام العمل (م/53)',
        article: 'المادة (53) من نظام العمل السعودي',
        violation:
          'الحد الأقصى لفترة التجربة الأصلية هو 90 يوماً فقط؛ ولا يجوز تمديدها إلى 180 يوماً إلا باتفاق كتابي صريح يتم بعد بدء سريان العقد ومباشرة العمل.',
        recommendation:
          'يخضع الطرف الثاني لفترة تجربة مدتها (90) يوماً من تاريخ مباشرة العمل الفعلي، ويجوز باتفاق كتابي لاحق تمديدها بما لا يتجاوز 180 يوماً وفق المادة 53 من نظام العمل.',
        engine: 'rule',
        matchedRule: true,
      }
    }
    return {
      valid: true,
      score: 95,
      law: 'نظام العمل (م/53)',
      article: 'المادة (53) من نظام العمل السعودي',
      violation: 'بند فترة التجربة متوافق مع سقف الـ 90 يوماً وضوابط التمديد الكتابي المستقل.',
      recommendation: text,
      engine: 'rule',
      matchedRule: true,
    }
  }

  if (/شرط جزائي|غرامة قطعية|تعويض قطعي|لا يحق للقضاء|دون سلطة للمحكمة|دون رقابة القضاء/.test(text)) {
    const waivesCourt = /قطعية|قطعي|لا يحق للقضاء|دون سلطة للمحكمة|دون حاجة لإثبات الضرر/.test(text)
    if (waivesCourt) {
      return {
        valid: false,
        score: 55,
        law: 'المعاملات المدنية (م/179)',
        article: 'المادة (179) من نظام المعاملات المدنية',
        violation:
          'النص على عدم جواز تدخل القضاء باطل نظاماً؛ إذ للمحكمة بناءً على طلب المدين تخفيض التعويض المتفق عليه إذا ثبت أن التعويض كان مبالغاً فيه أو أن الالتزام نُفذ جزئياً.',
        recommendation:
          'في حال إخلال المدين بالتزامه في الموعد المحدد، يستحق الدائن تعويضاً اتفاقياً عن الضرر الفعلي، وتخضع تقديرات التعويض للضوابط النظامية المقررة بالمادة 179 من نظام المعاملات المدنية.',
        engine: 'rule',
        matchedRule: true,
      }
    }
  }

  if (/إنهاء العقد.*دون إشعار|فصل.*دون تعويض|إنهاء فوري دون مكافأة/.test(text) && !/المادة 80|م80/.test(text)) {
    return {
      valid: false,
      score: 46,
      law: 'نظام العمل (م/75 و م/77 و م/80)',
      article: 'المواد (75، 77، 80) من نظام العمل السعودي',
      violation:
        'لا يجوز حرمان العامل من مهلة الإشعار أو مكافأة نهاية الخدمة إلا في الحالات الحصرية الواردة بالمادة (80) من نظام العمل وبعد إتاحة حق سماع أقواله.',
      recommendation:
        'يحق لأي من الطرفين إنهاء العقد غير المحدد المدة لسبب مشروع بموجب إشعار كتابي لا يقل عن (60) يوماً، مع حفظ كامل الحقوق النظامية ومكافأة نهاية الخدمة وفق نظام العمل.',
      engine: 'rule',
      matchedRule: true,
    }
  }

  if (/خارج المملكة|خوادم خارجية|نقل البيانات.*دولياً/.test(text) && !/المادة 29|سدايا|ضمانات كافية/.test(text)) {
    return {
      valid: false,
      score: 50,
      law: 'نظام حماية البيانات الشخصية (م/29)',
      article: 'المادة (29) من نظام حماية البيانات الشخصية (PDPL)',
      violation:
        'نقل البيانات الشخصية خارج المملكة مقيد بوجود مستوى حماية كافٍ واستيفاء الضوابط والاشتراطات الصادرة عن (سدايا) وتقييم أثر النقل.',
      recommendation:
        'تُحفظ وتُعالج كافة البيانات الشخصية على خوادم محلية داخل المملكة العربية السعودية، ولا يجوز نقلها خارج المملكة إلا بعد استيفاء متطلبات المادة (29) من نظام حماية البيانات الشخصية ولوائحه التنفيذية.',
      engine: 'rule',
      matchedRule: true,
    }
  }

  return {
    valid: true,
    score: 95,
    law: 'الأحكام العامة للأنظمة السعودية',
    article: 'فحص مطابق للضوابط النظامية العامة',
    violation: 'لم يرصد الفحص الآلي أي تعارض صريح مع المواد الإلزامية المفعلة في نظام العمل أو نظام المعاملات المدنية.',
    recommendation: text,
    engine: 'rule',
    matchedRule: false,
  }
}

export async function POST(req: Request) {
  try {
    const ip = requestIp(req)
    const limiter = await rateLimit(`clause-check:ip:${ip}`, 30, 15 * 60 * 1000)
    if (!limiter.success) {
      return NextResponse.json({ error: 'تم تجاوز حد طلبات الفحص المؤقت، يرجى المحاولة بعد قليل' }, { status: 429 })
    }

    const body = await readJsonLimited<{ clauseText?: unknown }>(req, 16 * 1024)
    const clauseText = typeof body?.clauseText === 'string' ? body.clauseText.trim().slice(0, 3000) : ''
    if (!clauseText) {
      return NextResponse.json({ error: 'الرجاء إدخال نص البند أولاً' }, { status: 400 })
    }

    const ruleOutcome = runDeterministicClauseRules(clauseText)
    if (ruleOutcome.matchedRule) {
      const { matchedRule: _m, ...result } = ruleOutcome
      return NextResponse.json(result)
    }

    // Custom clause not covered by a deterministic regex: consult local Ollama
    // with a short timeout, falling back cleanly if Ollama is busy.
    try {
      const res = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'أنت مدقق عقود سعودي. افحص البند التعاقدي التالي مقابل نظام العمل السعودي ونظام المعاملات المدنية ونظام حماية البيانات الشخصية (PDPL). ' +
                'أعد كائن JSON فقط بالحقول التالية بالعربية: ' +
                '{"valid": boolean, "score": number (0-100), "law": string, "article": string, "violation": string, "recommendation": string}.',
            },
            { role: 'user', content: clauseText },
          ],
        }),
        signal: AbortSignal.timeout(8_000),
      })
      if (res.ok) {
        const data = await res.json()
        const raw = data?.choices?.[0]?.message?.content
        if (typeof raw === 'string') {
          const parsed = JSON.parse(raw)
          if (
            typeof parsed.valid === 'boolean' &&
            typeof parsed.violation === 'string' &&
            typeof parsed.recommendation === 'string'
          ) {
            return NextResponse.json({
              valid: parsed.valid,
              score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.score))) : parsed.valid ? 92 : 52,
              law: typeof parsed.law === 'string' && parsed.law ? parsed.law.slice(0, 120) : 'الأنظمة السعودية السارية',
              article: typeof parsed.article === 'string' && parsed.article ? parsed.article.slice(0, 160) : 'ضوابط الصياغة النظامية',
              violation: parsed.violation.slice(0, 800),
              recommendation: parsed.recommendation.slice(0, 1000),
              engine: 'ollama',
            } satisfies ClauseCheckResult)
          }
        }
      }
    } catch {
      // Fall back to deterministic result below
    }

    const { matchedRule: _m, ...fallback } = ruleOutcome
    return NextResponse.json(fallback)
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/ai/check-clause' })
  }
}
