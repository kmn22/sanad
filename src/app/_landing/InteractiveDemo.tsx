'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
  Receipt,
  Calendar,
  Gavel,
  Clock,
  GraduationCap,
  QrCode,
  AlertCircle,
  Eye,
  Flame,
} from 'lucide-react'

export function InteractiveDemo() {
  // Live Demo Tab in Hero
  const [activeDemoTab, setActiveDemoTab] = useState<'drafting' | 'zatca' | 'focus' | 'student'>('drafting')

  // Interactive Drafting Sandbox state
  const [hasNonCompete, setHasNonCompete] = useState(true)
  const [contractDuration, setContractDuration] = useState('12')

  // Student Flashcard Flip
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false)

  return (
    <>
        {/* Live Interactive Sandbox / Product Tour Widget */}
        <section id="interactive-demo" className="px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl pb-24">
          <div className="text-center mb-8">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-3 py-1 mb-2 font-mono">
              INTERACTIVE DEMO
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">جرّب قدرات سَنَد الحية الآن قبل التسجيل</h2>
            <p className="text-slate-400 text-sm mt-1">تفاعل مع النماذج أدناه وشاهد كيف ينفذ النظام الضوابط والتحققات آلياً</p>
          </div>

          {/* Outer Glass Card */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-emerald-950/40 overflow-hidden">
            {/* Tab Controls Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/10 bg-slate-950/60 p-2 gap-2 text-xs sm:text-sm">
              <button
                onClick={() => setActiveDemoTab('drafting')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeDemoTab === 'drafting'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>أتمتة الصياغة والضمانات</span>
              </button>

              <button
                onClick={() => setActiveDemoTab('zatca')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeDemoTab === 'zatca'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>مسودة فاتورة داخلية مع رمز تجريبي</span>
              </button>

              <button
                onClick={() => setActiveDemoTab('focus')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeDemoTab === 'focus'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Gavel className="w-4 h-4 text-emerald-400" />
                <span>إدارة الجلسات والتركيز</span>
              </button>

              <button
                onClick={() => setActiveDemoTab('student')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeDemoTab === 'student'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>أكاديمية تدريب القانون</span>
              </button>
            </div>

            {/* Tab 1: Interactive Drafting Hub */}
            {activeDemoTab === 'drafting' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      محاكاة صياغة: عقد عمل سعودي محدد المدة
                    </h3>
                    <p className="text-xs text-slate-400">تعديل المتغيرات يُطبق الضمانات النظامية التلقائية في الوقت الحقيقي</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">فحص النظام:</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                      مفعل: نظام العمل السعودي (م/83 و م/53)
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Controls Column */}
                  <div className="lg:col-span-4 space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                    <div className="text-sm font-semibold text-slate-200 mb-2">محددات الصياغة التفاعلية:</div>

                    <div>
                      <label htmlFor="contract-duration" className="text-xs text-slate-400 block mb-1.5">مدة العقد الأساسي:</label>
                      <select
                        id="contract-duration"
                        value={contractDuration}
                        onChange={(e) => setContractDuration(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="12">12 شهراً (سنة واحدة)</option>
                        <option value="24">24 شهراً (سنتان)</option>
                        <option value="36">36 شهراً (ثلاث سنوات)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs text-slate-400 block mb-2">إدراج شرط عدم المنافسة وسرية المعلومات:</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setHasNonCompete(true)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            hasNonCompete
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          نعم (تفعيل الشرط)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasNonCompete(false)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            !hasNonCompete
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          بدون الشرط
                        </button>
                      </div>
                    </div>

                    {/* Active Regulatory Safeguard Alerts */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="text-xs font-semibold text-slate-300">الضمانات النظامية المفعلة:</div>
                      {hasNonCompete ? (
                        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>[م/83 نظام العمل]:</strong> تم تقييد عدم المنافسة بسنة واحدة ونطاق مدينة العمل لحماية صحة الشرط قضائياً.
                          </span>
                        </div>
                      ) : (
                        <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>تنبيه: تم إلغاء بند عدم المنافسة، يحق للطرف الثاني الانتقال إلى منافس فور انتهاء العلاقة.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generated Document Preview Column */}
                  <div className="lg:col-span-8 bg-slate-950/90 rounded-2xl border border-white/5 p-6 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[380px] space-y-3">
                    <div className="text-center font-bold text-sm text-emerald-400 border-b border-white/5 pb-2">
                      # عقد عمل سعودي محدد المدة (مسودة تتطلب مراجعة قانونية)
                    </div>
                    <p className="text-slate-400">
                      بعون الله تعالى، تم إبرام هذا العقد في مدينة الرياض بين الطرف الأول (صاحب العمل) والطرف الثاني (الموظف).
                    </p>
                    <div className="p-3 bg-white/5 rounded-xl border-r-2 border-emerald-500">
                      <strong className="text-emerald-300 block mb-1">المادة الثانية: مدة العقد وفترة التجربة (م/53)</strong>
                      تحدد مدة هذا العقد بـ <span className="text-amber-300 font-bold underline font-sans">({contractDuration}) شهراً</span> تبدأ من تاريخ مباشرة العمل الفعلي وتخضع لفترة تجربة مدتها 90 يوماً.
                    </div>
                    {hasNonCompete && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl border-r-2 border-r-emerald-500 animate-fade-in">
                        <strong className="text-emerald-300 block mb-1">المادة الخامسة: عدم المنافسة وسرية البيانات (م/83)</strong>
                        يلتزم الطرف الثاني بعدم منافسة الطرف الأول داخل نطاق مدينة (الرياض) لمدة (سنة واحدة) من انتهاء العلاقة، حفظاً لأسرار العمل.
                      </div>
                    )}
                    <div className="p-3 bg-white/5 rounded-xl border-r-2 border-slate-600">
                      <strong className="text-slate-300 block mb-1">المادة الختامية: الاختصاص القضائي</strong>
                      يخضع هذا العقد ويفسر وفقاً لنظام العمل السعودي وتختص المحاكم العمالية بالمملكة بنظر أي نزاع قد ينشأ عنه.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: ZATCA Invoicing */}
            {activeDemoTab === 'zatca' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-400" />
                      محرك فواتير تجريبي (غير مدمج حالياً مع منصة فاتورة)
                    </h3>
                    <p className="text-xs text-slate-400">معاينة تعليمية فقط؛ لا ترسل الفواتير إلى الهيئة ولا تثبت الامتثال أو الاعتماد الضريبي</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                    نموذج غير مرتبط بالهيئة
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">رقم نموذج الفاتورة:</span>
                        <span className="font-mono font-bold text-white">INV-2026-0042</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">رقم التسجيل الضريبي:</span>
                        <span className="font-mono text-emerald-300">غير مهيأ — بيانات توضيحية</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">بيان الأتعاب القانونية:</span>
                        <span className="text-white">صياغة ومراجعة لائحة دعوى تجارية</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">المبلغ الخاضع للضريبة:</span>
                        <span className="font-mono text-white">5,000.00 ر.س</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-slate-400">ضريبة القيمة المضافة (15%):</span>
                        <span className="font-mono text-amber-300">750.00 ر.س</span>
                      </div>
                      <div className="flex justify-between items-center text-base font-bold pt-1">
                        <span className="text-white">الإجمالي شامل الضريبة:</span>
                        <span className="font-mono text-emerald-400 text-lg">5,750.00 ر.س</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code TLV Visualizer */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-emerald-500/20 text-center">
                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-emerald-500/10 mb-3">
                      <QrCode className="w-32 h-32 text-slate-950" />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> رمز استجابة سريع تجريبي غير معتمد
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                      هذه أيقونة توضيحية وليست رمزاً قابلاً للمسح، ولا تحتوي بيانات تسجيل أو اعتماد حقيقية.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Deep Work & Case Hearings */}
            {activeDemoTab === 'focus' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      لوحة التركيز وإدارة الجلسات القضائية اليومية
                    </h3>
                    <p className="text-xs text-slate-400">ربط مواعيد الدوائر القضائية مع جلسات العمل العميق للمحامي (Deep Work)</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                    تزامن ذكي مع مواعيد ناجز
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hearing Alerts Card */}
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-emerald-400" /> الجلسات القضائية القادمة:
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border-r-2 border-emerald-500 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-white">دعوى إخلال بعقد توريد</div>
                        <div className="text-xs text-slate-400">المحكمة التجارية بالرياض — الدائرة السادسة</div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">غداً 09:30 ص</Badge>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border-r-2 border-amber-500 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-white">مطالبة مستحقات عمالية</div>
                        <div className="text-xs text-slate-400">المحكمة العمالية بجدة — جلسة تبادل مذكرات</div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-300 text-xs">بعد 3 أيام</Badge>
                    </div>
                  </div>

                  {/* Pomodoro Timer Preview */}
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                      <Flame className="w-4 h-4 text-amber-400" /> جلسة صياغة مركزة (Deep Work)
                    </div>
                    <div className="text-4xl font-mono font-black text-white my-2">25:00</div>
                    <p className="text-xs text-slate-400 max-w-xs mb-3">
                      تخصيص وقت مخصص لتحليل أسانيد القضية وكتابة الدفوع دون أي مشتتات.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-300">
                        حظر الإشعارات مفعّل
                      </Badge>
                      <Badge variant="outline" className="text-xs border-white/10 text-slate-400">
                        تتبع الساعات المفوترة
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Student Path & Academy */}
            {activeDemoTab === 'student' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                      أكاديمية سَنَد وبنك الأسئلة التفاعلي لطلاب القانون
                    </h3>
                    <p className="text-xs text-slate-400">تقنية الاستذكار المتباعد (Spaced Repetition) لحفظ الأنظمة وتطبيق السوابق</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs">
                    بنك أسئلة الأنظمة السعودية
                  </Badge>
                </div>

                <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/5 max-w-2xl mx-auto text-center space-y-4">
                  <div className="text-xs font-bold text-blue-400 tracking-wider">سؤال تطبيقي من نظام المعاملات المدنية:</div>
                  <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    «إذا اتفق المتعاقدان على مقدار التعويض (الشرط الجزائي)، فما هي سلطة المحكمة إذا أثبت المدين أن الضرر كان أقل من التعويض المتفق عليه؟»
                  </p>

                  {showFlashcardAnswer ? (
                    <div className="bg-emerald-950/50 border border-emerald-500/30 p-4 rounded-xl text-emerald-200 text-sm animate-fade-in text-right">
                      <strong className="block mb-1 text-emerald-300">الجواب النظامي (المادة 179 - معاملات مدنية):</strong>
                      «يجوز للمحكمة بناءً على طلب المدين أن تخفض مقدار التعويض إذا أثبت أن التعويض المتفق عليه كان مبالغاً فيه بدرجة كبيرة، أو أن الالتزام نُفذ في جزء منه، ويقع باطلاً كل اتفاق يخالف ذلك.»
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowFlashcardAnswer(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-2 rounded-xl cursor-pointer"
                    >
                      <Eye className="w-4 h-4 ml-1.5" /> كشف الإجابة والسند النظامي
                    </Button>
                  )}

                  {showFlashcardAnswer && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-xs text-slate-400">تقييم استذكارك:</span>
                      <Button size="sm" variant="outline" onClick={() => setShowFlashcardAnswer(false)} className="text-xs border-emerald-500/40 text-emerald-300">
                        سهل جداً (بعد 7 أيام)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowFlashcardAnswer(false)} className="text-xs border-amber-500/40 text-amber-300">
                        متوسط (بعد 3 أيام)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowFlashcardAnswer(false)} className="text-xs border-rose-500/40 text-rose-300">
                        صعب (إعادة غداً)
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
    </>
  )
}
