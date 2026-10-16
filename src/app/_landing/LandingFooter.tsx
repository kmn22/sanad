import Link from 'next/link'
import { Scale, ShieldCheck, Mail, MessageCircle } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="border-t border-[#CCD8CE] bg-white py-12 text-[#4A5D50] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#CCD8CE]">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F7A46] p-2 rounded-xl text-white">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#1B281F] font-heading">سَنَد</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE]">
                  Sanad Legal OS
                </span>
              </div>
              <p className="text-[11px] text-[#566A5C]">
                مساعد الصياغة القانونية الممتثلة للأنظمة السعودية
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#1B281F]">
            <Link href="/#checker" className="hover:text-[#1F7A46] transition-colors">المصحح</Link>
            <Link href="/sandbox" className="hover:text-[#1F7A46] transition-colors">المعمل التجريبي</Link>
            <Link href="/pricing" className="hover:text-[#1F7A46] transition-colors">الأسعار</Link>
            <Link href="/about" className="hover:text-[#1F7A46] transition-colors">من نحن</Link>
            <Link href="/security" className="hover:text-[#1F7A46] transition-colors">الأمان والسيادة</Link>
            <Link href="/build" className="hover:text-[#1F7A46] transition-colors">قيد البناء</Link>
            <Link href="/login" className="hover:text-[#1F7A46] transition-colors">تسجيل الدخول</Link>
            <Link href="/register" className="hover:text-[#1F7A46] text-[#1F7A46] font-bold transition-colors">ابدأ مجاناً</Link>
          </div>
        </div>

        {/* Support & Contact Channel (Mandatory for Institutional Trust) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#CCD8CE] text-[#1F7A46] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#1B281F] block">التواصل المباشر والاستفسارات المهنية</span>
              <a href="mailto:ahmed@sanad.sa" className="text-[#1F7A46] hover:underline font-mono">
                ahmed@sanad.sa
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#CCD8CE] text-[#1F7A46] flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#1B281F] block">قناة الدعم الفني المباشر</span>
              <span className="text-[#566A5C]">
                متاح عبر البريد والواتساب • <strong className="text-[#1B281F]">نرد خلال يوم عمل واحد</strong>
              </span>
            </div>
          </div>
        </div>

        {/* SBA Regulatory Notice */}
        <div className="p-4 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] text-[11px] text-[#4A5D50] leading-relaxed">
          <strong className="text-[#1B281F] block mb-1">إشعار تنظيمي ومهني:</strong>
          منظومة <strong>سَنَد (SANAD Legal OS)</strong> هي برمجية تقنية مساندة لإدارة ومراجعة الصياغة القانونية ومساعدة الممارسين القانونيين والشركات في المملكة العربية السعودية. لا تُعد المنظومة مكتب محاماة ولا تقدم استشارات قانونية موجهة للأفراد أو خدمات الترافع المباشر دون محامٍ مرخص من الهيئة السعودية للمحامين.
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-4 border-t border-[#CCD8CE] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#566A5C]">
          <p>© {new Date().getFullYear()} سَنَد للتقنية القانونية. الرياض، المملكة العربية السعودية.</p>

          <div className="flex items-center gap-4 text-[11px] font-medium text-[#1B281F]">
            <Link href="/privacy" className="hover:text-[#1F7A46] underline">سياسة الخصوصية</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#1F7A46] underline">شروط الاستخدام</Link>
            <span>•</span>
            <Link href="/ai-disclosure" className="hover:text-[#1F7A46] underline">إفصاح الذكاء الاصطناعي</Link>
          </div>

          <div className="flex items-center gap-1.5 text-[#1F7A46] font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>تشفير سيادي متوافق مع PDPL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
