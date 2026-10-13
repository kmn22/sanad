import { Check } from 'lucide-react'

export function WhySanad() {
  return (
    <>
        {/* Why Sanad Comparison */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">الفرق بين الطريقة التقليدية ومنصة سَنَد</h2>
            <p className="text-slate-400 text-sm sm:text-base">لماذا يختار المحامون السعوديون سَنَد على البرامج المكتبية العامة</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-2 text-center font-bold text-sm sm:text-base border-b border-white/10">
              <div className="p-4 bg-rose-950/30 text-rose-300 border-l border-white/10">الطريقة التقليدية والبرامج العامة</div>
              <div className="p-4 bg-emerald-950/40 text-emerald-300">منظومة سَنَد القانونية المخصصة</div>
            </div>

            <div className="divide-y divide-white/5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 p-4">
                <div className="text-slate-400 border-l border-white/10 pl-4">
                  ❌ صياغة يدوية مستهلكة للوقت (3-5 ساعات لكل لائحة أو عقد)
                </div>
                <div className="text-slate-200 pr-4 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> صياغة متكاملة خلال 60 ثانية مع أسئلة استرشادية
                </div>
              </div>

              <div className="grid grid-cols-2 p-4">
                <div className="text-slate-400 border-l border-white/10 pl-4">
                  ❌ مخاطر مخالفة نظام المعاملات المدنية أو نظام العمل
                </div>
                <div className="text-slate-200 pr-4 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> فحص آلي فوري للضمانات النظامية (م/83، م/179، إلخ)
                </div>
              </div>

              <div className="grid grid-cols-2 p-4">
                <div className="text-slate-400 border-l border-white/10 pl-4">
                  ❌ فواتير يدوية غير مشفرة ولا تتوافق مع هيئة الزكاة
                </div>
                <div className="text-slate-200 pr-4 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> مسودات فواتير داخلية تتطلب تحققاً واعتماداً قبل الاستخدام الضريبي
                </div>
              </div>

              <div className="grid grid-cols-2 p-4">
                <div className="text-slate-400 border-l border-white/10 pl-4">
                  ❌ حفظ أسرار الموكلين في أدوات سحابية عامة تخرق الخصوصية
                </div>
                <div className="text-slate-200 pr-4 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" /> تشغيل محلي افتراضي مع ضوابط خصوصية قابلة للمراجعة
                </div>
              </div>
            </div>
          </div>
        </section>
    </>
  )
}
