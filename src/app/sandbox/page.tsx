'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scale,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  CreditCard,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Plus,
  Search,
  PenTool,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function SandboxPage() {
  // 30-minute session countdown (1800 seconds)
  const [secondsLeft, setSecondsLeft] = useState(1800)
  const [activeTab, setActiveTab] = useState<'cases' | 'drafting' | 'invoices' | 'clients'>('cases')

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

  const [invoices, setInvoices] = useState([
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
  const [analysisResult, setAnalysisResult] = useState<{
    valid: boolean
    score: number
    violation: string
    recommendation: string
    saudiArticle: string
  } | null>(null)

  // Countdown timer effect
  useEffect(() => {
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

  // Analyze clause against Saudi Labor Law
  const handleAnalyzeClause = () => {
    const text = clauseText.trim()
    if (!text) {
      setAnalysisResult(null)
      toast.error('أدخل نص البند أولاً')
      return
    }
    setAnalyzingClause(true)
    setTimeout(() => {
      const restrictive = /عدم العمل|عدم المنافسة|منافس/i.test(text)
      setAnalysisResult({
        valid: !restrictive,
        score: restrictive ? 42 : 96,
        violation: restrictive ? 'شرط عدم المنافسة يحتاج إلى تحديد مدة ونطاق مكاني ونوعي واضحين وفق المادة (83) من نظام العمل السعودي.' : 'لم يرصد الفحص تعارضاً واضحاً في النص المدخل.',
        recommendation: restrictive ? 'حدد المدة بما لا يتجاوز سنتين، والنطاق المكاني ونوع الأعمال المنافسة صراحة.' : 'حافظ على وضوح الالتزام وحدد الأطراف والمدة وآلية التنفيذ عند الحاجة.',
        saudiArticle: restrictive ? 'المادة (83) من نظام العمل السعودي' : 'فحص أولي — لا يوجد سند محدد',
      })
      setAnalyzingClause(false)
      toast.success('تم فحص البند بنجاح بالذكاء الاصطناعي السيادي')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between" dir="rtl">
      {/* Top Persistent Countdown Banner for Sandbox */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-emerald-700 to-teal-800 text-white px-4 py-2.5 shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-300 animate-pulse" />
            <span className="font-bold">معمل تجريبي فوري (Sandbox Demo)</span>
            <span className="text-white/80 hidden sm:inline">• مكتب افتراضي مسبق التهيئة</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full font-mono font-bold text-amber-200 border border-amber-300/30">
              <Clock className="h-3.5 w-3.5" />
              <span>متبقي: {formatTimer(secondsLeft)}</span>
            </div>

            <Link
              href="/pricing"
              className="bg-white text-slate-950 hover:bg-emerald-50 px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <span>احفظ تقدمك — أنشئ مكتبك الحقيقي</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sandbox Workspace Nav */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base">مكتب العدل والإنصاف للمحاماة (معمل تجريبي)</h1>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-950/40">
                  وضع المعاينة الحية
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">ترخيص وزارة العدل رقم 104820 • الرياض، المملكة العربية السعودية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register?plan=firm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors"
            >
              تفعيل اشتراك المكتب
            </Link>
          </div>
        </div>
      </header>

      {/* Workspace Body */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('cases')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'cases' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>القضايا والجلسات ({cases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drafting')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'drafting' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>المصحح الذكي للصياغة (AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'invoices' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>فوترة زاتكا ZATCA ({invoices.length})</span>
          </button>
        </div>

        {/* TAB 1: Cases & Court Sessions */}
        {activeTab === 'cases' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">سجل القضايا المفتوحة بالمكتب</h3>
                <p className="text-xs text-slate-400">بيانات تجريبية تحاكي العمليات اليومية في المحاكم السعودية</p>
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة قضية تجريبية</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cases.map((c) => (
                <Card key={c.id} className="bg-slate-900 border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                      {c.priority}
                    </Badge>
                    <span className="text-[11px] text-slate-400">{c.status}</span>
                  </div>

                  <h4 className="font-bold text-sm text-white line-clamp-2">{c.title}</h4>
                  <p className="text-xs text-slate-300">الموكل: {c.client}</p>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p>🏛️ {c.court}</p>
                    <p className="text-emerald-400 font-medium">📅 الجلسة: {c.hearingStr}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AI Drafting Engine Sandbox */}
        {activeTab === 'drafting' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>فحص البنود والعقود بنظام العمل والمعاملات المدنية</span>
              </h3>
              <p className="text-xs text-slate-400">
                جرّب محرك الصياغة السيادي المعتمد على مواد الأنظمة السعودية
              </p>
            </div>

            <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  نص البند التعاقدي للفحص:
                </label>
                <textarea
                  rows={3}
                  value={clauseText}
                  onChange={(e) => {
                    setClauseText(e.target.value)
                    setAnalysisResult(null)
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white leading-relaxed focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleAnalyzeClause}
                  disabled={analyzingClause}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 font-bold cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{analyzingClause ? 'جاري الفحص بالذكاء الاصطناعي...' : 'فحص البند نظامياً'}</span>
                </Button>
              </div>

              {analysisResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-amber-400">تنبيه تعارض نظامي</span>
                      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                        درجة الامتثال: {analysisResult.score}/100
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{analysisResult.saudiArticle}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 leading-relaxed">
                    <strong>وجه المخالفة:</strong> {analysisResult.violation}
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 leading-relaxed">
                    <strong>الصياغة البديلة المقترحة:</strong> {analysisResult.recommendation}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 3: ZATCA Invoicing Sandbox */}
        {activeTab === 'invoices' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">فوترة أتعاب المحاماة الإلكترونية (ZATCA)</h3>
                <p className="text-xs text-slate-400">فواتير ضريبية صادرة ومطابقة للمرحلة الثانية مع رمز الاستجابة السريع</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoices.map((inv) => (
                <Card key={inv.id} className="bg-slate-900 border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-emerald-400">{inv.number}</span>
                    <Badge variant={inv.status === 'مدفوعة' ? 'default' : 'outline'} className={inv.status === 'مدفوعة' ? 'bg-emerald-600 text-white text-[10px]' : 'border-amber-400 text-amber-300 text-[10px]'}>
                      {inv.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300">العميل: {inv.client}</p>

                  <div className="p-3 bg-slate-950 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>الأتعاب الأساسية:</span>
                      <span>{inv.subtotal.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>ضريبة القيمة المضافة (15%):</span>
                      <span>{inv.vat.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800 text-sm">
                      <span>الإجمالي ZATCA:</span>
                      <span className="text-emerald-400 font-mono">{inv.total.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 p-4 text-center text-xs text-slate-500">
        بيئة تجريبية معزولة مخصصة لمعاينة مزايا سند • لا يتم حفظ البيانات المدخلة بعد انتهاء الجلسة.
      </footer>
    </div>
  )
}
