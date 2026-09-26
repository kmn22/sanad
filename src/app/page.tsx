'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Scale,
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  Lock,
  Zap,
  BookOpen,
  Receipt,
  Calendar,
  Gavel,
  Clock,
  ChevronDown,
  Check,
  Server,
  HelpCircle,
  Layers,
  Award,
  Briefcase,
  GraduationCap,
  QrCode,
  AlertCircle,
  Eye,
  RefreshCw,
  Flame,
  Users,
  Building2,
  FileCheck,
  Bookmark,
  Newspaper,
  X,
  Shield,
} from 'lucide-react'

export default function LandingPage() {
  // Live Demo Tab in Hero
  const [activeDemoTab, setActiveDemoTab] = useState<'drafting' | 'zatca' | 'focus' | 'student'>('drafting')

  // Interactive Drafting Sandbox state
  const [hasNonCompete, setHasNonCompete] = useState(true)
  const [contractDuration, setContractDuration] = useState('12')

  // Student Flashcard Flip
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false)

  // Interactive Persona Switcher
  const [personaType, setPersonaType] = useState<'lawyer' | 'student'>('lawyer')

  // FAQ Accordion Open States
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Privacy Policy Modal & Cookie Banner (Saudi PDPL)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [cookieConsentDismissed, setCookieConsentDismissed] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanad_cookie_consent')
      if (!saved) {
        setCookieConsentDismissed(false)
      }
    } catch {}
  }, [])

  const acceptCookies = () => {
    try {
      localStorage.setItem('sanad_cookie_consent', 'true')
    } catch {}
    setCookieConsentDismissed(true)
  }

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans relative overflow-x-hidden text-slate-100 selection:bg-emerald-500 selection:text-slate-950" dir="rtl">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[70rem] h-[35rem] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[45rem] right-[-10rem] w-[40rem] h-[40rem] bg-emerald-700/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[90rem] left-[-15rem] w-[45rem] h-[45rem] bg-amber-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Top Announcement Bar */}
      <div className="relative z-30 border-b border-emerald-500/20 bg-emerald-950/70 backdrop-blur-md px-4 py-2 text-center text-xs sm:text-sm font-medium text-emerald-300 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span>🇸🇦 متوافق 100% مع نظام المعاملات المدنية، نظام العمل السعودي، ومرحلة الفوترة لـ ZATCA</span>
        <Link href="/register" className="underline underline-offset-4 hover:text-white font-bold inline-flex items-center gap-1 mr-1">
          جرّب الآن مجاناً <ArrowLeft className="w-3.5 h-3.5 inline" />
        </Link>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Scale className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-white">سَنَد</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-1.5 py-0">
                      LEGAL OS
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:block">النظام التشغيلي القانوني الذكي</span>
                </div>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-emerald-400 transition-colors">المميزات الأساسية</a>
              <a href="#interactive-demo" className="hover:text-emerald-400 transition-colors">التجربة التفاعلية</a>
              <a href="#drafting" className="hover:text-emerald-400 transition-colors">محرك الصياغة</a>
              <a href="#research-hub" className="hover:text-emerald-400 transition-colors">مركز الأبحاث</a>
              <a href="#newsletter" className="hover:text-emerald-400 transition-colors">النشرة القانونية</a>
              <a href="#zatca" className="hover:text-emerald-400 transition-colors">فوترة زاتكا</a>
              <a href="#student-path" className="hover:text-emerald-400 transition-colors">مسار المتدربين</a>
              <a href="#faq" className="hover:text-emerald-400 transition-colors">الأسئلة الشائعة</a>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-white/10 font-semibold px-4 cursor-pointer">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-xl shadow-emerald-600/30 px-5 border border-emerald-400/30 transition-all hover:scale-[1.02] cursor-pointer">
                  ابدأ مجاناً
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-16 md:pt-24 md:pb-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl text-center relative">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/30 shadow-inner shadow-emerald-500/10 text-emerald-300 text-xs sm:text-sm font-semibold mb-8 animate-fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>الجيل الجديد لأتمتة العمليات القضائية والاستشارات القانونية</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[11px] px-2 py-0.5 rounded-full font-mono">v1.0 Alpha</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.18] tracking-tight mb-8">
            منظومة المحاماة الذكية <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 via-teal-300 to-amber-200">
              بصياغة فورية وأمان سيادي محلي
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed mb-10 font-normal">
            صُمم «سَنَد» خصيصاً ليواكب البيئة التشريعية والتنظيمية في المملكة. أتمتة صياغة العقود والمذكرات مع تدقيق نظامي حي، فوترة إلكترونية معتمدة لـ ZATCA، وإدارة متقدمة لملفات القضايا والجلسات دون رفع بياناتك لخوادم طرف ثالث.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-lg font-bold shadow-2xl shadow-emerald-700/40 border border-emerald-400/40 transition-all hover:scale-[1.03] cursor-pointer">
                <span>ابدأ تجربة المنصة مجاناً</span>
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-slate-700 bg-slate-900/60 hover:bg-slate-800/90 text-slate-200 text-lg font-semibold transition-all cursor-pointer">
                <span>دخول حساب تجريبي (Sandbox)</span>
                <ArrowUpRight className="w-5 h-5 mr-2 text-slate-400" />
              </Button>
            </Link>
          </div>

          {/* Trust Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 pb-2 border-t border-white/5 text-slate-300 text-xs sm:text-sm font-medium">
            <div className="flex items-center justify-center gap-2 py-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>خصوصية وسرية مهنية 100%</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>فواتير مشفرة بختم TLV لـ ZATCA</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              <Scale className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>مطابق لنظام المعاملات المدنية</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>يعمل بدون اتصال بالإنترنت (Local-First)</span>
            </div>
          </div>
        </section>

        {/* Live Interactive Sandbox / Product Tour Widget */}
        <section id="interactive-demo" className="px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl pb-24">
          <div className="text-center mb-8">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-3 py-1 mb-2 font-mono">
              INTERACTIVE DEMO
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">جرّب قدرات سَنَد الحية الآن قبل التسجيل</h2>
            <p className="text-slate-400 text-sm mt-1">تفاعل مع النماذج أدناه وشاهد كيف ينفذ النظام الضوابط والتحققات آلياً</p>
          </div>

          {/* Outer Glass Card */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-emerald-950/40 overflow-hidden">
            {/* Tab Controls Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/10 bg-slate-950/60 p-2 gap-2 text-xs sm:text-sm">
              <button
                onClick={() => setActiveDemoTab('drafting')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeDemoTab === 'drafting'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>أتمتة الصياغة والضمانات</span>
              </button>

              <button
                onClick={() => setActiveDemoTab('zatca')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeDemoTab === 'zatca'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>فاتورة ZATCA بختم TLV</span>
              </button>

              <button
                onClick={() => setActiveDemoTab('focus')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeDemoTab === 'focus'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Gavel className="w-4 h-4 text-emerald-400" />
                <span>إدارة الجلسات والتركيز</span>
              </button>

              <button
                onClick={() => setActiveDemoTab('student')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeDemoTab === 'student'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>أكاديمية تدريب القانون</span>
              </button>
            </div>

            {/* Tab 1: Interactive Drafting Hub */}
            {activeDemoTab === 'drafting' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      محاكاة صياغة: عقد عمل سعودي محدد المدة
                    </h3>
                    <p className="text-xs text-slate-400">تعديل المتغيرات يُطبق الضمانات النظامية التلقائية في الوقت الحقيقي</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">فحص النظام:</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                      مفعل: نظام العمل السعودي (م/83 و م/53)
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Controls Column */}
                  <div className="lg:col-span-4 space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                    <div className="text-sm font-semibold text-slate-200 mb-2">محددات الصياغة التفاعلية:</div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1.5">مدة العقد الأساسي:</label>
                      <select
                        value={contractDuration}
                        onChange={(e) => setContractDuration(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="12">12 شهراً (سنة واحدة)</option>
                        <option value="24">24 شهراً (سنتان)</option>
                        <option value="36">36 شهراً (ثلاث سنوات)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs text-slate-400 block mb-2">إدراج شرط عدم المنافسة وسرية المعلومات:</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setHasNonCompete(true)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            hasNonCompete
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          نعم (تفعيل الشرط)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasNonCompete(false)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            !hasNonCompete
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          بدون الشرط
                        </button>
                      </div>
                    </div>

                    {/* Active Regulatory Safeguard Alerts */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="text-xs font-semibold text-slate-300">الضمانات النظامية المفعلة:</div>
                      {hasNonCompete ? (
                        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>[م/83 نظام العمل]:</strong> تم تقييد عدم المنافسة بسنة واحدة ونطاق مدينة العمل لحماية صحة الشرط قضائياً.
                          </span>
                        </div>
                      ) : (
                        <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>تنبيه: تم إلغاء بند عدم المنافسة، يحق للطرف الثاني الانتقال إلى منافس فور انتهاء العلاقة.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generated Document Preview Column */}
                  <div className="lg:col-span-8 bg-slate-950/90 rounded-2xl border border-white/5 p-6 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[380px] space-y-3">
                    <div className="text-center font-bold text-sm text-emerald-400 border-b border-white/5 pb-2">
                      # عقد عمل سعودي محدد المدة (مسودة نظامية معتمدة)
                    </div>
                    <p className="text-slate-400">
                      بعون الله تعالى، تم إبرام هذا العقد في مدينة الرياض بين الطرف الأول (صاحب العمل) والطرف الثاني (الموظف).
                    </p>
                    <div className="p-3 bg-white/5 rounded-xl border-r-2 border-emerald-500">
                      <strong className="text-emerald-300 block mb-1">المادة الثانية: مدة العقد وفترة التجربة (م/53)</strong>
                      تحدد مدة هذا العقد بـ <span className="text-amber-300 font-bold underline font-sans">({contractDuration}) شهراً</span> تبدأ من تاريخ مباشرة العمل الفعلي وتخضع لفترة تجربة مدتها 90 يوماً.
                    </div>
                    {hasNonCompete && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl border-r-2 border-r-emerald-500 animate-fade-in">
                        <strong className="text-emerald-300 block mb-1">المادة الخامسة: عدم المنافسة وسرية البيانات (م/83)</strong>
                        يلتزم الطرف الثاني بعدم منافسة الطرف الأول داخل نطاق مدينة (الرياض) لمدة (سنة واحدة) من انتهاء العلاقة، حفظاً لأسرار العمل.
                      </div>
                    )}
                    <div className="p-3 bg-white/5 rounded-xl border-r-2 border-slate-600">
                      <strong className="text-slate-300 block mb-1">المادة الختامية: الاختصاص القضائي</strong>
                      يخضع هذا العقد ويفسر وفقاً لنظام العمل السعودي وتختص المحاكم العمالية بالمملكة بنظر أي نزاع قد ينشأ عنه.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: ZATCA Invoicing */}
            {activeDemoTab === 'zatca' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-400" />
                      محرك الفواتير الإلكترونية ZATCA (المرحلة الأولى والثانية)
                    </h3>
                    <p className="text-xs text-slate-400">توليد فوري للأختام المشفرة TLV وفق متطلبات هيئة الزكاة والضريبة والجمارك</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                    مختومة ومشفرة بترميز TLV القياسي
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">رقم الفاتورة الضريبية:</span>
                        <span className="font-mono font-bold text-white">INV-2026-0042</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">الرقم الضريبي للمنشأة:</span>
                        <span className="font-mono text-emerald-300">310123456700003</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">بيان الأتعاب القانونية:</span>
                        <span className="text-white">صياغة ومراجعة لائحة دعوى تجارية</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">المبلغ الخاضع للضريبة:</span>
                        <span className="font-mono text-white">5,000.00 ر.س</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">ضريبة القيمة المضافة (15%):</span>
                        <span className="font-mono text-amber-300">750.00 ر.س</span>
                      </div>
                      <div className="flex justify-between items-center text-base font-bold pt-1">
                        <span className="text-white">الإجمالي شامل الضريبة:</span>
                        <span className="font-mono text-emerald-400 text-lg">5,750.00 ر.س</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code TLV Visualizer */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-emerald-500/20 text-center">
                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-emerald-500/10 mb-3">
                      <QrCode className="w-32 h-32 text-slate-950" />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> رمز استجابة سريع متوافق مع زاتكا
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                      يحتوي الرمز على: اسم المورد، الرقم الضريبي، الطابع الزمني، إجمالي الفاتورة، ومبلغ الضريبة.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Deep Work & Case Hearings */}
            {activeDemoTab === 'focus' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      لوحة التركيز وإدارة الجلسات القضائية اليومية
                    </h3>
                    <p className="text-xs text-slate-400">ربط مواعيد الدوائر القضائية مع جلسات العمل العميق للمحامي (Deep Work)</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                    تزامن ذكي مع مواعيد ناجز
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hearing Alerts Card */}
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-emerald-400" /> الجلسات القضائية القادمة:
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border-r-2 border-emerald-500 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-white">دعوى إخلال بعقد توريد</div>
                        <div className="text-xs text-slate-400">المحكمة التجارية بالرياض — الدائرة السادسة</div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">غداً 09:30 ص</Badge>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border-r-2 border-amber-500 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-white">مطالبة مستحقات عمالية</div>
                        <div className="text-xs text-slate-400">المحكمة العمالية بجدة — جلسة تبادل مذكرات</div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-300 text-xs">بعد 3 أيام</Badge>
                    </div>
                  </div>

                  {/* Pomodoro Timer Preview */}
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                      <Flame className="w-4 h-4 text-amber-400" /> جلسة صياغة مركزة (Deep Work)
                    </div>
                    <div className="text-4xl font-mono font-black text-white my-2">25:00</div>
                    <p className="text-xs text-slate-400 max-w-xs mb-3">
                      تخصيص وقت مخصص لتحليل أسانيد القضية وكتابة الدفوع دون أي مشتتات.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-300">
                        حظر الإشعارات مفعّل
                      </Badge>
                      <Badge variant="outline" className="text-xs border-white/10 text-slate-400">
                        تتبع الساعات المفوترة
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Student Path & Academy */}
            {activeDemoTab === 'student' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                      أكاديمية سَنَد وبنك الأسئلة التفاعلي لطلاب القانون
                    </h3>
                    <p className="text-xs text-slate-400">تقنية الاستذكار المتباعد (Spaced Repetition) لحفظ الأنظمة وتطبيق السوابق</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs">
                    بنك أسئلة الأنظمة السعودية
                  </Badge>
                </div>

                <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/5 max-w-2xl mx-auto text-center space-y-4">
                  <div className="text-xs font-bold text-blue-400 tracking-wider">سؤال تطبيقي من نظام المعاملات المدنية:</div>
                  <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    «إذا اتفق المتعاقدان على مقدار التعويض (الشرط الجزائي)، فما هي سلطة المحكمة إذا أثبت المدين أن الضرر كان أقل من التعويض المتفق عليه؟»
                  </p>

                  {showFlashcardAnswer ? (
                    <div className="bg-emerald-950/50 border border-emerald-500/30 p-4 rounded-xl text-emerald-200 text-sm animate-fade-in text-right">
                      <strong className="block mb-1 text-emerald-300">الجواب النظامي (المادة 179 - معاملات مدنية):</strong>
                      «يجوز للمحكمة بناءً على طلب المدين أن تخفض مقدار التعويض إذا أثبت أن التعويض المتفق عليه كان مبالغاً فيه بدرجة كبيرة، أو أن الالتزام نُفذ في جزء منه، ويقع باطلاً كل اتفاق يخالف ذلك.»
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowFlashcardAnswer(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-2 rounded-xl cursor-pointer"
                    >
                      <Eye className="w-4 h-4 ml-1.5" /> كشف الإجابة والسند النظامي
                    </Button>
                  )}

                  {showFlashcardAnswer && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-xs text-slate-400">تقييم استذكارك:</span>
                      <Button size="sm" variant="outline" onClick={() => setShowFlashcardAnswer(false)} className="text-xs border-emerald-500/40 text-emerald-300">
                        سهل جداً (بعد 7 أيام)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowFlashcardAnswer(false)} className="text-xs border-amber-500/40 text-amber-300">
                        متوسط (بعد 3 أيام)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowFlashcardAnswer(false)} className="text-xs border-rose-500/40 text-rose-300">
                        صعب (إعادة غداً)
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Numbers & Proof Metrics */}
        <section className="py-12 border-y border-white/5 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  +40
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">نموذج ولائحة قضائية معتمدة</div>
              </div>
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">توافق مع متطلبات هيئة الزكاة (ZATCA)</div>
              </div>
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  0
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">تسريب بيانات (تخزين محلي سيادي)</div>
              </div>
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  3x
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">تسريع إعداد اللوائح وصياغة العقود</div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-3 py-1 mb-3">
              قدرات المنظومة
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              كل ما تحتاجه لإدارة أعمالك القانونية في مكان واحد
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              صُممت كل أداة لتختصر ساعات العمل المكتبي وتمنحك الثقة التامة في الامتثال للأنظمة القضائية السعودية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Drafting Engine (Large 2 Cols) */}
            <div id="drafting" className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs mb-3">
                  توليد ذكي + فحص نظامي فوري
                </Badge>
                <h3 className="text-2xl font-bold text-white mb-3">محرك الصياغة الذكي مع الفحص الفوري للضمانات</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
                  توليد العقود والمذكرات الجوابية وصحائف الدعوى في دقائق. يراقب المحرك آلياً نصوص نظام المعاملات المدنية ونظام العمل، وينبهك فورياً إذا تعارضت الصياغة مع النظام (مثل حدود الشروط الجزائية، ومدد عدم المنافسة).
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5 text-xs text-slate-300">
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">عقود العمل (م/83)</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">اتفاقيات السرية NDA</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">مذكرات المحاكم التجارية</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">لوائح الاستئناف</span>
              </div>
            </div>

            {/* Bento Card 2: ZATCA Invoicing */}
            <div id="zatca" className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-xs mb-3">
                  متوافق مع ZATCA
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">الفوترة الضريبية الإلكترونية</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  إصدار فواتير أتعاب المحاماة والاستشارات بضغطة زر واحدة. تتضمن رمز استجابة سريع TLV متوافق بالكامل مع هيئة الزكاة والضريبة والجمارك وحساب تلقائي لضريبة 15%.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                تصدير PDF وختم ضريبي نظامي
              </div>
            </div>

            {/* Bento Card 3: Local Sovereign Security */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Server className="w-6 h-6" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs mb-3">
                  Local-First Sovereign
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">أمان محلي وسيادة كاملة على البيانات</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  قواعد بياناتك ووثائق الموكلين تحفظ محلياً على جهازك أو بيئتك السحابية الخاصة. سرية الموكل مصانة بالكامل دون مغادرة أسرار القضايا لخوادم خارجية.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                تشفير 256-bit بمعايير الأمن السيبراني
              </div>
            </div>

            {/* Bento Card 4: Court Case Tracking & Najiz */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                  <Gavel className="w-6 h-6" />
                </div>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs mb-3">
                  إدارة المواعيد والجلسات
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">تتبع القضايا والمدد النظامية</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  إدارة أرقام القضايا، الدوائر القضائية، وتواريخ الجلسات مع تنبيهات ذكية لمدد الطعن والاستئناف لضمان عدم فوات أي موعد قانوني حرج.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                أجندة مدمجة متزامنة مع تصنيفات ناجز
              </div>
            </div>

            {/* Bento Card 5: Student & Training Academy */}
            <div id="student-path" className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs mb-3">
                  مساحة طلاب القانون
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">أكاديمية سَنَد وبطاقات الاستذكار</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  بيئة مخصصة لطلاب كليات الشريعة والأنظمة والمحامين المتدربين. بنك مصطلحات قضائية، قضايا تدريبية واقعية، وتكرار متباعد لحفظ نصوص المواد القضائية.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                تتبع ساعات التدريب والمراجعة الذكية
              </div>
            </div>

            {/* Bento Card 6: Legal Research Hub (md:col-span-2) */}
            <div id="research-hub" className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                  <Bookmark className="w-6 h-6" />
                </div>
                <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs mb-3">
                  مستودع الأبحاث والسوابق القضائية
                </Badge>
                <h3 className="text-2xl font-bold text-white mb-3">مركز البحث القانوني المتقدم وبناء المذكرات والرأي</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
                  احفظ المواد النظامية، مبادئ المحكمة العليا، والقرارات الإدارية في مستودع موحد. قسّم مراجعك حسب الوسوم والمحاكم (تجارية، عمالية، استئناف)، وابنِ مسودة رأي قانوني متكاملة الاستشهادات بضغطة زر.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5 text-xs text-slate-300">
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">المعاملات المدنية (م/174، م/179)</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">نظام الإثبات (م/54)</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">قرارات المحكمة العليا التجارية</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">توليد ملف الرأي الاستشاري Dossier</span>
              </div>
            </div>

            {/* Bento Card 7: Law Newsletter & Regulatory Briefs (1 col) */}
            <div id="newsletter" className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Newspaper className="w-6 h-6" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs mb-3">
                  موجز الأنظمة والنشرات الدورية
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">النشرة القانونية وموجز التشريعات</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  متابعة أسبوعية حية لأحدث التعديلات والتعاميم الوزارية ولوائح الهيئات التنظيمية، مع إمكانية تحويل أي تعميم فوراً إلى مذكرة إحاطة للعميل أو حفظه في مستودع أبحاثك.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                تصدير مذكرات إحاطة العملاء + تنبيهات تخصصية
              </div>
            </div>
          </div>
        </section>

        {/* Persona Switcher Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">مصمم خصيصاً لمختلف أطياف المجتمع القانوني</h2>
            <p className="text-slate-400 text-sm">اختر صفك واستكشف كيف يدعم سَنَد أهدافك اليومية</p>

            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-white/10 mt-6">
              <button
                onClick={() => setPersonaType('lawyer')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  personaType === 'lawyer'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" /> للمحامين والمكاتب القانونية
              </button>
              <button
                onClick={() => setPersonaType('student')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  personaType === 'student'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-700/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> لطلاب القانون والمتدربين
              </button>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-xl">
            {personaType === 'lawyer' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-3">
                    للممارسين والشركاء
                  </Badge>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    ارتقِ بكفاءة مكتبك، ضاعف الموكلين، واحمِ امتثالك
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    ودّع التشتت بين ملفات وورد، وجداول إكسيل، وفواتير غير متوافقة. يمنحك سَنَد لوحة قيادة احترافية تتابع فيها الموكلين، والجلسات، وساعات الاستشارة، والفواتير الضريبية بسلاسة متناهية.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> صياغة مذكرات المحاكم مع تنبيهات نظامية آلية
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> تتبع المدد القانونية للطعن والمواعيد القضائية
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> فوترة زكوية إلكترونية وتصدير كشوف الحساب
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link href="/register">
                      <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 cursor-pointer">
                        سجل كمحامٍ الآن
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
                    <span>مكتب المحامي / أحمد القحطاني</span>
                    <span className="text-emerald-400">لوحة الممارس نشطة</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">القضايا المتداولة هذا الشهر:</span>
                      <span className="font-mono font-bold text-emerald-400">14 قضية</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">الفواتير المحصلة:</span>
                      <span className="font-mono font-bold text-emerald-400">45,000 ر.س</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">الضمانات المطبقة في الصياغات:</span>
                      <span className="font-mono font-bold text-emerald-400">100% متوافق</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-3">
                    للطلبة والمتدربين
                  </Badge>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    تعلّم الصياغة العملية وتفوّق في اختبارات الهيئة
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    انتقل من التنظير الأكاديمي إلى الممارسة الواقعية. يتيح لك سَنَد الاطلاع على قضايا تدريبية مصاغة باحتراف، واستخدام بطاقات التكرار المتباعد لإتقان نصوص الأنظمة السعودية.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> بنك مصطلحات قضائية ونصوص المواد الحديثة
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> تكرار متباعد ذكي للتحضير لاختبارات رخصة المحاماة
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> دراسة نماذج مذكرات وعقود معتمدة عملياً
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link href="/register">
                      <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 cursor-pointer">
                        سجل كطالب قانون الآن
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
                    <span>مسار الطالب / سارة التميمي</span>
                    <span className="text-blue-400">كلية الأنظمة</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">البطاقات المتقنة:</span>
                      <span className="font-mono font-bold text-blue-400">128 مصطلح ومادة</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">سلسلة الاستذكار اليومي:</span>
                      <span className="font-mono font-bold text-amber-400">12 يوماً متواصلاً 🔥</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">النماذج المكتملة:</span>
                      <span className="font-mono font-bold text-blue-400">8 مذكرات تدريبية</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Why Sanad Comparison */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">الفرق بين الطريقة التقليدية ومنصة سَنَد</h2>
            <p className="text-slate-400 text-sm sm:text-base">لماذا يختار المحامون السعوديون سَنَد على البرامج المكتبية العامة</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-2 text-center font-bold text-sm sm:text-base border-b border-white/10">
              <div className="p-4 bg-rose-950/30 text-rose-300 border-l border-white/10">الطريقة التقليدية والبرامج العامة</div>
              <div className="p-4 bg-emerald-950/40 text-emerald-300">منظومة سَنَد القانونية المخصصة</div>
            </div>

            <div className="divide-y divide-white/5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 p-4">
                <div className="text-slate-400 border-l border-white/10 pl-4">
                  ❌ صياغة يدوية مستهلكة للوقت (3-5 ساعات لكل لائحة أو عقد)
                </div>
                <div className="text-slate-200 pr-4 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> صياغة متكاملة خلال 60 ثانية مع أسئلة استرشادية
                </div>
              </div>

              <div className="grid grid-cols-2 p-4">
                <div className="text-slate-400 border-l border-white/10 pl-4">
                  ❌ مخاطر مخالفة نظام المعاملات المدنية أو نظام العمل
                </div>
                <div className="text-slate-200 pr-4 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> فحص آلي فوري للضمانات النظامية (م/83، م/179، إلخ)
                </div>
              </div>

              <div className="grid grid-cols-2 p-4">
                <div className="text-slate-400 border-l border-white/10 pl-4">
                  ❌ فواتير يدوية غير مشفرة ولا تتوافق مع هيئة الزكاة
                </div>
                <div className="text-slate-200 pr-4 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> فواتير ضريبية فورية برمز استجابة سريع TLV معتمد لـ ZATCA
                </div>
              </div>

              <div className="grid grid-cols-2 p-4">
                <div className="text-slate-400 border-l border-white/10 pl-4">
                  ❌ حفظ أسرار الموكلين في أدوات سحابية عامة تخرق الخصوصية
                </div>
                <div className="text-slate-200 pr-4 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> تشغيل وتخزين محلي سيادي 100% (Local-First Privacy)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-3 py-1 mb-2">
              الأسئلة الشائعة
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">كل ما يدور في ذهنك عن سَنَد</h2>
            <p className="text-slate-400 text-sm">إجابات واضحة ومباشرة حول الأمان والتوافق والترخيص</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'هل بيانات ومذكرات قضايا موكلي آمنة ومحمية من التسريب؟',
                a: 'نعم تماماً. بُني سَنَد وفق معمارية السيادة المحلية (Local-First). قواعد بياناتك وملفات الموكلين تُحفظ محلياً على جهازك ومحطة عملك مع تشفير تام، ولا يتم إرسال أي أسرار مهنية أو مسودات قضايا إلى خوادم خارجية عامة، بما يحافظ على أمانة السر المهني المقررة في نظام المحاماة السعودي.',
              },
              {
                q: 'كيف تتوافق الفواتير الصادرة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA)؟',
                a: 'ينشئ سَنَد أختام الفوترة الإلكترونية بتشفير TLV (Tag-Length-Value) المعتمد رسمياً للمرحلة الأولى، مع حساب فوري لنسبة ضريبة القيمة المضافة (15%) وتوليد رمز الاستجابة السريع (QR Code) المتضمن للمعلومات الإلزامية الخمسة لنظام الفوترة الإلكترونية.',
              },
              {
                q: 'ما المقصود بـ "الضمانات النظامية الفورية" أثناء الصياغة؟',
                a: 'عند صياغة أي عقد (مثل عقد عمل أو اتفاقية سرية أو مقاولة)، يقوم محرك الصياغة بمقارنة الشروط المدخلة مع أحكام نظام المعاملات المدنية ونظام العمل. على سبيل المثال: إذا وضعت شرط جزائي يتجاوز الضرر المتوقع أو شرط عدم منافسة يخالف المادة 83، يعرض النظام تنبيهاً باللون الأصفر أو الأخضر مع السند النظامي الدقيق لتعديله فوراً.',
              },
              {
                q: 'هل يمكنني استخدام سَنَد أثناء انقطاع الإنترنت أو داخل قاعات المحاكم؟',
                a: 'نعم، المنصة تدعم العمل دون اتصال بالإنترنت (Offline Capability). يمكنك استعراض ملفات القضايا، تدوين الملاحظات، وإعداد مسودات اللوائح في أي وقت ومن أي مكان.',
              },
              {
                q: 'هل يتوفر حساب تجريبي لاختبار كافة المزايا قبل الاشتراك؟',
                a: 'نعم، نوفر وصولاً تجريبياً فورياً (Sandbox) بنقرة زر واحدة دون الحاجة لإدخال أي بطاقة بنكية. يمكنك تجربة محرك الصياغة والفوترة والاطلاع على النماذج فوراً.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/5 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* High-Impact Final Call to Action */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
          <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-center shadow-2xl shadow-emerald-950/60">
            {/* Ambient Background Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1">
                ابدأ رحلتك الرقمية الآن
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                جاهز للارتقاء بعملك القانوني إلى أقصى كفاءة ممكنة؟
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                انضم إلى نخبة المحامين والمستشارين القانونيين الذين يوفرون ساعات من الصياغة اليومية ويضمنون أعلى معايير الامتثال النظامي.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-10 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold shadow-xl shadow-emerald-700/40 transition-all hover:scale-[1.03] cursor-pointer">
                    إنشاء حساب جديد مجاناً
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-base font-semibold cursor-pointer">
                    تسجيل الدخول للمنصة
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-slate-400 pt-2 flex items-center justify-center gap-4">
                <span>✓ لا يتطلب بطاقة ائتمانية</span>
                <span>✓ تفعيل فوري</span>
                <span>✓ دعم فني محلي</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/90 py-12 relative z-10 text-slate-400 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                <Scale className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">سَنَد — Sanad Legal OS</span>
                <p className="text-slate-500 text-xs mt-0.5">منظومة التقنية القانونية المتوافقة مع الأنظمة السعودية</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <a href="#features" className="hover:text-emerald-400 transition-colors">المميزات</a>
              <a href="#interactive-demo" className="hover:text-emerald-400 transition-colors">التجربة التفاعلية</a>
              <a href="#drafting" className="hover:text-emerald-400 transition-colors">محرك الصياغة</a>
              <a href="#zatca" className="hover:text-emerald-400 transition-colors">فوترة زاتكا</a>
              <Link href="/login" className="hover:text-emerald-400 transition-colors">تسجيل الدخول</Link>
              <Link href="/register" className="hover:text-emerald-400 transition-colors">حساب جديد</Link>
            </div>
          </div>

          {/* SBA Regulatory Notice */}
          <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
            <span className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold shrink-0">إشعار تنظيمي</span>
            <p>
              منظومة <strong>سَنَد (SANAD Legal OS)</strong> هي برمجية سحابية تشغيلية وحلول ذكاء اصطناعي مساندة لإدارة العمليات القانونية ومساعدة الممارسين القانونيين والشركات وطلاب القانون. لا تُعد المنظومة مكتب محاماة ولا تقدم خدمات الترافع المباشر أو الاستشارات الموجهة للأفراد دون محامٍ مرخص من الهيئة السعودية للمحامين.
            </p>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs text-center sm:text-right">
            <p>© {new Date().getFullYear()} سَنَد للتقنية القانونية. صُمم للمملكة العربية السعودية وفق رؤية 2030.</p>
            
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-emerald-400 underline underline-offset-4 transition-colors cursor-pointer"
              >
                سياسة الخصوصية وحماية البيانات (PDPL)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-emerald-400 underline underline-offset-4 transition-colors cursor-pointer"
              >
                شروط الاستخدام
              </button>
            </div>

            <p className="flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              تشفير محلي سيادي يحمي خصوصية الموكلين
            </p>
          </div>
        </div>
      </footer>

      {/* Saudi PDPL Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">سياسة الخصوصية والامتثال لنظام حماية البيانات الشخصية (PDPL)</h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                تلتزم منصة سَنَد بنظام حماية البيانات الشخصية السعودي الصادر بالمرسوم الملكي رقم (م/19) وتعديلاته وقرارات الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).
              </div>

              <h4 className="text-white font-bold text-sm pt-2">1. السيادة المكانية للبيانات وتوطين الاستضافة</h4>
              <p className="text-slate-400 text-xs">
                تُحفظ كافة ملفات القضايا، المستندات، ومذكرات الموكلين محلياً داخل حدود المملكة العربية السعودية، ولا يتم نقل أي بيانات سرية أو شخصية إلى خوادم خارجية غير مرخصة.
              </p>

              <h4 className="text-white font-bold text-sm pt-2">2. عدم استخدام بيانات الموكلين لتدريب الذكاء الاصطناعي</h4>
              <p className="text-slate-400 text-xs">
                نلتزم التزاماً صارماً بموجب ميثاق سرية المحاماة بعدم استخدام نصوص العقود أو مستندات الموكلين لتدريب أي نماذج ذكاء اصطناعي عامة. كافة عمليات التحليل والصياغة تتم محلياً وبشكل معزول تماماً لكل مكتب.
              </p>

              <h4 className="text-white font-bold text-sm pt-2">3. حقوق أصحاب البيانات الشخصية</h4>
              <p className="text-slate-400 text-xs">
                يحق للمستخدم في أي وقت طلب تصدير نسخته الاحتياطية، أو تصحيح بياناته، أو إتلاف وحذف حسابه وجميع سجلاته بصورة نهائية من قاعدة البيانات.
              </p>

              <h4 className="text-white font-bold text-sm pt-2">4. الفوترة الضريبية وحماية المعلومات المالية</h4>
              <p className="text-slate-400 text-xs">
                تخضع المعاملات المالية لضوابط هيئة الزكاة والضريبة والجمارك (ZATCA)، ويتم تشفير أختام الفواتير بمعايير TLV التشفيرية المعتمدة نظامياً.
              </p>
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-950/60 flex justify-end">
              <Button
                onClick={() => setShowPrivacyModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 cursor-pointer"
              >
                إغلاق وفهمت الشروط
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Cookie Notice Banner */}
      {!cookieConsentDismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-40 p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/30 backdrop-blur-xl shadow-2xl flex flex-col gap-3 animate-fade-in" dir="rtl">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              نحن نستخدم ملفات تعريف ارتباط محلية وتقنيات مشفرة لتحسين تجربتك وتأمين جلسة المحاماة وفق نظام حماية البيانات الشخصية السعودي (PDPL).
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
            >
              الاطلاع على السياسة
            </button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 h-8 cursor-pointer"
            >
              موافق ومتابعة
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
