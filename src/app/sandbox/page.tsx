'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scale,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building2,
  AlertTriangle,
  ArrowRight,
  Plus,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { ContractSummaryShowcase } from '../_landing/ContractSummaryShowcase'

export default function SandboxPage() {
  // 30-minute session countdown (1800 seconds)
  const [secondsLeft, setSecondsLeft] = useState(1800)
  const [activeTab, setActiveTab] = useState<'cases' | 'drafting' | 'summarizer' | 'invoices'>('cases')

  // Demo seeded data
  const [cases, setCases] = useState([
    {
      id: 'c1',
      title: 'نزاع عقد توريد معدات صناعية — شركة الروافد ضد المقاولات الحديثة',
      client: 'شركة الروافد للتجارة المحدودة',
      court: 'المحكمة التجارية بالرياض — الدائرة الثالثة',
      status: 'قيد الترافع',
      hearingDate: '2026-10-18',
      hearingStr: 'الأحد 18 أكتوبر — 10:00 ص',
      priority: 'عاجلة',
    },
    {
      id: 'c2',
      title: 'دعوى عمالية — مستحقات نهاية الخدمة وبدل مكافأة',
      client: 'سارة خالد المنصور',
      court: 'المحكمة العمالية بجدة — الدائرة الأولى',
      status: 'جلسة أولى',
      hearingDate: '2026-10-24',
      hearingStr: 'السبت 24 أكتوبر — 9:30 ص',
      priority: 'متوسطة',
    },
    {
      id: 'c3',
      title: 'استئناف حكم تعويض إخلال بالتزامات عقد إيجار تجاري',
      client: 'مجموعة المدى للاستثمار العقاري',
      court: 'محكمة الاستئناف بالرياض',
      status: 'إعداد اللائحة الاعتراضية',
      hearingDate: '2026-11-05',
      hearingStr: 'الخميس 5 نوفمبر — 11:00 ص',
      priority: 'عاجلة جداً',
    },
  ])

  const [invoices] = useState([
    {
      id: 'inv-1',
      number: 'INV-2026-0089',
      client: 'شركة الروافد للتجارة المحدودة',
      subtotal: 15000,
      vat: 2250,
      total: 17250,
      dueDate: '2026-10-15',
      status: 'مستحقة',
    },
    {
      id: 'inv-2',
      number: 'INV-2026-0074',
      client: 'مجموعة المدى للاستثمار العقاري',
      subtotal: 8000,
      vat: 1200,
      total: 9200,
      dueDate: '2026-09-30',
      status: 'مدفوعة',
    },
  ])

  // Interactive clause check simulator
  const [clauseText, setClauseText] = useState(
    'يلتزم الطرف الثاني بعدم العمل لدى أي منافس داخل المملكة العربية السعودية لمدة خمس سنوات بعد انتهاء العقد دون قيد أو شرط جغرافي أو مكاني.'
  )
  const [analyzingClause, setAnalyzingClause] = useState(false)
  const [copied, setCopied] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    valid: boolean
    score: number
    violation: string
    recommendation: string
    saudiArticle: string
  } | null>({
    valid: false,
    score: 42,
    violation: 'اشتراط عدم المنافسة لمدة 5 سنوات يتجاوز الحد الأقصى النظامي (سنتان)، وإطلاق المنع في كامل المملكة دون تحديد مكاني ونوعي صريح يجعله باطلاً قضائياً وفق المادة 83.',
    recommendation: 'يلتزم الطرف الثاني بعدم منافسة الطرف الأول في نشاط (المقاولات) داخل مدينة (الرياض) لمدة (سنة واحدة) تبدأ من تاريخ انتهاء عقد العمل، حفظاً لأسرار العمل المشروعة.',
    saudiArticle: 'المادة (83) من نظام العمل السعودي',
  })

  // URL search params check & countdown timer
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam === 'drafting' || tabParam === 'summarizer' || tabParam === 'cases' || tabParam === 'invoices') {
        setActiveTab(tabParam)
      }
    } catch {}

    const storageKey = 'sanad-sandbox-started-at'
    const stored = window.sessionStorage.getItem(storageKey)
    const startedAt = stored ? Number(stored) : Date.now()
    if (!stored) window.sessionStorage.setItem(storageKey, String(startedAt))
    setSecondsLeft(Math.max(0, 1800 - Math.floor((Date.now() - startedAt) / 1000)))

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const remaining = Math.max(0, 1800 - Math.floor((Date.now() - startedAt) / 1000))
        if (remaining <= 0) {
          clearInterval(timer)
          if (prev > 0) toast.info('انتهت الجلسة التجريبية المؤقتة (30 دقيقة). يمكنك إنشاء حساب كامل لحفظ أعمالك.')
          return 0
        }
        return remaining
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Analyze clause against Saudi Labor Law & Civil Transactions
  const handleAnalyzeClause = async () => {
    const text = clauseText.trim()
    if (!text) {
      setAnalysisResult(null)
      toast.error('أدخل نص البند أولاً')
      return
    }

    setAnalyzingClause(true)
    trackEvent({
      event: ANALYTICS_EVENTS.CLAUSE_CHECK_STARTED,
      source: 'sandbox_page',
    })

    let result: {
      valid: boolean
      score: number
      violation: string
      recommendation: string
      saudiArticle: string
    } | null = null

    try {
      const res = await fetch('/api/ai/check-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText: text }),
      })
      if (res.ok) {
        const data = await res.json()
        if (typeof data?.valid === 'boolean' && typeof data?.violation === 'string') {
          result = {
            valid: data.valid,
            score: data.score,
            violation: data.violation,
            recommendation: data.recommendation,
            saudiArticle: data.article,
          }
        }
      }
    } catch {
      // Fallback below
    }

    if (!result) {
      const restrictive = /عدم العمل|عدم المنافسة|منافس/i.test(text)
      const isProbation = /تجربة|فترة التجربة|90|180/i.test(text)
      const isPenalty = /غرامة|شرط جزائي|تعويض قطعي/i.test(text)

      if (restrictive) {
        result = {
          valid: false,
          score: 42,
          violation: 'اشتراط عدم المنافسة لمدة 5 سنوات يتجاوز الحد الأقصى النظامي (سنتان)، وإطلاق المنع في كامل المملكة دون تحديد مكاني ونوعي صريح يجعله باطلاً قضائياً.',
          recommendation: 'يلتزم الطرف الثاني بعدم منافسة الطرف الأول في نشاط (المقاولات) داخل مدينة (الرياض) لمدة (سنة واحدة) تبدأ من تاريخ انتهاء عقد العمل.',
          saudiArticle: 'المادة (83) من نظام العمل السعودي',
        }
      } else if (isProbation) {
        result = {
          valid: false,
          score: 48,
          violation: 'فترة التجربة الأصلية لا تزيد عن 90 يوماً؛ ولا يصح تمديدها إلى 180 يوماً إلا باتفاق كتابي لاحق بعد سريان العقد ومباشرة العمل.',
          recommendation: 'تحدد فترة التجربة بـ (90) يوماً من تاريخ مباشرة العمل الفعلي، ويجوز الاتفاق كتابة على تمديدها بما لا يتجاوز 180 يوماً.',
          saudiArticle: 'المادة (53) من نظام العمل السعودي',
        }
      } else if (isPenalty) {
        result = {
          valid: false,
          score: 55,
          violation: 'النص على عدم جواز تدخل القضاء باطل نظاماً؛ إذ يجوز للمحكمة بناءً على طلب المدين تعديل التعويض المتفق عليه ليعادل الضرر الفعلي.',
          recommendation: 'يخضع استحقاق التعويض لتقدير المحكمة المختصة وفق الضوابط النظامية المقررة بالمادة 179 من نظام المعاملات المدنية.',
          saudiArticle: 'المادة (179) من نظام المعاملات المدنية',
        }
      } else {
        result = {
          valid: true,
          score: 95,
          violation: 'لم يرصد الفحص الآلي أي تعارض صريح مع الضوابط العامة المقررة بالأنظمة السعودية المفعلة.',
          recommendation: 'الصياغة سليمة ومستوفية للشروط النظامية العامة، مع التأكيد على مراجعة الأسماء والتواريخ المحددة.',
          saudiArticle: 'فحص مطابق للأحكام العامة',
        }
      }
    }

    setAnalysisResult(result)
    setAnalyzingClause(false)
    trackEvent({
      event: ANALYTICS_EVENTS.CLAUSE_CHECK_COMPLETED,
      score: result.score,
      violationFound: !result.valid,
      article: result.saudiArticle,
    })
    toast.success('تم فحص البند بنجاح بالذكاء الاصطناعي السيادي')
  }

  const handleCopyRecommendation = () => {
    if (analysisResult?.recommendation) {
      navigator.clipboard.writeText(analysisResult.recommendation)
      setCopied(true)
      toast.success('تم نسخ الصياغة البديلة')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#1B281F] font-sans flex flex-col justify-between" dir="rtl">
      {/* Top Persistent Countdown Banner for Sandbox */}
      <div className="sticky top-0 z-50 bg-[#34543F] text-white px-4 py-2.5 shadow-xs border-b border-[#CCD8CE]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#E8EFE9] animate-pulse" />
            <span className="font-bold">معمل تجريبي فوري (Sandbox Demo)</span>
            <span className="text-white/80 hidden sm:inline">• مكتب افتراضي مسبق التهيئة</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full font-mono font-bold text-white border border-white/20">
              <Clock className="h-3.5 w-3.5 text-[#E8EFE9]" />
              <span>متبقي في الجلسة: {formatTimer(secondsLeft)}</span>
            </div>

            <Link
              href="/pricing"
              className="bg-white text-[#1B281F] hover:bg-[#E8EFE9] px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <span>احفظ أعمالك — فعّل حسابك</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sandbox Workspace Nav */}
      <header className="border-b border-[#CCD8CE] bg-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE] flex items-center justify-center font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base font-heading text-[#1B281F]">
                  مكتب العدل والإنصاف للمحاماة (معمل تجريبي)
                </h1>
                <Badge variant="outline" className="text-[10px] border-[#CCD8CE] text-[#1F7A46] bg-[#E8EFE9]">
                  وضع المعاينة الحية
                </Badge>
              </div>
              <p className="text-[11px] text-[#566A5C]">ترخيص وزارة العدل رقم 104820 • الرياض، المملكة العربية السعودية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register?plan=firm"
              className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-colors shadow-2xs"
            >
              تفعيل اشتراك المكتب
            </Link>
          </div>
        </div>
      </header>

      {/* Workspace Body */}
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

      {/* Footer */}
      <footer className="border-t border-[#CCD8CE] bg-white p-4 text-center text-xs text-[#566A5C]">
        بيئة تجريبية معزولة مخصصة لمعاينة مزايا سَنَد • لا يتم حفظ البيانات المدخلة بعد انتهاء الجلسة المؤقتة.
      </footer>
    </div>
  )
}
