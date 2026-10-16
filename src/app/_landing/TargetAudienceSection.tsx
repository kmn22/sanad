import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, ArrowLeft } from 'lucide-react'

export function TargetAudienceSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl text-center">
      <div className="bg-[#E8EFE9] rounded-2xl border border-[#CCD8CE] p-8 sm:p-10 space-y-5">
        <div className="w-12 h-12 rounded-xl bg-white border border-[#CCD8CE] text-[#1F7A46] flex items-center justify-center mx-auto shadow-xs">
          <Users className="w-6 h-6" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#1B281F] font-heading">
          لمن صُممت منصة سَنَد؟
        </h2>

        <p className="text-sm sm:text-base text-[#1B281F] max-w-2xl mx-auto leading-relaxed font-medium">
          للمحامي الممارس الفردي ومكاتب المحاماة الصغيرة (حتى 5 محامين): لمن يقضي ساعات أسبوعياً في الصياغة اليدوية ويريد صمام أمان نظامي فوري يمنع التعارض مع أحكام القضاء السعودي قبل خروج الوثيقة للموكل.
        </p>

        <div className="pt-2">
          <Link href="/pricing">
            <Button className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold text-xs sm:text-sm px-6 h-11 shadow-xs cursor-pointer">
              <span>استعرض باقات الاشتراك والأسعار</span>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
