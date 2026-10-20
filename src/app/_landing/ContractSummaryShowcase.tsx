'use client'

import { useState } from 'react'
import {
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  RotateCcw,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  SAMPLE_SUPPLY_CONTRACT_SUMMARY,
  SAMPLE_SUPPLY_CONTRACT_TEXT,
  buildDeterministicContractSummary,
  type ContractSummaryResult,
  type ExtractionFocus,
  type ClauseTag,
} from '@/lib/ai/contract-summarizer'

const FOCUS_OPTIONS: Array<{ id: ExtractionFocus; label: string }> = [
  { id: 'all', label: 'الملخّص الكامل' },
  { id: 'core_clauses', label: 'البنود الجوهرية' },
  { id: 'obligations', label: 'التزامات كل طرف' },
  { id: 'durations', label: 'المدد والإشعارات' },
  { id: 'risks', label: 'المخاطر المحتملة' },
]

const TAG_STYLES: Record<ClauseTag, string> = {
  core: 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]',
  attention: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
  risk: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
  safe: 'bg-[#E8EFE9] text-[#165832] border-[#CCD8CE]',
}

export function ContractSummaryShowcase() {
  const [focus, setFocus] = useState<ExtractionFocus>('all')
  const [customMode, setCustomMode] = useState(false)
  const [contractText, setContractText] = useState(SAMPLE_SUPPLY_CONTRACT_TEXT)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [summary, setSummary] = useState<ContractSummaryResult>(SAMPLE_SUPPLY_CONTRACT_SUMMARY)

  const handleSummarize = async () => {
    const trimmed = contractText.trim()
    if (trimmed.length < 20) {
      toast.error('الرجاء لصق نص العقد (20 حرفاً على الأقل) لتلخيصه')
      return
    }
    setLoading(true)
    let next: ContractSummaryResult = buildDeterministicContractSummary(trimmed, focus)
    try {
      const res = await fetch('/api/ai/summarize-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: trimmed, focus }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.clauses)) {
          next = data
        }
      }
    } catch {
      // Keep deterministic fallback
    }
    setSummary(next)
    setLoading(false)
    toast.success('اكتمل تلخيص العقد واستخراج البنود والمخاطر')
  }

  const handleCopySummary = () => {
    const lines = [
      `ملخّص عقد: ${summary.contractTitle}`,
      summary.executiveSummary.headline,
      '',
      'أهم التنبيهات قبل الاعتماد:',
      ...summary.executiveSummary.alerts.map((a) => `- ${a.title} (${a.clauseRef}): ${a.detail}`),
      '',
      'البنود المستخرجة:',
      ...summary.clauses.map((c) => `${c.number}. [${c.tagLabel}] ${c.title}: ${c.summary} (${c.statuteRef})`),
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    toast.success('تم نسخ ملخّص العقد إلى الحافظة')
    setTimeout(() => setCopied(false), 2000)
  }

  const visibleClauses = summary.clauses.filter((c) => {
    if (focus === 'core_clauses') return c.tag === 'core' || c.tag === 'safe'
    if (focus === 'risks') return c.tag === 'risk' || c.tag === 'attention'
    return true
  })

  return (
    <section id="summarizer" className="py-14 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl scroll-mt-24">
      {/* Section Header */}
      <div className="text-center mb-8 space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
          <FileText className="w-3.5 h-3.5" />
          <span>تلخيص العقود الطويلة: دقائق بدل ساعات</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#1B281F] font-heading">
          تلخيص العقود: من 60 صفحة إلى ملخّص ببنودها والتزاماتها ومخاطرها
        </h2>
        <p className="text-sm sm:text-base text-[#4A5D50] max-w-2xl mx-auto leading-relaxed">
          يقرأ محرك سَنَد السيادي عقودك الطويلة بالكامل، ويستخرج بنودها الجوهرية والتزامات كل طرف ومددها ومخاطرها، بإجابات مستندة إلى مراجع من الأنظمة السعودية.
        </p>
      </div>

      {/* 3 Scenarios Row ("لمن؟ للفرق التي تمرّ عليها عقود طويلة، ومتكرّرة، وبوقت ضيق") */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            title: 'عقد إطاري وصل من الطرف الآخر',
            desc: 'اعرف بنوده الجوهرية والتزاماتك فيه ومواضع عدم التوازن قبل أن توزّعه على فريقك أو تعتمده.',
          },
          {
            title: 'عقد قديم يحتاج تجديداً',
            desc: 'استخرج مدده وشروط تجديده التلقائي ومهل إشعارات إنهائه دون العودة لقراءة كل صفحة.',
          },
          {
            title: 'حصيلة عقود متراكمة',
            desc: 'اعرف ما فيها من التزامات مالية وتشغيلية وغرامات تأخير، وأنت في وقت ضيق.',
          },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-[#CCD8CE] p-5 shadow-2xs space-y-1.5">
            <h3 className="text-sm font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              <span>{item.title}</span>
            </h3>
            <p className="text-xs text-[#4A5D50] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Main "هكذا يلخّص" Interactive Showcase Card */}
      <div className="bg-white rounded-2xl border border-[#CCD8CE] shadow-sm overflow-hidden">
        {/* Top Bar: Document Badge + Mode Toggle */}
        <div className="p-4 sm:px-6 border-b border-[#CCD8CE] bg-[#F5F7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-[#1F7A46] text-white text-xs font-bold">
              هكذا يلخّص سَنَد
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#1B281F]">
              {summary.contractTitle} · {summary.estimatedPages} صفحة
            </span>
            {summary.engine === 'ollama' && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE]">
                ملخّص الذكاء الاصطناعي السيادي
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={customMode ? 'default' : 'outline'}
              onClick={() => setCustomMode((v) => !v)}
              className={`h-8 text-xs font-bold cursor-pointer ${
                customMode
                  ? 'bg-[#1F7A46] hover:bg-[#165832] text-white'
                  : 'border-[#CCD8CE] bg-white text-[#1B281F] hover:bg-[#E8EFE9]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 ml-1.5 text-[#1F7A46]" />
              {customMode ? 'إخفاء محرر العقد' : 'جرب تلخيص عقدك الآن'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopySummary}
              className="h-8 text-xs border-[#CCD8CE] bg-white text-[#1B281F] hover:bg-[#E8EFE9] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 ml-1 text-[#1F7A46]" /> : <Copy className="w-3.5 h-3.5 ml-1" />}
              {copied ? 'تم النسخ' : 'نسخ الملخّص'}
            </Button>
          </div>
        </div>

        {/* Optional Custom Contract Input */}
        {customMode && (
          <div className="p-5 sm:p-6 border-b border-[#CCD8CE] bg-[#F5F7F5]/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="contract-summary-input" className="font-bold text-[#1B281F]">
                الصق نص العقد أو بنوده المتعددة لاستخراج ملخّصه ومخاطره فوراً:
              </label>
              <button
                type="button"
                onClick={() => {
                  setContractText(SAMPLE_SUPPLY_CONTRACT_TEXT)
                  setSummary(SAMPLE_SUPPLY_CONTRACT_SUMMARY)
                }}
                className="text-[#1F7A46] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> استعادة عقد التوريد النموذجي
              </button>
            </div>
            <textarea
              id="contract-summary-input"
              rows={5}
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              className="w-full rounded-xl border border-[#CCD8CE] bg-white p-3.5 text-xs sm:text-sm text-[#1B281F] leading-relaxed focus:outline-none focus:border-[#1F7A46] focus:ring-1 focus:ring-[#1F7A46]"
              placeholder="الصق نص العقد الكامل هنا..."
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#566A5C] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1F7A46]" />
                يُعالج النص محلياً داخل خوادم سَنَد دون مشاركته مع أي طرف خارجي
              </span>
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={handleSummarize}
                className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-9 px-5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                {loading ? 'جارٍ قراءة العقد وتلخيصه...' : 'استخرج الملخّص والمخاطر'}
              </Button>
            </div>
          </div>
        )}

        {/* Focus Filter Pills ("حدّد ما تريد استخراجه") */}
        <div className="px-5 sm:px-6 pt-4 pb-2 flex flex-wrap items-center gap-2 border-b border-[#CCD8CE]">
          <span className="text-xs font-bold text-[#4A5D50] ml-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#1F7A46]" />
            حدّد ما تريد استخراجه:
          </span>
          {FOCUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFocus(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                focus === opt.id
                  ? 'bg-[#1F7A46] text-white shadow-2xs'
                  : 'bg-[#F5F7F5] text-[#4A5D50] hover:text-[#1B281F] border border-[#CCD8CE]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Main 2-Column Body: Extracted Clauses vs Executive Summary */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Right Column (7 cols): Extracted Clauses / Obligations / Durations */}
          <div className="lg:col-span-7 space-y-3">
            {focus === 'obligations' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#CCD8CE] bg-[#F5F7F5] p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-[#1F7A46]">التزامات الطرف الأول (المشتري / صاحب العمل)</h4>
                  <ul className="space-y-2 text-xs text-[#1B281F] list-disc list-inside leading-relaxed">
                    {summary.obligations.firstParty.map((ob, idx) => (
                      <li key={idx}>{ob}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-[#CCD8CE] bg-[#F5F7F5] p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-[#1F7A46]">التزامات الطرف الثاني (المورد / المنفذ)</h4>
                  <ul className="space-y-2 text-xs text-[#1B281F] list-disc list-inside leading-relaxed">
                    {summary.obligations.secondParty.map((ob, idx) => (
                      <li key={idx}>{ob}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : focus === 'durations' ? (
              <div className="space-y-3">
                {summary.durationsAndNotices.map((d, idx) => (
                  <div key={idx} className="rounded-xl border border-[#CCD8CE] bg-[#F5F7F5] p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B281F] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1F7A46]" />
                        {d.label}
                      </span>
                      <span className="text-xs font-bold text-[#1F7A46] bg-white px-2.5 py-0.5 rounded border border-[#CCD8CE]">
                        {d.value}
                      </span>
                    </div>
                    {d.warning && <p className="text-[11px] text-[#92400E] pt-1">تنبيه: {d.warning}</p>}
                  </div>
                ))}
              </div>
            ) : (
              visibleClauses.map((clause) => (
                <div
                  key={clause.number}
                  className="rounded-xl border border-[#CCD8CE] bg-[#F5F7F5]/60 hover:bg-white p-4 transition-colors space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#1B281F] text-white text-[11px] font-mono font-bold flex items-center justify-center">
                        {clause.number}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#1B281F]">{clause.title}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${TAG_STYLES[clause.tag]}`}>
                      {clause.tagLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5D50] leading-relaxed">{clause.summary}</p>
                  {clause.actionNote && (
                    <p className="text-[11px] font-medium text-[#92400E] bg-[#FEF3C7]/60 px-2.5 py-1 rounded-md border border-[#FDE68A]">
                      التوصية: {clause.actionNote}
                    </p>
                  )}
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#1F7A46] font-mono">
                    <Scale className="w-3 h-3 shrink-0" />
                    <span>المرجع: {clause.statuteRef}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Left Column (5 cols): Executive Summary ("ملخّص تنفيذي") */}
          <div className="lg:col-span-5 rounded-2xl border border-[#CCD8CE] bg-[#F5F7F5] p-5 space-y-4">
            <div className="border-b border-[#CCD8CE] pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#1F7A46] uppercase">ملخّص تنفيذي</span>
                <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#CCD8CE] text-[#B91C1C]">
                  {summary.executiveSummary.attentionCount} تحتاج انتباهاً
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1B281F] font-heading leading-snug">
                {summary.executiveSummary.headline}
              </h3>
            </div>

            <div className="space-y-2.5">
              {summary.executiveSummary.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-3.5 border text-xs space-y-1 ${
                    alert.severity === 'high'
                      ? 'bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]'
                      : 'bg-[#FEF3C7]/50 border-[#FDE68A] text-[#78350F]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {alert.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 border border-current/20">
                      {alert.clauseRef}
                    </span>
                  </div>
                  <p className="leading-relaxed">{alert.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-[#E8EFE9] border border-[#CCD8CE] p-3.5 text-xs text-[#1B281F] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A46] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-[#1F7A46]">كل نقطة موضّحة بمرجعها من الأنظمة السعودية</p>
                <p className="text-[11px] text-[#4A5D50] leading-relaxed">{summary.executiveSummary.closingNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
