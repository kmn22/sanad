import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="border-t border-[#CCD8CE] bg-[#EFF2EF] py-12 px-4 sm:px-6 lg:px-8 text-[#1B281F]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand */}
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F7A46] text-white grid place-items-center font-bold">
              م
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block font-heading">مقر · Maqar</span>
              <span className="text-[11px] text-[#566A5C]">المكتب الرقمي وبوابة الموكّل للمحامين في السعودية</span>
            </div>
          </div>
          <p className="text-xs text-[#4A5D50] leading-relaxed">
            منصة سعودية عملية للمحامي المستقل والمكاتب الصغيرة لإدارة الملفات والجلسات ومشاركة الموكلين بأمان.
          </p>
        </div>

        {/* Navigation Links (Live routes only) */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[#4A5D50]">
          <Link href="/#checker" className="hover:text-[#1F7A46] transition-colors">مساعد قراءة البنود</Link>
          <Link href="/pricing" className="hover:text-[#1F7A46] transition-colors">الأسعار والباقات</Link>
          <Link href="/about" className="hover:text-[#1F7A46] transition-colors">عن مقر</Link>
          <Link href="/security" className="hover:text-[#1F7A46] transition-colors">الأمان والخصوصية</Link>
          <Link href="/login" className="hover:text-[#1F7A46] transition-colors">تسجيل الدخول</Link>
          <Link href="/register" className="hover:text-[#1F7A46] text-[#1F7A46] font-bold transition-colors">تجربة ١٤ يوماً مجاناً</Link>
        </div>

        {/* Contact CTA */}
        <div className="text-xs space-y-1 text-[#4A5D50]">
          <p className="font-semibold text-[#1B281F]">المملكة العربية السعودية</p>
          <p className="font-mono text-[11px]" dir="ltr">hello@maqar.sa</p>
        </div>
      </div>

      {/* Mandatory PDPL / Privacy & Terms Compliance Bar */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#CCD8CE] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#566A5C]">
        <div className="flex flex-wrap items-center gap-3">
          <span>© 2026 مقر (Maqar). جميع الحقوق محفوظة.</span>
          <span className="hidden sm:inline">•</span>
          <span>أدوات الفحص والقوالب مساعدة ولا تُعد استشارة قانونية ملزمة.</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="hover:text-[#1F7A46] underline">سياسة الخصوصية</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#1F7A46] underline">شروط الاستخدام</Link>
          <span>·</span>
          <Link href="/ai-disclosure" className="hover:text-[#1F7A46] underline">إفصاح الذكاء الاصطناعي</Link>
        </div>
      </div>
    </footer>
  )
}
