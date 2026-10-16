import Link from 'next/link'
import { ShieldCheck, HardDrive, Cpu, AlertCircle, ArrowLeft } from 'lucide-react'

export function TrustLayerSection() {
  const trustPillars = [
    {
      title: 'السيادة وتوطين البيانات',
      desc: 'حفظ ومعالجة محلية داخل المملكة. نصوص العقود وأسرار الموكلين لا تُرفع إلى أي خوادم أجنبية غير مرخصة.',
      icon: HardDrive,
      link: '/security',
      linkText: 'معمارية الأمان والسيادة',
    },
    {
      title: 'حدود نسخة Alpha بصراحة',
      desc: 'سَنَد أداة مساعدة للمحامي في الصياغة والتحقق النظامي، ولا يحل محل الاجتهاد والترخيص النظامي للمحامين.',
      icon: AlertCircle,
      link: '/about',
      linkText: 'تعرّف على رسالة سَنَد',
    },
    {
      title: 'إفصاح الذكاء الاصطناعي',
      desc: 'المحرك يعمل محلياً بشكل معزول تماماً؛ لا يتم إرسال بياناتك أو تدريب أي نماذج تجارية مفتوحة على ملفات مكتبك.',
      icon: Cpu,
      link: '/ai-disclosure',
      linkText: 'اقرأ إفصاح الذكاء الاصطناعي',
    },
    {
      title: 'الامتثال لنظام حماية البيانات (PDPL)',
      desc: 'تشفير AES-256، سياسات احتفاظ واضحة، وعزل تام لكل مساحة عمل مع تدقيق كامل لعمليات الوصول.',
      icon: ShieldCheck,
      link: '/security',
      linkText: 'ضوابط الخصوصية المعتمدة',
    },
  ]

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>المصداقية أولاً: طبقة الثقة المؤسسية</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B281F] font-heading">
          الأمان والشفافية أساس عملنا
        </h2>
        <p className="text-sm text-[#4A5D50] mt-1.5 max-w-lg mx-auto">
          ندرك حساسية أسرار الموكلين، لذا بُنيت المنصة بأمانة الحدود التقنية ودون أي وعود مضللة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {trustPillars.map((pillar) => {
          const Icon = pillar.icon
          return (
            <div
              key={pillar.title}
              className="bg-white rounded-2xl border border-[#CCD8CE] p-6 flex flex-col justify-between hover:border-[#1F7A46] transition-all shadow-xs"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1B281F] mb-2 font-heading">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed mb-4">
                  {pillar.desc}
                </p>
              </div>

              <Link
                href={pillar.link}
                className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1 pt-2 border-t border-[#CCD8CE]"
              >
                <span>{pillar.linkText}</span>
                <ArrowLeft className="w-3.5 h-3.5 mr-0.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
