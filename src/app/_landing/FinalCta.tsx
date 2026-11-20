import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, Scale } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl text-center">
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#CCD8CE] p-8 sm:p-12 shadow-sm space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1F7A46] flex items-center justify-center mx-auto shadow-xs">
          <Scale className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-[#1B281F] font-heading leading-tight">
          انتقل إلى «مقر» — المقر الرقمي للعمليات القانونية والحوكمة
        </h2>

        <p className="text-sm sm:text-base text-[#4A5D50] max-w-xl mx-auto leading-relaxed">
          انضم إلى الشركات ومكاتب المحاماة والباحثين القانونيين في المملكة الذين يديرون عقودهم وقضاياهم وأبحاثهم النظامية في بيئة سيادية موحدة.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-[#1F7A46] hover:bg-[#165832] text-white text-base font-bold shadow-xs cursor-pointer">
              ابدأ الآن
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 border-[#CCD8CE] text-[#1B281F] hover:bg-[#E8EFE9] text-base font-semibold cursor-pointer">
              استعرض الباقات والأسعار
            </Button>
          </Link>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[#566A5C]">
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-[#1F7A46]" /> تفعيل فوري وتخصيص حسب المسار المهني
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-[#1F7A46]" /> تشفير محلي سيادي
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-[#1F7A46]" /> متوافق مع نظام حماية البيانات الشخصية (PDPL)
          </span>
        </div>
      </div>
    </section>
  )
}
