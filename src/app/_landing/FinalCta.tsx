import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'

export function FinalCta() {
  return (
    <>
        {/* High-Impact Final Call to Action */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
          <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-center shadow-2xl shadow-emerald-950/60">
            {/* Ambient Background Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1">
                ابدأ رحلتك الرقمية الآن
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                جاهز للارتقاء بعملك القانوني إلى أقصى كفاءة ممكنة؟
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                انضم إلى نخبة المحامين والمستشارين القانونيين الذين يوفرون ساعات من الصياغة اليومية ويضمنون أعلى معايير الامتثال النظامي.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-10 bg-emerald-700 hover:bg-emerald-600 text-white text-lg font-bold shadow-xl shadow-emerald-700/40 transition-all hover:scale-[1.03] cursor-pointer">
                    إنشاء حساب جديد مجاناً
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-base font-semibold cursor-pointer">
                    تسجيل الدخول للمنصة
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-slate-400 pt-2 flex items-center justify-center gap-4">
                <span>✓ لا يتطلب بطاقة ائتمانية</span>
                <span>✓ تفعيل فوري</span>
                <span>✓ دعم فني محلي</span>
              </div>
            </div>
          </div>
        </section>
    </>
  )
}
