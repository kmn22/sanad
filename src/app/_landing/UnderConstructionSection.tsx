'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events'

export function UnderConstructionSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
        body: JSON.stringify({ email: email.trim(), source: 'landing_banner', interest: 'general_suite' }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'تعذر التسجيل في قائمة المتابعة')
      }

      setSubmitted(true)
      toast.success('تم تسجيل بريدك في قائمة التحديثات بنجاح!')
      trackEvent({
        event: ANALYTICS_EVENTS.WAITLIST_JOINED,
        email: email.trim(),
        source: 'landing_banner',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر إتمام التسجيل. حاول ثانية.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
      <div className="bg-white rounded-2xl border border-[#CCD8CE] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E8EFE9] text-[#1F7A46] text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>خارطة المرحلة الثانية</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1B281F] font-heading">
              الدفع الإلكتروني عبر مدى وApple Pay، وتقارير التحصيل الموسّعة
            </h3>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              تعمل مساحة إدارة المكتب وبوابة الموكّل اليوم بالكامل، ونعمل تدريجياً على إضافة الدفع الآلي عبر Moyasar (مدى / Apple Pay) وتحسين التقويم الهجري وتصدير التقارير. سجّل بريدك لتصلك التحديثات عند إطلاقها.
            </p>
          </div>

          {/* Waitlist Form */}
          <div className="w-full md:w-80 shrink-0">
            {submitted ? (
              <div className="bg-[#E8EFE9] border border-[#CCD8CE] rounded-xl p-4 text-center space-y-1 text-xs">
                <CheckCircle2 className="w-5 h-5 text-[#1F7A46] mx-auto mb-1" />
                <p className="font-bold text-[#1B281F]">تم تسجيل بريدك بنجاح!</p>
                <p className="text-[#4A5D50]">سنراسلك فور توفر تحديثات المرحلة القادمة.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@lawfirm.sa"
                  className="bg-[#F5F7F5] border-[#CCD8CE] text-left h-10 text-xs"
                  dir="ltr"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1B281F] hover:bg-[#34543F] text-white h-10 text-xs font-bold gap-2 cursor-pointer"
                >
                  {loading ? (
                    'جارٍ الحفظ...'
                  ) : (
                    <>
                      <span>أبلغني بتحديثات المرحلة الثانية</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
