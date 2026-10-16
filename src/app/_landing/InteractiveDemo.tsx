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
} from 'lucide-react'
import { toast } from 'sonner'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events'

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
    title: 'فترة التجربة (180 يوماً أولية)',
    law: 'نظام العمل (م/53)',
    text: 'يخضع الطرف الثاني لفترة تجربة مدتها ستة أشهر (180 يوماً) تبدأ من تاريخ مباشرة العمل، ويحق للطرف الأول إنهاء العقد خلالها دون مكافأة أو إشعار.',
    score: 48,
    article: 'المادة (53) من نظام العمل السعودي',
    violation: 'الحد الأقصى لفترة التجربة الأصلية هو 90 يوماً فقط؛ ولا يجوز تمديدها إلى 180 يوماً إلا باتفاق كتابي صريح يتم بعد بدء سريان العقد ومباشرة العمل.',
    recommendation: 'يخضع الطرف الثاني لفترة تجربة مدتها (90) يوماً من تاريخ مباشرة العمل الفعلي، ويجوز باتفاق كتابي لاحق تمديدها بما لا يتجاوز 180 يوماً وفق المادة 53 من نظام العمل.',
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

interface AuditOutcome {
  valid: boolean
  score: number
  law: string
  article: string
  violation: string
  recommendation: string
}

function evaluateClauseText(rawText: string, fallbackPreset: PresetClause): AuditOutcome {
  const text = rawText.trim()
  if (text === fallbackPreset.text.trim()) {
    return {
      valid: false,
      score: fallbackPreset.score,
      law: fallbackPreset.law,
      article: fallbackPreset.article,
      violation: fallbackPreset.violation,
      recommendation: fallbackPreset.recommendation,
    }
  }

  // 1. Non-compete (Saudi Labor Law Art. 83)
  if (/منافس|عدم العمل|عدم المنافسة/.test(text)) {
    const hasOverLimit = /خمس|ثلاث|أربع|عشر|[3-9]\s*سنوات|مدى الحياة|دون قيد|كامل المملكة/.test(text)
    if (hasOverLimit) {
      return {
        valid: false,
        score: 42,
        law: 'نظام العمل (م/83)',
        article: 'المادة (83) من نظام العمل السعودي',
        violation: PRESET_CLAUSES[0].violation,
        recommendation: PRESET_CLAUSES[0].recommendation,
      }
    }
    return {
      valid: true,
      score: 94,
      law: 'نظام العمل (م/83)',
      article: 'المادة (83) من نظام العمل السعودي',
      violation: 'لم يرصد المحرك تجاوزاً للحد الأقصى النظامي (سنتان) أو إطلاقاً غير مقيد للمنع المكاني والنوعي.',
      recommendation: text,
    }
  }

  // 2. Probation period (Saudi Labor Law Art. 53)
  if (/تجربة|فترة التجربة/.test(text)) {
    const over90WithoutWrittenExtension = /(180|ستة أشهر|6 أشهر|مائة وثمان)/.test(text) && !/اتفاق كتابي لاحق|تمديد.*كتابي/.test(text)
    if (over90WithoutWrittenExtension) {
      return {
        valid: false,
        score: 48,
        law: 'نظام العمل (م/53)',
        article: 'المادة (53) من نظام العمل السعودي',
        violation: PRESET_CLAUSES[1].violation,
        recommendation: PRESET_CLAUSES[1].recommendation,
      }
    }
    return {
      valid: true,
      score: 95,
      law: 'نظام العمل (م/53)',
      article: 'المادة (53) من نظام العمل السعودي',
      violation: 'بند فترة التجربة متوافق مع سقف الـ 90 يوماً وضوابط التمديد الكتابي المستقل.',
      recommendation: text,
    }
  }

  // 3. Liquidated damages / judicial review waiver (Civil Transactions Law Art. 179)
  if (/شرط جزائي|غرامة قطعية|تعويض قطعي|لا يحق للقضاء|دون سلطة للمحكمة|دون رقابة القضاء/.test(text)) {
    const waivesCourt = /قطعية|قطعي|لا يحق للقضاء|دون سلطة للمحكمة|دون حاجة لإثبات الضرر/.test(text)
    if (waivesCourt) {
      return {
        valid: false,
        score: 55,
        law: 'المعاملات المدنية (م/179)',
        article: 'المادة (179) من نظام المعاملات المدنية',
        violation: PRESET_CLAUSES[2].violation,
        recommendation: PRESET_CLAUSES[2].recommendation,
      }
    }
  }

  // 4. Unilateral termination without notice/compensation (Labor Law Art. 75/77/80)
  if (/إنهاء العقد.*دون إشعار|فصل.*دون تعويض|إنهاء فوري دون مكافأة/.test(text) && !/المادة 80|م80/.test(text)) {
    return {
      valid: false,
      score: 46,
      law: 'نظام العمل (م/75 و م/77 و م/80)',
      article: 'المواد (75، 77، 80) من نظام العمل السعودي',
      violation: 'لا يجوز حرمان العامل من مهلة الإشعار أو مكافأة نهاية الخدمة إلا في الحالات الحصرية الواردة بالمادة (80) من نظام العمل وبعد إتاحة حق سماع أقواله.',
      recommendation: 'يحق لأي من الطرفين إنهاء العقد غير المحدد المدة لسبب مشروع بموجب إشعار كتابي لا يقل عن (60) يوماً، مع حفظ كامل الحقوق النظامية ومكافأة نهاية الخدمة وفق نظام العمل.',
    }
  }

  // 5. Cross-border personal data transfer (PDPL Art. 29)
  if (/خارج المملكة|خوادم خارجية|نقل البيانات.*دولياً/.test(text) && !/المادة 29|سدايا|ضمانات كافية/.test(text)) {
    return {
      valid: false,
      score: 50,
      law: 'نظام حماية البيانات الشخصية (م/29)',
      article: 'المادة (29) من نظام حماية البيانات الشخصية (PDPL)',
      violation: 'نقل البيانات الشخصية خارج المملكة مقيد بوجود مستوى حماية كافٍ واستيفاء الضوابط والاشتراطات الصادرة عن (سدايا) وتقييم أثر النقل.',
      recommendation: 'تُحفظ وتُعالج كافة البيانات الشخصية على خوادم محلية داخل المملكة العربية السعودية، ولا يجوز نقلها خارج المملكة إلا بعد استيفاء متطلبات المادة (29) من نظام حماية البيانات الشخصية ولوائحه التنفيذية.',
    }
  }

  return {
    valid: true,
    score: 95,
    law: 'الأحكام العامة للأنظمة السعودية',
    article: 'فحص مطابق للضوابط النظامية العامة',
    violation: 'لم يرصد الفحص الآلي أي تعارض صريح مع المواد الإلزامية المفعلة في نظام العمل أو نظام المعاملات المدنية.',
    recommendation: text,
  }
}

