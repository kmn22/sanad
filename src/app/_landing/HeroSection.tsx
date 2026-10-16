import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowLeft, ShieldCheck } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="pt-12 pb-10 sm:pt-16 sm:pb-14 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl text-center relative">
      {/* Live Check Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#34543F] text-xs font-semibold mb-6">
        <span className="w-2 h-2 rounded-full bg-[#1F7A46] animate-pulse" />
        <span>فحص حي فوري ضد نظام العمل والمعاملات المدنية</span>
      </div>

      {/* Main Headline (The Wedge) */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1B281F] leading-[1.25] tracking-tight mb-6 font-heading">
        صِغ بندك في 60 ثانية — <br />
        <span className="text-[#1F7A46]">
          والنظام يفحصه ضد أنظمة المملكة
        </span>{' '}
        قبل أن تنتهي
      </h1>

      {/* Subtitle Line */}
      <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#4A5D50] leading-relaxed mb-8 font-normal">
        محرك صياغة سعودي يراقب نظام العمل والمعاملات المدنية، وينبهك للمخالفة ويقترح البديل المتوافق — بياناتك لا تغادر بيئتك.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <a href="#checker" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto h-12 px-7 bg-[#1F7A46] hover:bg-[#165832] text-white text-base font-bold shadow-xs transition-all cursor-pointer">
            <span>جرّب المصحح الآن</span>
            <ArrowDown className="w-4 h-4 mr-2" />
          </Button>
        </a>
        <Link href="/sandbox" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 border-[#CCD8CE] bg-white hover:bg-[#E8EFE9] text-[#1B281F] text-base font-semibold transition-all cursor-pointer">
            <span>المعمل الكامل (Sandbox)</span>
            <ArrowLeft className="w-4 h-4 mr-2 text-[#4A5D50]" />
          </Button>
        </Link>
      </div>

      {/* Sovereign Trust Micro-line */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#566A5C]">
        <ShieldCheck className="w-4 h-4 text-[#1F7A46]" />
        <span>تشفير محلي سيادي • لا يتم استخدام بياناتك في تدريب نماذج عامة</span>
      </div>
    </section>
  )
}
