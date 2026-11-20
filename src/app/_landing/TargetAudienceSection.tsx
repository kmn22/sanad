import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, ArrowLeft, Building2, Briefcase, GraduationCap } from 'lucide-react'

export function TargetAudienceSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl text-center">
      <div className="bg-[#E8EFE9] rounded-2xl border border-[#CCD8CE] p-8 sm:p-10 space-y-6">
        <div className="w-12 h-12 rounded-xl bg-white border border-[#CCD8CE] text-[#1F7A46] flex items-center justify-center mx-auto shadow-xs">
          <Users className="w-6 h-6" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#1B281F] font-heading">
          لمن صُممت منظومة «مقر»؟
        </h2>

        <p className="text-sm sm:text-base text-[#1B281F] max-w-3xl mx-auto leading-relaxed font-medium">
          صُمم «مقر» ليكون المقر الرقمي للعمليات القانونية والحوكمة لثلاث ركائز رئيسية: الإدارات القانونية في الشركات والمنشآت، ومكاتب وشركات المحاماة المرخصة، والباحثين وطلاب القانون في الجامعات السعودية.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right pt-2">
          <Link
            href="/solutions/enterprise"
            className="bg-white rounded-xl border border-[#CCD8CE] p-4 hover:border-[#1F7A46] transition-all flex items-start gap-3"
          >
            <Building2 className="w-5 h-5 text-[#1F7A46] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#1B281F]">للشركات والمنشآت</p>
              <p className="text-[11px] text-[#4A5D50] mt-0.5">إدارة دورة حياة العقود (CLM) والحوكمة</p>
            </div>
          </Link>
          <Link
            href="/solutions/firms"
            className="bg-white rounded-xl border border-[#CCD8CE] p-4 hover:border-[#1F7A46] transition-all flex items-start gap-3"
          >
            <Briefcase className="w-5 h-5 text-[#1F7A46] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#1B281F]">لمكاتب المحاماة</p>
              <p className="text-[11px] text-[#4A5D50] mt-0.5">إدارة القضايا والمحاكم والمرافعات</p>
            </div>
          </Link>
          <Link
            href="/solutions/academy"
            className="bg-white rounded-xl border border-[#CCD8CE] p-4 hover:border-[#1F7A46] transition-all flex items-start gap-3"
          >
            <GraduationCap className="w-5 h-5 text-[#1F7A46] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#1B281F]">للأكاديميين والطلاب</p>
              <p className="text-[11px] text-[#4A5D50] mt-0.5">بنك السوابق القضائية والبحث النظامي</p>
            </div>
          </Link>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/onboarding">
            <Button className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold text-xs sm:text-sm px-6 h-11 shadow-xs cursor-pointer">
              <span>ابدأ الآن</span>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              variant="outline"
              className="border-[#CCD8CE] bg-white hover:bg-[#F5F7F5] text-[#1B281F] font-bold text-xs sm:text-sm px-6 h-11 cursor-pointer"
            >
              <span>استعرض باقات الاشتراك والأسعار</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
