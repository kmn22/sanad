'use client'

import { Scale, Sparkles, CreditCard, Plus, Copy, Check, ShieldCheck, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ContractSummaryShowcase } from '../../_landing/ContractSummaryShowcase'
import type { SandboxState } from './use-sandbox'

export function SandboxBody({ v }: { v: SandboxState }) {
  const { activeTab, setActiveTab, cases, setCases, invoices, clauseText, setClauseText, analyzingClause, copied, analysisResult, setAnalysisResult, handleAnalyzeClause, handleCopyRecommendation } = v
  return (
    <>
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#CCD8CE] gap-2 overflow-x-auto pb-1 text-sm font-medium bg-white p-2 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('drafting')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer rounded-t-lg ${
              activeTab === 'drafting'
                ? 'border-[#1F7A46] text-[#1F7A46] font-bold bg-[#E8EFE9]/40'
                : 'border-transparent text-[#4A5D50] hover:text-[#1B281F]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#1F7A46]" />
            <span>المصحح الذكي للصياغة والأنظمة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summarizer')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer rounded-t-lg ${
              activeTab === 'summarizer'
                ? 'border-[#1F7A46] text-[#1F7A46] font-bold bg-[#E8EFE9]/40'
                : 'border-transparent text-[#4A5D50] hover:text-[#1B281F]'
            }`}
          >
            <FileText className="h-4 w-4 text-[#1F7A46]" />
            <span>تلخيص العقود وكشف المخاطر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer rounded-t-lg ${
              activeTab === 'cases'
                ? 'border-[#1F7A46] text-[#1F7A46] font-bold bg-[#E8EFE9]/40'
                : 'border-transparent text-[#4A5D50] hover:text-[#1B281F]'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>القضايا والجلسات ({cases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer rounded-t-lg ${
              activeTab === 'invoices'
                ? 'border-[#1F7A46] text-[#1F7A46] font-bold bg-[#E8EFE9]/40'
                : 'border-transparent text-[#4A5D50] hover:text-[#1B281F]'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>مسودات الفواتير الداخلية ({invoices.length})</span>
          </button>
        </div>

        {/* TAB 1: AI Drafting Engine Sandbox */}
        {activeTab === 'drafting' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base font-heading flex items-center gap-2 text-[#1B281F]">
                  <Sparkles className="h-4 w-4 text-[#1F7A46]" />
                  <span>فحص البنود والعقود ضد نظام العمل ونظام المعاملات المدنية</span>
                </h3>
                <p className="text-xs text-[#566A5C]">
                  جرّب محرك الصياغة السيادي المعتمد على مواد الأنظمة القضائية السعودية
                </p>
              </div>

              {/* Sample quick buttons */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setClauseText('يلتزم الطرف الثاني بعدم العمل لدى أي منافس داخل المملكة العربية السعودية لمدة خمس سنوات بعد انتهاء العقد دون قيد أو شرط جغرافي أو مكاني.')
                    setAnalysisResult(null)
                  }}
                  className="text-[11px] h-7 border-[#CCD8CE] text-[#4A5D50]"
                >
                  عدم المنافسة (م/83)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setClauseText('تحدد فترة التجربة بـ ستة أشهر (180 يوماً) يحق للطرف الأول خلالها إنهاء العقد فوراً.')
                    setAnalysisResult(null)
                  }}
                  className="text-[11px] h-7 border-[#CCD8CE] text-[#4A5D50]"
                >
                  فترة التجربة (م/53)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setClauseText('يلتزم المقاول بدفع تعويض اتفاقي قطعي قدره 300,000 ريال دون سلطة للمحكمة في تعديله.')
                    setAnalysisResult(null)
                  }}
                  className="text-[11px] h-7 border-[#CCD8CE] text-[#4A5D50]"
                >
                  الشرط الجزائي (م/179)
                </Button>
              </div>
            </div>

            <Card className="bg-white border-[#CCD8CE] rounded-2xl p-5 space-y-4 shadow-xs">
              <div>
                <label className="text-xs font-bold text-[#1B281F] block mb-1.5">
                  نص البند التعاقدي للفحص:
                </label>
                <textarea
                  rows={4}
                  value={clauseText}
                  onChange={(e) => {
                    setClauseText(e.target.value)
                    setAnalysisResult(null)
                  }}
                  className="w-full bg-[#F5F7F5] border border-[#CCD8CE] rounded-xl p-3.5 text-xs sm:text-sm text-[#1B281F] leading-relaxed focus:bg-white focus:outline-none focus:border-[#1F7A46] focus:ring-1 focus:ring-[#1F7A46] transition-all font-sans"
                  placeholder="الصق نص البند المراد فحصه نظامياً..."
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="text-[11px] text-[#566A5C] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A46]" />
                  <span>فحص آلي معزول محلياً • لا يتم نقل النص لأي جهة خارجية</span>
                </div>
                <Button
                  onClick={handleAnalyzeClause}
                  disabled={analyzingClause}
                  className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs gap-1.5 font-bold cursor-pointer h-9 px-5 shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{analyzingClause ? 'جارٍ الفحص والمطابقة...' : 'افحص البند نظامياً'}</span>
                </Button>
              </div>

              {analysisResult && (
                <div className="p-4 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] space-y-3 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${analysisResult.valid ? 'text-[#1F7A46]' : 'text-[#B91C1C]'}`}>
                        {analysisResult.valid ? 'متوافق نظامياً' : 'تنبيه تعارض نظامي'}
                      </span>
                      <Badge className={`text-[10px] ${analysisResult.valid ? 'bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE]' : 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]'}`}>
                        درجة الامتثال: {analysisResult.score}/100
                      </Badge>
                    </div>
                    <span className="text-[11px] text-[#566A5C] font-mono">{analysisResult.saudiArticle}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#7F1D1D] leading-relaxed">
                    <strong>وجه المخالفة:</strong> {analysisResult.violation}
                  </div>

                  <div className="p-3 rounded-lg bg-[#E8EFE9] border border-[#CCD8CE] text-[#1B281F] leading-relaxed space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#1F7A46]">الصياغة البديلة المقترحة:</strong>
                      <button
                        type="button"
                        onClick={handleCopyRecommendation}
                        className="text-[11px] font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'تم النسخ' : 'نسخ الصياغة'}
                      </button>
                    </div>
                    <p className="bg-white/80 p-2.5 rounded-md border border-[#CCD8CE]">
                      «{analysisResult.recommendation}»
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'summarizer' && (
          <div className="animate-in fade-in">
            <ContractSummaryShowcase />
          </div>
        )}

        {/* TAB 2: Cases & Court Sessions */}
        {activeTab === 'cases' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-heading text-[#1B281F]">سجل القضايا المفتوحة بالمكتب</h3>
                <p className="text-xs text-[#566A5C]">بيانات تجريبية تحاكي العمليات اليومية في المحاكم السعودية</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  toast.success('تمت إضافة قضية تجريبية جديدة إلى القائمة')
                  setCases((prev) => [
                    {
                      id: `c_${Date.now()}`,
                      title: 'مطالبة مالية عن أتعاب استشارة عقارية',
                      client: 'شركة الأفق للاستثمار',
                      court: 'المحكمة العامة بالرياض',
                      status: 'قيد التجهيز',
                      hearingDate: '2026-11-12',
                      hearingStr: 'الخميس 12 نوفمبر — 10:00 ص',
                      priority: 'عادية',
                    },
                    ...prev,
                  ])
                }}
                className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة قضية تجريبية</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cases.map((c) => (
                <Card key={c.id} className="bg-white border-[#CCD8CE] rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="border-[#CCD8CE] text-[#1F7A46] bg-[#E8EFE9] text-[10px]">
                      {c.priority}
                    </Badge>
                    <span className="text-[11px] text-[#566A5C]">{c.status}</span>
                  </div>

                  <h4 className="font-bold text-sm text-[#1B281F] line-clamp-2">{c.title}</h4>
                  <p className="text-xs text-[#4A5D50]">الموكل: {c.client}</p>

                  <div className="pt-2 border-t border-[#CCD8CE] text-[11px] text-[#566A5C] space-y-1">
                    <p>🏛️ {c.court}</p>
                    <p className="text-[#1F7A46] font-medium">📅 الجلسة: {c.hearingStr}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Invoicing Sandbox */}
        {activeTab === 'invoices' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-heading text-[#1B281F]">مسودات فواتير أتعاب المحاماة الداخلية</h3>
                <p className="text-xs text-[#566A5C]">أدوات داخلية تجريبية لحساب الأتعاب والضريبة (لا تمثل ربطاً معتمداً مع ZATCA)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoices.map((inv) => (
                <Card key={inv.id} className="bg-white border-[#CCD8CE] rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#1F7A46]">{inv.number}</span>
                    <Badge className={inv.status === 'مدفوعة' ? 'bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE] text-[10px]' : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[10px]'}>
                      {inv.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#1B281F]">العميل: {inv.client}</p>

                  <div className="p-3 bg-[#F5F7F5] border border-[#CCD8CE] rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-[#566A5C]">
                      <span>الأتعاب الأساسية:</span>
                      <span>{inv.subtotal.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between text-[#566A5C]">
                      <span>ضريبة القيمة المضافة (15%):</span>
                      <span>{inv.vat.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1B281F] pt-1 border-t border-[#CCD8CE] text-sm">
                      <span>الإجمالي التقديري:</span>
                      <span className="text-[#1F7A46] font-mono">{inv.total.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
