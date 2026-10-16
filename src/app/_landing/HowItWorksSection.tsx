import { FileText, SearchCheck, CheckCircle2 } from 'lucide-react'

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'الصق البند أو اختر قالباً',
      desc: 'ضع مسودة الشرط التعاقدي أو اختر قالباً جاهزاً من مكتبة العقود العمالية والمدنية المعتمدة.',
      icon: FileText,
    },
    {
      step: '02',
      title: 'الفحص اللحظي ضد الأنظمة',
      desc: 'يراجع المحرك النص فوراً مقابل نصوص مواد نظام العمل ونظام المعاملات المدنية ويرصد مواضع التعارض.',
      icon: SearchCheck,
    },
    {
      step: '03',
      title: 'استلم صياغة متوافقة ببدائل مقترحة',
      desc: 'تحصل على تنبيه مدعوم برقم المادة النظامية مع صياغة بديلة دقيقة ومحمية قضائياً قبل اعتمادها.',
      icon: CheckCircle2,
    },
  ]

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B281F] font-heading">
          كيف يعمل سَنَد في مكتبك؟
        </h2>
        <p className="text-sm text-[#4A5D50] mt-1.5 max-w-lg mx-auto">
          ثلاث خطوات واضحة ومباشرة تحول الصياغة اليدوية إلى تجربة مدققة تضمن سلامة الموقف النظامي.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-[#CCD8CE] p-6 relative transition-all hover:border-[#1F7A46] shadow-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-[#1F7A46] font-mono">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-[#1B281F] mb-2 font-heading">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
