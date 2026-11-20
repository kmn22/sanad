import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-[#CCD8CE] bg-[#165832] text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold font-heading leading-tight">
          رتّب مكتبك القانوني اليوم، وقدّم لموكّليك تجربة تليق بمهنتك.
        </h2>
        <p className="text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
          ابدأ تجربة مجانية لمدة ١٤ يوماً دون بطاقة ائتمان، وجرّب لوحة القضايا، متتبع الوكالات والتراخيص، وبوابة الموكل خلال دقائق.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-white text-[#165832] hover:bg-white/95 font-bold cursor-pointer">
              أنشئ مساحة مكتبك مجاناً
              <ArrowLeft className="w-4 h-4 ms-2" />
            </Button>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 border-white/40 text-white hover:bg-white/10 hover:text-white cursor-pointer bg-transparent">
              استعراض الأسعار بالريال السعودي
            </Button>
          </Link>
        </div>

        <p className="text-xs text-white/75 pt-2">
          إعداد فوري خلال دقيقتين • بوابة موكّل عربية بالكامل • تجربة ١٤ يوماً دون بطاقة
        </p>
      </div>
    </section>
  )
}
