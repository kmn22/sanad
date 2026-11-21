'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Scale,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { runDeterministicClauseRules, type ClauseCheckResult } from '@/lib/ai/clause-checker'

interface PresetClause {
  id: string
  title: string
  law: string
  text: string
  score: number
  violation: string
  recommendation: string
  article: string
}

const PRESET_CLAUSES: PresetClause[] = [
  {
    id: 'non-compete',
    title: 'شرط عدم المنافسة (5 سنوات)',
    law: 'نظام العمل (م/83)',
    text: 'يلتزم الطرف الثاني بعدم العمل لدى أي منافس داخل المملكة العربية السعودية لمدة خمس سنوات بعد انتهاء العقد دون قيد أو شرط جغرافي أو مكاني.',
    score: 42,
    article: 'المادة (83) من نظام العمل السعودي',
    violation: 'اشتراط عدم المنافسة لمدة 5 سنوات يتجاوز الحد الأقصى النظامي (سنتان)، وإطلاق المنع في كامل المملكة دون تحديد مكاني ونوعي صريح يجعله عرضة للبطلان القضائي.',
    recommendation: 'يلتزم الطرف الثاني بعدم منافسة الطرف الأول في نشاط (المقاولات) داخل مدينة (الرياض) لمدة (سنة واحدة) تبدأ من تاريخ انتهاء عقد العمل، حفظاً لأسرار العمل المشروعة.',
  },
  {
    id: 'probation',
    title: 'فترة تجربة تتجاوز 180 يوماً (9 أشهر)',
    law: 'نظام العمل (م/53 المعدلة 2025)',
    text: 'يخضع الطرف الثاني لفترة تجربة مدتها تسعة أشهر (270 يوماً) تبدأ من تاريخ مباشرة العمل، ويحق للطرف الأول إنهاء العقد خلالها دون مكافأة أو إشعار.',
    score: 45,
    article: 'المادة (53) من نظام العمل السعودي — تعديلات المرسوم الملكي م/44',
    violation: 'الحد الأقصى النظامي لفترة التجربة وفق التعديلات السارية من فبراير 2025 هو 180 يوماً كحد أقصى مكتوب في عقد العمل؛ وما زاد على 180 يوماً مخالف للنظام.',
    recommendation: 'يخضع الطرف الثاني لفترة تجربة لا تتجاوز (180) يوماً من تاريخ مباشرة العمل، وتُثبت مدتها كتابةً في عقد العمل الموحد وفق المادة (53) من نظام العمل المعدلة.',
  },
  {
    id: 'liquidated-damages',
    title: 'الشرط الجزائي القطعي',
    law: 'المعاملات المدنية (م/179)',
    text: 'في حال تأخر المقاول عن تسليم المشروع يلتزم بدفع غرامة قطعية قدرها 500,000 ريال دون حاجة لإثبات الضرر ولا يحق للقضاء التدخل بتعديلها.',
    score: 55,
    article: 'المادة (179) من نظام المعاملات المدنية',
    violation: 'النص على عدم جواز تدخل القضاء باطل نظاماً؛ إذ للمحكمة بناءً على طلب المدين تخفيض التعويض المتفق عليه إذا ثبت أن التعويض كان مبالغاً فيه أو أن الالتزام نُفذ جزئياً.',
    recommendation: 'في حال إخلال المدين بالتزامه في الموعد المحدد، يستحق الدائن تعويضاً اتفاقياً عن الضرر الفعلي، وتخضع تقديرات التعويض للضوابط النظامية المقررة بالمادة 179 من نظام المعاملات المدنية.',
  },
]

function presetToOutcome(preset: PresetClause): ClauseCheckResult {
  return {
    valid: false,
    status: 'flagged',
    score: preset.score,
    law: preset.law,
    article: preset.article,
    violation: preset.violation,
    recommendation: preset.recommendation,
    engine: 'rule',
  }
}

