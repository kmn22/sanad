'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Send, CheckCircle2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
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
        throw new Error(data.error || 'تعذر التسجيل في قائمة الانتظار')
      }

      setSubmitted(true)
      toast.success('تم تسجيلك في قائمة الانتظار المبكرة بنجاح!')
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
              <span>تُبنى خلف الإسفين</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1B281F] font-heading">
              الفوترة المعتمدة، إدارة القضايا والجلسات، ومركز الأبحاث
            </h3>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              نركّز اليوم كامل طاقتنا على إتقان محرك الصياغة الممتثل، فيما تُبنى بقية خصائص المنظومة تباعاً. انضم لقائمة الانتظار لتكون أول من يجربها عند إطلاقها.
            </p>
            <div className="pt-1">
              <Link href="/build" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
                اطّلع على خارطة المزايا قيد البناء بالتفصيل ←
              </Link>
            </div>
          </div>

          {/* Waitlist Form */}
          <div className="w-full md:w-80 shrink-0">
            {submitted ? (
              <div className="bg-[#E8EFE9] border border-[#CCD8CE] rounded-xl p-4 text-center space-y-1 text-xs">
                <CheckCircle2 className="w-5 h-5 text-[#1F7A46] mx-auto mb-1" />
                <p className="font-bold text-[#1B281F]">أنت مسجل في القائمة المبكرة!</p>
                <p className="text-[#4A5D50]">سنرسل لك دعوة فور تدشين المزايا القادمة.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@lawfirm.sa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-[#F5F7F5] border-[#CCD8CE] text-xs h-10 text-[#1B281F] focus-visible:ring-[#1F7A46]"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-10 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 ml-1.5" />
                  {loading ? 'جارٍ التسجيل...' : 'انضم لقائمة الانتظار المبكرة'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
