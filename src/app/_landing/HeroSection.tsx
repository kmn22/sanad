import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale, ShieldCheck, CheckCircle2, ArrowLeft, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <>
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
            صُمم «سَنَد» خصيصاً ليواكب البيئة التشريعية والتنظيمية في المملكة. أتمتة صياغة العقود والمذكرات مع تدقيق نظامي حي، إدارة فواتير داخلية غير مفعّلة حالياً للتكامل مع ZATCA، وإدارة متقدمة لملفات القضايا والجلسات دون رفع بياناتك لخوادم طرف ثالث.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/sandbox" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-base sm:text-lg font-bold shadow-2xl shadow-emerald-700/40 border border-emerald-400/40 transition-all hover:scale-[1.03] cursor-pointer">
                <span>جرّب مكتب تجريبي فوري (Sandbox)</span>
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-slate-700 bg-slate-900/60 hover:bg-slate-800/90 text-slate-200 text-base sm:text-lg font-semibold transition-all cursor-pointer">
                <span>استعراض الباقات والأسعار</span>
                <ArrowLeft className="w-5 h-5 mr-2 text-slate-400" />
              </Button>
            </Link>
          </div>

          {/* Trust Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 pb-2 border-t border-white/5 text-slate-300 text-xs sm:text-sm font-medium">
            <div className="flex items-center justify-center gap-2 py-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>ضوابط خصوصية وسرية مهنية قابلة للتدقيق</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>نماذج فواتير داخلية — ليست تكاملاً معتمداً مع ZATCA</span>
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
    </>
  )
}
