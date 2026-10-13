'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, X, Shield } from 'lucide-react'

export function ConsentLayer() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [cookieConsentDismissed, setCookieConsentDismissed] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanad_cookie_consent')
      if (!saved) {
        setCookieConsentDismissed(false)
      }
    } catch {}
  }, [])

  const acceptCookies = () => {
    try {
      localStorage.setItem('sanad_cookie_consent', 'true')
    } catch {}
    setCookieConsentDismissed(true)
  }

  return (
    <>
      {/* Saudi PDPL Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">سياسة الخصوصية والامتثال لنظام حماية البيانات الشخصية (PDPL)</h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                تلتزم منصة سَنَد بنظام حماية البيانات الشخصية السعودي الصادر بالمرسوم الملكي رقم (م/19) وتعديلاته وقرارات الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).
              </div>

              <h4 className="text-white font-bold text-sm pt-2">1. السيادة المكانية للبيانات وتوطين الاستضافة</h4>
              <p className="text-slate-400 text-xs">
                تُحفظ كافة ملفات القضايا، المستندات، ومذكرات الموكلين محلياً داخل حدود المملكة العربية السعودية، ولا يتم نقل أي بيانات سرية أو شخصية إلى خوادم خارجية غير مرخصة.
              </p>

              <h4 className="text-white font-bold text-sm pt-2">2. عدم استخدام بيانات الموكلين لتدريب الذكاء الاصطناعي</h4>
              <p className="text-slate-400 text-xs">
                نلتزم التزاماً صارماً بموجب ميثاق سرية المحاماة بعدم استخدام نصوص العقود أو مستندات الموكلين لتدريب أي نماذج ذكاء اصطناعي عامة. كافة عمليات التحليل والصياغة تتم محلياً وبشكل معزول تماماً لكل مكتب.
              </p>

              <h4 className="text-white font-bold text-sm pt-2">3. حقوق أصحاب البيانات الشخصية</h4>
              <p className="text-slate-400 text-xs">
                يحق للمستخدم في أي وقت طلب تصدير نسخته الاحتياطية، أو تصحيح بياناته، أو إتلاف وحذف حسابه وجميع سجلاته بصورة نهائية من قاعدة البيانات.
              </p>

              <h4 className="text-white font-bold text-sm pt-2">4. الفوترة الضريبية وحماية المعلومات المالية</h4>
              <p className="text-slate-400 text-xs">
                ميزة الفواتير الحالية داخلية وتجريبية ولا تُعد تكاملاً معتمداً مع ZATCA. يتحمل المستخدم مسؤولية المراجعة الضريبية قبل الاستخدام.
              </p>
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-950/60 flex justify-end">
              <Button
                onClick={() => setShowPrivacyModal(false)}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 cursor-pointer"
              >
                إغلاق وفهمت الشروط
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Cookie Notice Banner */}
      {!cookieConsentDismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-40 p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/30 backdrop-blur-xl shadow-2xl flex flex-col gap-3 animate-fade-in" dir="rtl">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              نحن نستخدم ملفات تعريف ارتباط محلية وتقنيات مشفرة لتحسين تجربتك وتأمين جلسة المحاماة وفق نظام حماية البيانات الشخصية السعودي (PDPL).
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
            >
              الاطلاع على السياسة
            </button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 h-8 cursor-pointer"
            >
              موافق ومتابعة
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
