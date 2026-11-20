import { FolderKanban, MessageSquareShare, BellRing } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: FolderKanban,
    title: 'أنشئ مكتبك وملفات قضاياك في دقائق',
    desc: 'أضف الموكلين والقضايا ومواعيد الجلسات والمستندات المشفرة في مساحة عمل مرتبة تدعم العمل الفردي أو فريقاً حتى ١٠ مقاعد.',
  },
  {
    number: '02',
    icon: MessageSquareShare,
    title: 'شارك بوابة الموكل عبر واتساب بنقرة',
    desc: 'أصدر رابطاً زمنياً مقيّداً برمز تحقق (OTP) للموكّل ليتابع حالة ملفه، ويرفع المستندات المطلوبة، ويطّلع على بيان الأتعاب بهدوء.',
  },
  {
    number: '03',
    icon: BellRing,
    title: 'اضبط التراخيص والوكالات والساعات والأتعاب',
    desc: 'تلقَّ تنبيهات تلقائية قبل انتهاء الوكالات أو رخصة المحاماة أو الإقامات، وسجّل ساعات العمل وأصدر بيانات الأتعاب بوضوح.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#CCD8CE] bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold text-[#1F7A46] uppercase tracking-wider mb-2">آلية العمل اليومية</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B281F] font-heading">
            من استقبال الموكّل إلى تنظيم الملف والأتعاب — في ٣ خطوات
          </h2>
          <p className="text-sm text-[#4A5D50] mt-2">
            صُمم «مقر» ليقلل اتصالات المتابعة المتكررة ويجمع ملفات مكتبك بعيداً عن مجموعات المحادثة المبعثرة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-[#CCD8CE] bg-[#F5F7F5] p-6 space-y-4 hover:border-[#1F7A46]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#1F7A46] text-white grid place-items-center">
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-[#1F7A46] bg-white px-2.5 py-1 rounded-full border border-[#CCD8CE]">
                  {step.number}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1B281F] font-heading">{step.title}</h3>
              <p className="text-xs text-[#4A5D50] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