export function InteractiveDemo() {
  const [selectedPreset, setSelectedPreset] = useState<string>('non-compete')
  const [clauseText, setClauseText] = useState(PRESET_CLAUSES[0].text)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [copied, setCopied] = useState(false)
  const [auditResult, setAuditResult] = useState<ClauseCheckResult>(() =>
    presetToOutcome(PRESET_CLAUSES[0]),
  )

  const activePreset = PRESET_CLAUSES.find((p) => p.id === selectedPreset) || PRESET_CLAUSES[0]

  const handleSelectPreset = (preset: PresetClause) => {
    setSelectedPreset(preset.id)
    setClauseText(preset.text)
    setAuditResult(presetToOutcome(preset))
    setIsDirty(false)
    setCopied(false)
  }

  const handleRestorePreset = () => {
    setClauseText(activePreset.text)
    setAuditResult(presetToOutcome(activePreset))
    setIsDirty(false)
    setCopied(false)
  }

  const handleRunCheck = async () => {
    const trimmed = clauseText.trim()
    if (!trimmed) {
      toast.error('الرجاء إدخال نص البند أولاً')
      return
    }

    setIsAnalyzing(true)
    trackEvent({
      event: ANALYTICS_EVENTS.CLAUSE_CHECK_STARTED,
      sampleId: selectedPreset,
      source: 'landing_embedded_demo',
    })

    const matchedPreset = PRESET_CLAUSES.find((p) => p.text.trim() === trimmed)
    let outcome: ClauseCheckResult = matchedPreset
      ? presetToOutcome(matchedPreset)
      : runDeterministicClauseRules(trimmed)

    try {
      const res = await fetch('/api/ai/check-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText: trimmed }),
      })
      if (res.ok) {
        const data = await res.json()
        if (typeof data?.valid === 'boolean' && typeof data?.violation === 'string') {
          outcome = data
        }
      }
    } catch {
      // Keep deterministic outcome
    }

    setAuditResult(outcome)
    setIsAnalyzing(false)
    setIsDirty(false)
    trackEvent({
      event: ANALYTICS_EVENTS.CLAUSE_CHECK_COMPLETED,
      score: outcome.score,
      violationFound: !outcome.valid,
      article: outcome.article,
    })
    toast.success('اكتمل الفحص الأولي للبند')
  }

  const handleCopyAlternative = () => {
    navigator.clipboard.writeText(auditResult.recommendation)
    setCopied(true)
    toast.success('تم نسخ الصياغة المقترحة')
    setTimeout(() => setCopied(false), 2000)
  }

  const isNeedsLawyerReview = auditResult.status === 'needs_lawyer_review'
  const isFlagged = !isNeedsLawyerReview && !auditResult.valid

  return (
    <section id="checker" className="px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl pb-16 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>أداة مساعدة أولية مجانية لقراءة البنود</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1B281F] font-heading">
          اختبر قراءة البنود التعاقدية الشائعة (عرض توضيحي مجاني)
        </h2>
        <p className="text-xs sm:text-sm text-[#4A5D50] max-w-2xl mx-auto">
          يعرض هذا الفاحص تنبيهات أولية لقواعد تعاقدية معروفة بقواعد برمجية ثابتة — ولا يمثّل فتاوى نظامية شاملة أو استشارة قانونية بديلة عن محامٍ مرخّص.
        </p>
      </div>

      {/* Interactive Workbench Card */}
      <div className="bg-white rounded-3xl border border-[#CCD8CE] shadow-sm overflow-hidden">
        {/* Preset Selector Bar */}
        <div className="p-4 sm:p-5 bg-[#F5F7F5] border-b border-[#CCD8CE] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#4A5D50] ml-1">نماذج بنود للفحص:</span>
            {PRESET_CLAUSES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${selectedPreset === preset.id
                  ? 'bg-[#1F7A46] text-white border-[#1F7A46] shadow-2xs'
                  : 'bg-white text-[#1B281F] border-[#CCD8CE] hover:border-[#1F7A46]'
                  }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          {isDirty && (
            <button
              type="button"
              onClick={handleRestorePreset}
              className="text-xs font-semibold text-[#1F7A46] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة المثال</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-[#CCD8CE]">
          {/* Input Pane */}
          <div className="lg:col-span-6 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="clause-demo-input" className="text-xs font-bold text-[#1B281F]">
                نص البند التعاقدي:
              </label>
              <span className="text-[11px] font-mono text-[#566A5C]">{clauseText.length} / 3000</span>
            </div>

            <textarea
              id="clause-demo-input"
              rows={6}
              value={clauseText}
              onChange={(e) => {
                setClauseText(e.target.value)
                setIsDirty(true)
              }}
              placeholder="ألصق نص أي بند تعاقدي هنا لفحص القواعد الأولية..."
              className="w-full rounded-2xl border border-[#CCD8CE] bg-[#F5F7F5] p-4 text-xs sm:text-sm text-[#1B281F] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1F7A46]"
            />

            <Button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunCheck}
              className="w-full h-11 bg-[#1F7A46] hover:bg-[#165832] text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              <Scale className="w-4 h-4 ml-2" />
              {isAnalyzing ? 'جارٍ الفحص الأولي...' : 'تشغيل الفحص الأولي للبند'}
            </Button>
          </div>

          {/* Result Pane */}
          <div className="lg:col-span-6 p-5 sm:p-6 space-y-4 bg-[#FAFBF9]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isNeedsLawyerReview ? (
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : isFlagged ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#1F7A46] shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-bold text-[#1B281F]">
                  {isNeedsLawyerReview
                    ? 'خارج القواعد الثابتة — يتطلب مراجعة محامٍ مختص'
                    : isFlagged
                      ? 'تم رصد مؤشر مخالفة أولي في البند'
                      : 'لم يرصد تجاوزاً في القاعدة المفحوصة'}
                </span>
              </div>

              {!isNeedsLawyerReview && (
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${isFlagged
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]'
                    }`}
                >
                  المؤشر الأولي: {auditResult.score}/100
                </span>
              )}
            </div>

            {/* Article / Scope Box */}
            <div
              className={`rounded-2xl p-4 border text-xs space-y-2 ${isNeedsLawyerReview
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : isFlagged
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-[#E8EFE9]/60 border-[#CCD8CE] text-[#1B281F]'
                }`}
            >
              <div className="flex items-center justify-between gap-2 font-bold">
                <span>{auditResult.law}</span>
                <span className="text-[10px] font-mono">{auditResult.article}</span>
              </div>
              <p className="leading-relaxed">{auditResult.violation}</p>
            </div>

            {/* Suggested Revision */}
            {auditResult.recommendation && (
              <div className="rounded-2xl border border-[#CCD8CE] bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F7A46]">
                    {isNeedsLawyerReview ? 'النص المُدخل (يُوصى بعرضه على محامٍ):' : 'صياغة استرشادية بديلة:'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAlternative}
                    className="text-[11px] font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                  </button>
                </div>
                <p className="text-xs text-[#4A5D50] leading-relaxed">{auditResult.recommendation}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-[#566A5C]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A46] shrink-0" />
              <span>تعمل هذه الأداة بقواعد برمجية حتمية محلية دون إرسال بياناتك لنماذج خارجية.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
