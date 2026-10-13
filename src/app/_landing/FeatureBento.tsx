import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  CheckCircle2,
  Lock,
  BookOpen,
  Receipt,
  Calendar,
  Gavel,
  Server,
  GraduationCap,
  Bookmark,
  Newspaper,
} from 'lucide-react'

export function FeatureBento() {
  return (
    <>
        {/* Bento Grid Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-3 py-1 mb-3">
              قدرات المنظومة
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              كل ما تحتاجه لإدارة أعمالك القانونية في مكان واحد
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              صُممت كل أداة لتختصر ساعات العمل المكتبي وتمنحك الثقة التامة في الامتثال للأنظمة القضائية السعودية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Drafting Engine (Large 2 Cols) */}
            <div id="drafting" className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs mb-3">
                  توليد ذكي + فحص نظامي فوري
                </Badge>
                <h3 className="text-2xl font-bold text-white mb-3">محرك الصياغة الذكي مع الفحص الفوري للضمانات</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
                  توليد العقود والمذكرات الجوابية وصحائف الدعوى في دقائق. يراقب المحرك آلياً نصوص نظام المعاملات المدنية ونظام العمل، وينبهك فورياً إذا تعارضت الصياغة مع النظام (مثل حدود الشروط الجزائية، ومدد عدم المنافسة).
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5 text-xs text-slate-300">
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">عقود العمل (م/83)</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">اتفاقيات السرية NDA</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">مذكرات المحاكم التجارية</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">لوائح الاستئناف</span>
              </div>
            </div>

            {/* Bento Card 2: ZATCA Invoicing */}
            <div id="zatca" className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-xs mb-3">
                  جاهزية تقنية أولية للفوترة
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">الفوترة الضريبية الإلكترونية</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  إصدار مسودات فواتير أتعاب وحساب ضريبة القيمة المضافة للمراجعة الداخلية. لا تمثل الميزة حلاً معتمداً أو مدمجاً مع منصة فاتورة حالياً.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                تصدير PDF وختم ضريبي نظامي
              </div>
            </div>

            {/* Bento Card 3: Local Sovereign Security */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Server className="w-6 h-6" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs mb-3">
                  Local-First Sovereign
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">أمان محلي وسيادة كاملة على البيانات</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  قواعد بياناتك ووثائق الموكلين تحفظ محلياً على جهازك أو بيئتك السحابية الخاصة. سرية الموكل مصانة بالكامل دون مغادرة أسرار القضايا لخوادم خارجية.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                تشفير 256-bit بمعايير الأمن السيبراني
              </div>
            </div>

            {/* Bento Card 4: Court Case Tracking & Najiz */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                  <Gavel className="w-6 h-6" />
                </div>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs mb-3">
                  إدارة المواعيد والجلسات
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">تتبع القضايا والمدد النظامية</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  إدارة أرقام القضايا، الدوائر القضائية، وتواريخ الجلسات مع تنبيهات ذكية لمدد الطعن والاستئناف لضمان عدم فوات أي موعد قانوني حرج.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                أجندة مدمجة متزامنة مع تصنيفات ناجز
              </div>
            </div>

            {/* Bento Card 5: Student & Training Academy */}
            <div id="student-path" className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs mb-3">
                  مساحة طلاب القانون
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">أكاديمية سَنَد وبطاقات الاستذكار</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  بيئة مخصصة لطلاب كليات الشريعة والأنظمة والمحامين المتدربين. بنك مصطلحات قضائية، قضايا تدريبية واقعية، وتكرار متباعد لحفظ نصوص المواد القضائية.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                تتبع ساعات التدريب والمراجعة الذكية
              </div>
            </div>

            {/* Bento Card 6: Legal Research Hub (md:col-span-2) */}
            <div id="research-hub" className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                  <Bookmark className="w-6 h-6" />
                </div>
                <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs mb-3">
                  مستودع الأبحاث والسوابق القضائية
                </Badge>
                <h3 className="text-2xl font-bold text-white mb-3">مركز البحث القانوني المتقدم وبناء المذكرات والرأي</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
                  احفظ المواد النظامية، مبادئ المحكمة العليا، والقرارات الإدارية في مستودع موحد. قسّم مراجعك حسب الوسوم والمحاكم (تجارية، عمالية، استئناف)، وابنِ مسودة رأي قانوني متكاملة الاستشهادات بضغطة زر.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5 text-xs text-slate-300">
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">المعاملات المدنية (م/174، م/179)</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">نظام الإثبات (م/54)</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">قرارات المحكمة العليا التجارية</span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">توليد ملف الرأي الاستشاري Dossier</span>
              </div>
            </div>

            {/* Bento Card 7: Law Newsletter & Regulatory Briefs (1 col) */}
            <div id="newsletter" className="rounded-3xl p-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Newspaper className="w-6 h-6" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs mb-3">
                  موجز الأنظمة والنشرات الدورية
                </Badge>
                <h3 className="text-xl font-bold text-white mb-3">النشرة القانونية وموجز التشريعات</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  متابعة أسبوعية حية لأحدث التعديلات والتعاميم الوزارية ولوائح الهيئات التنظيمية، مع إمكانية تحويل أي تعميم فوراً إلى مذكرة إحاطة للعميل أو حفظه في مستودع أبحاثك.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-4 border-t border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                تصدير مذكرات إحاطة العملاء + تنبيهات تخصصية
              </div>
            </div>
          </div>
        </section>
    </>
  )
}
