'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Briefcase, GraduationCap } from 'lucide-react'

export function PersonaSwitcher() {
  // Interactive Persona Switcher
  const [personaType, setPersonaType] = useState<'lawyer' | 'student'>('lawyer')

  return (
    <>
        {/* Persona Switcher Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">مصمم خصيصاً لمختلف أطياف المجتمع القانوني</h2>
            <p className="text-slate-400 text-sm">اختر صفك واستكشف كيف يدعم سَنَد أهدافك اليومية</p>

            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-white/10 mt-6">
              <button
                onClick={() => setPersonaType('lawyer')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  personaType === 'lawyer'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" /> للمحامين والمكاتب القانونية
              </button>
              <button
                onClick={() => setPersonaType('student')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  personaType === 'student'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-700/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> لطلاب القانون والمتدربين
              </button>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-xl">
            {personaType === 'lawyer' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-3">
                    للممارسين والشركاء
                  </Badge>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    ارتقِ بكفاءة مكتبك، ضاعف الموكلين، واحمِ امتثالك
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    ودّع التشتت بين ملفات وورد، وجداول إكسيل، وفواتير غير متوافقة. يمنحك سَنَد لوحة قيادة احترافية تتابع فيها الموكلين، والجلسات، وساعات الاستشارة، والفواتير الضريبية بسلاسة متناهية.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> صياغة مذكرات المحاكم مع تنبيهات نظامية آلية
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> تتبع المدد القانونية للطعن والمواعيد القضائية
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> فوترة زكوية إلكترونية وتصدير كشوف الحساب
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link href="/register">
                      <Button className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 cursor-pointer">
                        سجل كمحامٍ الآن
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
                    <span>مكتب المحاماة والاستشارات القانونية</span>
                    <span className="text-emerald-400">لوحة الممارس نشطة</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">القضايا المتداولة هذا الشهر:</span>
                      <span className="font-mono font-bold text-emerald-400">14 قضية</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">الفواتير المحصلة:</span>
                      <span className="font-mono font-bold text-emerald-400">45,000 ر.س</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">الضمانات المطبقة في الصياغات:</span>
                      <span className="font-mono font-bold text-emerald-400">جاهزية أولية</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-3">
                    للطلبة والمتدربين
                  </Badge>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    تعلّم الصياغة العملية وتفوّق في اختبارات الهيئة
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    انتقل من التنظير الأكاديمي إلى الممارسة الواقعية. يتيح لك سَنَد الاطلاع على قضايا تدريبية مصاغة باحتراف، واستخدام بطاقات التكرار المتباعد لإتقان نصوص الأنظمة السعودية.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> بنك مصطلحات قضائية ونصوص المواد الحديثة
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> تكرار متباعد ذكي للتحضير لاختبارات رخصة المحاماة
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> دراسة نماذج مذكرات وعقود معتمدة عملياً
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link href="/register">
                      <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 cursor-pointer">
                        سجل كطالب قانون الآن
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
                    <span>مسار الطالب / سارة التميمي</span>
                    <span className="text-blue-400">كلية الأنظمة</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">البطاقات المتقنة:</span>
                      <span className="font-mono font-bold text-blue-400">128 مصطلح ومادة</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">سلسلة الاستذكار اليومي:</span>
                      <span className="font-mono font-bold text-amber-400">12 يوماً متواصلاً 🔥</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-xs flex justify-between items-center">
                      <span className="text-slate-200">النماذج المكتملة:</span>
                      <span className="font-mono font-bold text-blue-400">8 مذكرات تدريبية</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
    </>
  )
}
