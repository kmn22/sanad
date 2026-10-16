import { Shield, BookOpen, Scale, FileCheck2 } from 'lucide-react'

export function CoveredStatutesSection() {
  const statutes = [
    {
      title: 'نظام العمل السعودي',
      articles: 'م/53 (فترة التجربة) • م/83 (عدم المنافسة وحفظ الأسرار)',
      icon: Scale,
      status: 'مفعل ومدقق',
    },
    {
      title: 'نظام المعاملات المدنية',
      articles: 'م/179 (الشرط الجزائي والتعويض الاتفاقي) • م/174 (الظروف الطارئة)',
      icon: BookOpen,
      status: 'مفعل ومدقق',
    },
    {
      title: 'نظام المرافعات الشرعية والإثبات',
      articles: 'م/75 (أسبقية الدفوع الشكلية) • م/177 (المهل والمدد النظامية)',
      icon: FileCheck2,
      status: 'مفعل ومدقق',
    },
    {
      title: 'نظام حماية البيانات الشخصية (PDPL)',
      articles: 'م/29 (ضوابط معالجة البيانات وتوطين حفظها داخل المملكة)',
      icon: Shield,
      status: 'مفعل ومدقق',
    },
  ]

  return (
    <section className="py-12 border-y border-[#CCD8CE] bg-[#E8EFE9]/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1F7A46]" />
              <span>الأنظمة والمراجع المفعلة في محرك الفحص اليوم</span>
            </h2>
            <p className="text-xs text-[#4A5D50] mt-0.5">
              مراجع نظامية سعودية سارية تخضع للتحديث المستمر دون مبالغات أو وعود غير مفعلة
            </p>
          </div>
          <div className="text-[11px] font-mono text-[#34543F] bg-white px-3 py-1 rounded-full border border-[#CCD8CE] self-start md:self-auto font-semibold">
            قاعدة بيانات الأنظمة: تحديث 2026
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statutes.map((statute) => {
            const Icon = statute.icon
            return (
              <div
                key={statute.title}
                className="bg-white rounded-xl border border-[#CCD8CE] p-4 flex flex-col justify-between shadow-2xs hover:border-[#1F7A46] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#1F7A46] bg-[#E8EFE9] px-2 py-0.5 rounded-md">
                      {statute.status}
                    </span>
                    <Icon className="w-4 h-4 text-[#4A5D50]" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#1B281F] mb-1">
                    {statute.title}
                  </h3>
                  <p className="text-[11px] text-[#4A5D50] leading-relaxed">
                    {statute.articles}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
