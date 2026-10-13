import Link from 'next/link'
import { Scale, ShieldCheck } from 'lucide-react'

export function LandingFooter() {
  return (
    <>
      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/90 py-12 relative z-10 text-slate-400 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                <Scale className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">سَنَد — Sanad Legal OS</span>
                <p className="text-slate-500 text-xs mt-0.5">منظومة تقنية قانونية سعودية قيد التطوير والمراجعة</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <a href="#features" className="hover:text-emerald-400 transition-colors">المميزات</a>
              <a href="#interactive-demo" className="hover:text-emerald-400 transition-colors">التجربة التفاعلية</a>
              <a href="#drafting" className="hover:text-emerald-400 transition-colors">محرك الصياغة</a>
              <a href="#zatca" className="hover:text-emerald-400 transition-colors">فوترة زاتكا</a>
              <Link href="/pricing" className="hover:text-emerald-400 transition-colors">الأسعار والباقات</Link>
              <Link href="/login" className="hover:text-emerald-400 transition-colors">تسجيل الدخول</Link>
              <Link href="/register" className="hover:text-emerald-400 transition-colors">حساب جديد</Link>
            </div>
          </div>

          {/* SBA Regulatory Notice */}
          <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
            <span className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold shrink-0">إشعار تنظيمي</span>
            <p>
              منظومة <strong>سَنَد (SANAD Legal OS)</strong> هي برمجية سحابية تشغيلية وحلول ذكاء اصطناعي مساندة لإدارة العمليات القانونية ومساعدة الممارسين القانونيين والشركات وطلاب القانون. لا تُعد المنظومة مكتب محاماة ولا تقدم خدمات الترافع المباشر أو الاستشارات الموجهة للأفراد دون محامٍ مرخص من الهيئة السعودية للمحامين.
            </p>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs text-center sm:text-right">
            <p>© {new Date().getFullYear()} سَنَد للتقنية القانونية. صُمم للمملكة العربية السعودية وفق رؤية 2030.</p>
            
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-emerald-400 underline underline-offset-4 transition-colors">سياسة الخصوصية</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-emerald-400 underline underline-offset-4 transition-colors">شروط الاستخدام</Link>
              <span>•</span>
              <Link href="/ai-disclosure" className="hover:text-emerald-400 underline underline-offset-4 transition-colors">إفصاح الذكاء الاصطناعي</Link>
            </div>

            <p className="flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              تشفير محلي سيادي يحمي خصوصية الموكلين
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
