'use client'


export function SessionCheckScreen() {
  return (
    <>
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white" dir="rtl">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-300">جاري التحقق من أمان الرابط...</p>
    </div>
  </div>
    </>
  )
}
