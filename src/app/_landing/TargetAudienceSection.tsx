import Link from 'next/link'
import { Briefcase, Users, ShieldCheck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TargetAudienceSection() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#CCD8CE] bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold text-[#1F7A46] uppercase tracking-wider mb-2">لمن صُمم مقر؟</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B281F] font-heading">
            مبني لاحتياج المحامي المستقل والمكتب الصغير — لا تعقيدات المؤسسات الضخمة
          </h2>
          <p className="text-sm text-[#4A5D50] mt-2">
            ركزنا كل المزايا على إدارة قضايا المكتب، متابعة التراخيص والوكالات، وتقديم واجهة احترافية لموكّلك.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#CCD8CE] bg-[#F5F7F5] p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#1F7A46] text-white grid place-items-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="inline-block text-[11px] font-bold text-[#1F7A46] bg-[#E8EFE9] px-2.5 py-0.5 rounded-full">
                مقعد واحد • 199 ر.س / شهرياً
              </span>
              <h3 className="text-lg font-bold text-[#1B281F] font-heading">المحامي المستقل والمرخّص</h3>
              <p className="text-xs text-[#4A5D50] leading-relaxed">
                نظّم قضاياك ومواعيد جلساتك، تابع ساعات العمل وبيانات الأتعاب، وقدّم لموكليك بوابة متابعة تحفظ وقتك وترفع احترافية مكتبك.
              </p>
            </div>
            <Link href="/register" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
              ابدأ تجربة المحامي المستقل <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border-2 border-[#1F7A46] bg-white p-6 flex flex-col justify-between space-y-5 shadow-xs">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#165832] text-white grid place-items-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="inline-block text-[11px] font-bold text-white bg-[#1F7A46] px-2.5 py-0.5 rounded-full">
                ٢–١٠ مقاعد • 449 ر.س / شهرياً
              </span>
              <h3 className="text-lg font-bold text-[#1B281F] font-heading">مكاتب المحاماة الصغيرة</h3>
              <p className="text-xs text-[#4A5D50] leading-relaxed">
                وزّع القضايا والمهام بين المحامين والفريق الإداري، فعّل الموافقات الداخلية والعزل السري للملفات، وتابع التحصيل من لوحة واحدة.
              </p>
            </div>
            <Link href="/register" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
              سجّل مكتبك الصغير الآن <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-[#CCD8CE] bg-[#F5F7F5] p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#1B281F] text-white grid place-items-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="inline-block text-[11px] font-bold text-[#4A5D50] bg-white border border-[#CCD8CE] px-2.5 py-0.5 rounded-full">
                مضمّنة مع كل باقة
              </span>
              <h3 className="text-lg font-bold text-[#1B281F] font-heading">بوابة الموكّل الذكية عبر الرابط</h3>
              <p className="text-xs text-[#4A5D50] leading-relaxed">
                يرى موكّلك مراحل القضية بمصطلحات مبسّطة بعيداً عن التعقيد، ويرفع المستندات المطلوبة بأمان عبر رابط مشفر برمز تحقق OTP.
              </p>
            </div>
            <Link href="/pricing" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
              استعرض تفاصيل الباقات <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold px-8">
            <Link href="/register">ابدأ تجربة ١٤ يوماً مجاناً</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[#1F7A46]/30 text-[#165832] hover:bg-[#E8EFE9]">
            <Link href="/pricing">مقارنة الباقات بالريال السعودي</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
