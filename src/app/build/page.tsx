'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Receipt, Gavel, BookOpen, GraduationCap, Clock, Send, CheckCircle2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events'

export default function BuildPage() {
  const [email, setEmail] = useState('')
  const [interest, setInterest] = useState('all')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const upcomingModules = [
    {
      id: 'billing',
      title: 'الربط المعتمد للفوترة الإلكترونية (ZATCA)',
      desc: 'إصدار وتدقيق الفواتير الضريبية متوافقة مع متطلبات المرحلة الثانية وربطها مباشرة بالهيئة للمكاتب المسجلة.',
      icon: Receipt,
      status: 'قيد التطوير المعماري',
    },
    {
      id: 'cases',
      title: 'إدارة مواعيد الجلسات وخط الزمن القضائي',
      desc: 'لوحة عمل يومية ترصد جلسات المحاكم التجارية والعمالية وتزامن مواعيد مذكرات الرد والاعتراضات.',
      icon: Gavel,
      status: 'مرحلة التصميم والاختبار',
    },
    {
      id: 'research',
      title: 'مركز الأبحاث والاجتهادات القضائية',
      desc: 'محرك بحث موضوعي في المبادئ القضائية المستقرة والسوابق الصادرة عن المحكمة العليا والمحاكم التجارية.',
      icon: BookOpen,
      status: 'جمع المراجع وتدقيق الأسانيد',
    },
    {
      id: 'academy',
      title: 'أكاديمية تدريب القانون وبنك الأسئلة',
      desc: 'بيئة تدريبية لطلاب وخريجي كليات القانون مع بطاقات استذكار متباعد لحفظ نصوص الأنظمة والتأهيل لرخصة المحاماة.',
      icon: GraduationCap,
      status: 'بناء بنك الأسئلة بالبريد الجامعي',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      toast.error('الرجاء إدخال بريد إلكتروني صالح')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'build_page', interest }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'تعذر التسجيل')

      setSubmitted(true)
      toast.success('تم تسجيل اهتمامك بنجاح!')
      trackEvent({
        event: ANALYTICS_EVENTS.WAITLIST_JOINED,
        email: email.trim(),
        source: 'build_page',
      })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'تعذر إتمام التسجيل')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">قيد البناء</span>
        </div>

        {/* Header Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>خارطة المزايا المستقبلية خلف الإسفين</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            ما نقوم ببنائه للمحامين السعوديين تباعاً
          </h1>
          <p className="text-base text-[#4A5D50] leading-relaxed">
            بدل إطلاق وعود مشتتة قبل اكتمالها، خصصنا هذه الصفحة لعرض المزايا التي تخضع للتطوير خلف ميزة الصياغة الأساسية، مع إمكانية الانضمام للاستخدام المبكر.
          </p>
        </div>

        {/* Waitlist Subscription Banner */}
        <div className="bg-white rounded-2xl border border-[#CCD8CE] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#1B281F] font-heading">
              انضم لقائمة الاستخدام المبكر
            </h2>
            <span className="text-xs text-[#566A5C]">أولوية الدخول عند الإطلاق التجريبي</span>
          </div>

          {submitted ? (
            <div className="bg-[#E8EFE9] border border-[#CCD8CE] rounded-xl p-5 text-center space-y-1 text-xs sm:text-sm">
              <CheckCircle2 className="w-6 h-6 text-[#1F7A46] mx-auto mb-1" />
              <p className="font-bold text-[#1B281F]">تم تسجيل بريدك في قائمة الانتظار بنجاح!</p>
              <p className="text-[#4A5D50]">سنرسل لك دعوة معاينة مباشرة فور فتح باب التجربة للميزة المختارة.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <Input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني (name@lawfirm.sa)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-[#F5F7F5] border-[#CCD8CE] h-11 text-xs sm:text-sm text-[#1B281F] focus-visible:ring-[#1F7A46]"
                  />
                </div>
                <div className="sm:col-span-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#1F7A46] hover:bg-[#165832] text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4 ml-1.5" />
                    {loading ? 'جارٍ التسجيل...' : 'تسجيل الاهتمام'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#4A5D50]">
                <span>أكثر ما يهمك:</span>
                {[
                  { id: 'all', label: 'كافة المزايا' },
                  { id: 'billing', label: 'الفوترة' },
                  { id: 'cases', label: 'القضايا' },
                  { id: 'research', label: 'الأبحاث' },
                  { id: 'academy', label: 'الأكاديمية' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setInterest(opt.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      interest === opt.id
                        ? 'bg-[#1F7A46] text-white'
                        : 'bg-[#F5F7F5] border border-[#CCD8CE] text-[#4A5D50] hover:text-[#1B281F]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </form>
          )}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {upcomingModules.map((mod) => {
            const Icon = mod.icon
            return (
              <div key={mod.id} className="bg-white rounded-2xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#34543F] bg-[#E8EFE9] px-2.5 py-0.5 rounded-md">
                    {mod.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1B281F] font-heading">
                  {mod.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link href="/" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للصفحة الرئيسية
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
