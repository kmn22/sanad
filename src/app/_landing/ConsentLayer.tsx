'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, X, Shield } from 'lucide-react'
import Link from 'next/link'
import { getMigratedItem, setMigratedItem } from '@/lib/storage-migration'

const MAQAR_CONSENT_KEY = 'maqar_cookie_consent'
const LEGACY_CONSENT_KEY = 'sanad_cookie_consent'

export function ConsentLayer() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [cookieConsentDismissed, setCookieConsentDismissed] = useState(true)

  useEffect(() => {
    try {
      const saved = getMigratedItem(MAQAR_CONSENT_KEY, LEGACY_CONSENT_KEY)
      if (!saved) {
        setCookieConsentDismissed(false)
      }
    } catch {}
  }, [])

  const acceptCookies = () => {
    try {
      setMigratedItem(MAQAR_CONSENT_KEY, LEGACY_CONSENT_KEY, 'true')
    } catch {}
    setCookieConsentDismissed(true)
  }

  return (
    <>
      {/* Saudi PDPL Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in" dir="rtl">
          <div className="bg-white border border-[#CCD8CE] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[#CCD8CE] flex items-center justify-between bg-[#F5F7F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8EFE9] border border-[#CCD8CE] flex items-center justify-center text-[#1F7A46]">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#1B281F] font-heading">
                  سياسة الخصوصية والامتثال لنظام حماية البيانات الشخصية (PDPL)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-[#4A5D50] hover:text-[#1B281F] p-1 rounded-lg hover:bg-[#E8EFE9] transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#1B281F] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#E8EFE9] border border-[#CCD8CE] text-[#34543F] text-xs font-medium">
                تلتزم منصة مَقَرّ (Maqar) بنظام حماية البيانات الشخصية السعودي الصادر بالمرسوم الملكي رقم (م/19) وتعديلاته وقرارات الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).
              </div>

              <h4 className="text-[#1B281F] font-bold text-sm pt-1">1. السيادة المكانية للبيانات وتوطين الاستضافة</h4>
              <p className="text-[#4A5D50] text-xs">
                تُحفظ كافة ملفات الاستشارات، العقود، والقضايا ومسودات الأعمال محلياً داخل حدود المملكة العربية السعودية، ولا يتم نقل أي بيانات سرية أو مهنية إلى خوادم خارجية غير مرخصة.
              </p>

              <h4 className="text-[#1B281F] font-bold text-sm pt-1">2. عدم استخدام بيانات العملاء لتدريب الذكاء الاصطناعي</h4>
              <p className="text-[#4A5D50] text-xs">
                نلتزم التزاماً صارماً بموجب ميثاق السرية المهنية بعدم استخدام نصوص العقود، الاستشارات، أو مستندات العملاء لتدريب أي نماذج ذكاء اصطناعي عامة.
              </p>

              <h4 className="text-[#1B281F] font-bold text-sm pt-1">3. حقوق أصحاب البيانات الشخصية</h4>
              <p className="text-[#4A5D50] text-xs">
                يحق للمستخدم في أي وقت طلب تصدير نسخته الاحتياطية، أو تصحيح بياناته، أو إتلاف وحذف حسابه بصورة نهائية من النظام عبر صفحة طلبات الخصوصية.
              </p>
            </div>

            <div className="p-4 border-t border-[#CCD8CE] bg-[#F5F7F5] flex justify-between items-center">
              <Link href="/privacy" className="text-xs text-[#1F7A46] font-bold underline">
                عرض السياسة الكاملة
              </Link>
              <Button
                size="sm"
                onClick={() => setShowPrivacyModal(false)}
                className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold px-5 cursor-pointer text-xs"
              >
                إغلاق وفهمت الشروط
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Cookie Notice Bar — docked cleanly at the bottom edge so it never covers interactive page cards */}
      {!cookieConsentDismissed && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 border-t border-[#CCD8CE] bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-md animate-in fade-in"
          dir="rtl"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-[#1B281F]">
              <ShieldCheck className="w-4 h-4 text-[#1F7A46] shrink-0" />
              <span>
                نستخدم ملفات تعريف ارتباط محلية مشفرة لتأمين الجلسات وفق نظام حماية البيانات الشخصية السعودي (PDPL).
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-[11px] text-[#1F7A46] font-bold hover:underline cursor-pointer"
              >
                الاطلاع على السياسة
              </button>
              <Button
                size="sm"
                onClick={acceptCookies}
                className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold px-3.5 h-7 cursor-pointer shadow-2xs"
              >
                موافق ومتابعة
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