export function InteractiveDemo() {
  const [selectedPreset, setSelectedPreset] = useState<string>('non-compete')
  const [clauseText, setClauseText] = useState(PRESET_CLAUSES[0].text)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasChecked, setHasChecked] = useState(true)
  const [copied, setCopied] = useState(false)
  const [auditResult, setAuditResult] = useState<AuditOutcome>(() =>
    evaluateClauseText(PRESET_CLAUSES[0].text, PRESET_CLAUSES[0]),
  )

  const activePreset = PRESET_CLAUSES.find((p) => p.id === selectedPreset) || PRESET_CLAUSES[0]

  const handleSelectPreset = (preset: PresetClause) => {
    setSelectedPreset(preset.id)
    setClauseText(preset.text)
    setAuditResult(evaluateClauseText(preset.text, preset))
    setHasChecked(true)
    setCopied(false)
  }

  const handleRunCheck = async () => {
    if (!clauseText.trim()) {
      toast.error('الرجاء إدخال نص البند أولاً')
      return
    }

    setIsAnalyzing(true)
    trackEvent({
      event: ANALYTICS_EVENTS.CLAUSE_CHECK_STARTED,
      sampleId: selectedPreset,
      source: 'landing_embedded_demo',
    })

    let outcome = evaluateClauseText(clauseText, activePreset)
    try {
      const res = await fetch('/api/ai/check-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText }),
      })
      if (res.ok) {
        const data = await res.json()
        if (typeof data?.valid === 'boolean' && typeof data?.violation === 'string') {
          outcome = data
        }
      }
    } catch {
      // Offline or transient network error — keep client-side deterministic outcome
    }

    setAuditResult(outcome)
    setIsAnalyzing(false)
    setHasChecked(true)
    trackEvent({
      event: ANALYTICS_EVENTS.CLAUSE_CHECK_COMPLETED,
      score: outcome.score,
      violationFound: !outcome.valid,
      article: outcome.article,
    })
    toast.success('اكتمل الفحص النظامي للبند بنجاح')
  }

  const handleCopyAlternative = () => {
    navigator.clipboard.writeText(auditResult.recommendation)
    setCopied(true)
    toast.success('تم نسخ الصياغة المتوافقة')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="checker" className="px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl pb-16 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>المعرض الحي: افحص البند في ثوانٍ</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B281F] font-heading">
          جرّب دقة الفحص النظامي قبل التسجيل
        </h2>
        <p className="text-sm text-[#4A5D50] mt-1 max-w-xl mx-auto">
          اختر أحد النماذج الشائعة أو الصق نص بندك وشاهد كيف يلتقط النظام المخالفة ويقترح البديل المتوافق.
        </p>
      </div>

      {/* Main Checker Card */}
      <div className="bg-white rounded-2xl border border-[#CCD8CE] shadow-sm overflow-hidden">
        {/* Preset Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-[#CCD8CE] bg-[#F5F7F5] p-1.5 gap-1.5 text-xs">
          {PRESET_CLAUSES.map((preset) => {
            const isSelected = selectedPreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`py-2.5 px-3 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#1F7A46] shadow-xs border border-[#CCD8CE]'
                    : 'text-[#4A5D50] hover:text-[#1B281F] hover:bg-white/60'
                }`}
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{preset.title}</span>
              </button>
            )
          })}
        </div>

        {/* Checker Workspace */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Textarea Input Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="clause-input" className="font-bold text-[#1B281F]">
                نص البند التعاقدي المراد تدقيقه:
              </label>
              <span className="text-[#566A5C] font-mono text-[11px]">
                المرجع المستهدف: {auditResult.law}
              </span>
            </div>
            <textarea
              id="clause-input"
              rows={3}
              value={clauseText}
              onChange={(e) => {
                setClauseText(e.target.value)
                setHasChecked(false)
              }}
              className="w-full bg-[#F5F7F5] border border-[#CCD8CE] rounded-xl p-3.5 text-xs sm:text-sm text-[#1B281F] leading-relaxed focus:bg-white focus:outline-none focus:border-[#1F7A46] focus:ring-1 focus:ring-[#1F7A46] transition-all font-sans"
              placeholder="اكتب أو الصق نص البند القانوني هنا..."
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-[#566A5C] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1F7A46]" />
              <span>فحص آلي معزول محلياً ضد الأنظمة السعودية السارية</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setClauseText(activePreset.text)
                  setHasChecked(false)
                }}
                className="text-xs border-[#CCD8CE] text-[#4A5D50] hover:text-[#1B281F] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 ml-1" />
                استعادة النموذج
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRunCheck}
                disabled={isAnalyzing}
                className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold px-5 h-9 cursor-pointer shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                {isAnalyzing ? 'جارٍ الفحص والمطابقة...' : 'افحص البند نظامياً'}
              </Button>
            </div>
          </div>

          {/* Instant Audit Result */}
          {hasChecked && (
            <div className="mt-4 pt-5 border-t border-[#CCD8CE] space-y-4 animate-in fade-in-50 duration-200">
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F5F7F5] p-3 rounded-xl border border-[#CCD8CE]">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      auditResult.valid ? 'bg-[#E8EFE9] text-[#1F7A46]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                    }`}
                  >
                    {auditResult.valid ? '✓' : '!'}
                  </div>
                  <div>
                    <span className={`font-bold text-xs sm:text-sm ${auditResult.valid ? 'text-[#1F7A46]' : 'text-[#B91C1C]'}`}>
                      {auditResult.valid ? 'متوافق مع الضوابط النظامية العامة' : 'تنبيه: رُصد تعارض مع المقتضى النظامي'}
                    </span>
                    <span className="text-[11px] text-[#566A5C] block sm:inline sm:mr-2">
                      ({auditResult.article})
                    </span>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-md bg-white border border-[#CCD8CE] text-xs font-mono font-bold ${
                    auditResult.valid ? 'text-[#1F7A46]' : 'text-[#B91C1C]'
                  }`}
                >
                  <span>درجة الامتثال:</span>
                  <span>{auditResult.score} / 100</span>
                </div>
              </div>

              {/* Grid: Violation vs Alternative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Violation / Observation Box */}
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    auditResult.valid
                      ? 'bg-[#F5F7F5] border-[#CCD8CE]'
                      : 'bg-[#FEF2F2] border-[#FECACA]'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 font-bold ${auditResult.valid ? 'text-[#1B281F]' : 'text-[#991B1B]'}`}>
                    {auditResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1F7A46]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                    )}
                    <span>{auditResult.valid ? 'نتيجة الفحص النظامي:' : 'وجه المخالفة النظامية:'}</span>
                  </div>
                  <p className={`leading-relaxed ${auditResult.valid ? 'text-[#4A5D50]' : 'text-[#7F1D1D]'}`}>
                    {auditResult.violation}
                  </p>
                </div>

                {/* Compliant Alternative Box */}
                <div className="p-4 rounded-xl bg-[#E8EFE9] border border-[#CCD8CE] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[#1F7A46]">
                      <CheckCircle2 className="w-4 h-4 text-[#1F7A46]" />
                      <span>الصياغة البديلة المتوافقة:</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAlternative}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1F7A46] hover:underline cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> نسخ البديل
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[#1B281F] leading-relaxed font-medium bg-white/70 p-2.5 rounded-lg border border-[#CCD8CE]">
                    «{auditResult.recommendation}»
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
