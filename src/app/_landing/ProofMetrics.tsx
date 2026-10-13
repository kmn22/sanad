
export function ProofMetrics() {
  return (
    <>
        {/* Numbers & Proof Metrics */}
        <section className="py-12 border-y border-white/5 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  +40
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">نماذج أولية تتطلب مراجعة محامٍ</div>
              </div>
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  تجريبي
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">يتطلب التحقق قبل الاستخدام الضريبي</div>
              </div>
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  0
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">تسريب بيانات (تخزين محلي سيادي)</div>
              </div>
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  3x
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">تسريع إعداد اللوائح وصياغة العقود</div>
              </div>
            </div>
          </div>
        </section>
    </>
  )
}
