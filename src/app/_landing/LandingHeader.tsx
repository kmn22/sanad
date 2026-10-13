import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scale, ArrowLeft } from 'lucide-react'

export function LandingHeader() {
  return (
    <>
      {/* Top Announcement Bar */}
      <div className="relative z-30 border-b border-emerald-500/20 bg-emerald-950/70 backdrop-blur-md px-4 py-2 text-center text-xs sm:text-sm font-medium text-emerald-300 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span>🇸🇦 منصة سعودية قيد التطوير — المزايا التنظيمية والفوترة تتطلب مراجعة واعتماداً مستقلاً</span>
        <Link href="/register" className="underline underline-offset-4 hover:text-white font-bold inline-flex items-center gap-1 mr-1">
          جرّب الآن مجاناً <ArrowLeft className="w-3.5 h-3.5 inline" />
        </Link>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Scale className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-white">سَنَد</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-1.5 py-0">
                      LEGAL OS
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:block">النظام التشغيلي القانوني الذكي</span>
                </div>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-emerald-400 transition-colors">المميزات الأساسية</a>
              <a href="#interactive-demo" className="hover:text-emerald-400 transition-colors">التجربة التفاعلية</a>
              <a href="#drafting" className="hover:text-emerald-400 transition-colors">محرك الصياغة</a>
              <a href="#research-hub" className="hover:text-emerald-400 transition-colors">مركز الأبحاث</a>
              <a href="#newsletter" className="hover:text-emerald-400 transition-colors">النشرة القانونية</a>
              <a href="#zatca" className="hover:text-emerald-400 transition-colors">فوترة زاتكا</a>
              <a href="#student-path" className="hover:text-emerald-400 transition-colors">مسار المتدربين</a>
              <Link href="/pricing" className="hover:text-emerald-400 text-emerald-400 font-bold transition-colors">
                الأسعار والباقات
              </Link>
              <Link href="/sandbox" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>جرّب المعمل التجريبي</span>
              </Link>
              <a href="#faq" className="hover:text-emerald-400 transition-colors">الأسئلة الشائعة</a>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-white/10 font-semibold px-4 cursor-pointer">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-xl shadow-emerald-600/30 px-5 border border-emerald-400/30 transition-all hover:scale-[1.02] cursor-pointer">
                  ابدأ مجاناً
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
