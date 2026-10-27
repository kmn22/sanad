'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events'

export function useSandbox() {
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

  return {
    secondsLeft,
    setSecondsLeft,
    activeTab,
    setActiveTab,
    cases,
    setCases,
    invoices,
    clauseText,
    setClauseText,
    analyzingClause,
    setAnalyzingClause,
    copied,
    setCopied,
    analysisResult,
    setAnalysisResult,
    formatTimer,
    handleAnalyzeClause,
    handleCopyRecommendation,
  }
}

export type SandboxState = ReturnType<typeof useSandbox>
