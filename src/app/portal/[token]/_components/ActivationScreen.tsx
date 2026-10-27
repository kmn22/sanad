'use client'

import {
  AlertTriangle,
  Lock,
  Smartphone,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PortalView } from '../_lib/use-portal-view'

export function ActivationScreen({ v }: { v: PortalView }) {
  const { workspace, client, otpCode, setOtpCode, otpAttemptsLeft, isOtpLocked, lockCountdown, otpSending, demoOtpCode, maskedPhone, handleRequestOtp, handleVerifyOtp } = v
  return (
    <>
return (
  <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden" dir="rtl">
    {/* Glow aesthetics */}
    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-teal-600/15 rounded-full blur-[120px] pointer-events-none" />

    {/* Top status bar simulation */}
    <div className="w-full max-w-sm mx-auto flex items-center justify-between text-xs text-slate-400 pt-2 pb-6">
      <span className="font-mono">9:41</span>
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className="border-slate-800 text-[10px] text-emerald-400 bg-emerald-950/40">
          SMS • آمن
        </Badge>
      </div>
    </div>

    {/* S1 Main Card */}
    <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-2xl shadow-lg ring-1 ring-emerald-400/30 mx-auto">
          س
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">سند • بوابة الموكل</h1>
        <p className="text-sm text-emerald-300 font-medium">
          مرحباً، {client.name.split(' ')[0]}
        </p>
        <p className="text-xs text-slate-300 px-4 leading-relaxed">
          لديك دعوة من <strong className="text-white">{workspace?.name || 'مكتب المحاماة'}</strong> لمتابعة قضيتك ومراجعة المستندات بدون كلمات مرور.
        </p>
      </div>

      <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl p-6 rounded-3xl space-y-5">
        <div>
          <label htmlFor="s1-phone" className="text-xs font-semibold text-slate-400 block mb-1.5">
            رقم الجوال المرتبط بالدعوة:
          </label>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white font-mono text-center tracking-wider text-sm flex items-center justify-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span>{maskedPhone()}</span>
          </div>
        </div>

        {isOtpLocked ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2 text-center">
            <AlertTriangle className="h-6 w-6 text-rose-400 mx-auto" />
            <p className="font-bold">تم قفل المحاولة مؤقتاً</p>
            <p>تم استنفاد 3 محاولات خاطئة. يرجى الانتظار: {Math.floor(lockCountdown / 60)} دقيقة و {lockCountdown % 60} ثانية</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="s1-otp" className="text-xs font-semibold text-slate-400">
                أدخل رمز التحقق (OTP):
              </label>
              {demoOtpCode && (
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtpCode)}
                  className="text-[11px] text-emerald-400 underline font-mono cursor-pointer"
                >
                  تعبئة الرمز ({demoOtpCode})
                </button>
              )}
            </div>
            <Input
              id="s1-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • • • •"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="bg-slate-800/70 border-slate-700 text-center font-mono text-xl tracking-[0.4em] text-white h-13 rounded-xl focus-visible:ring-emerald-500"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>صلاحية الرمز: 10 دقائق</span>
              <span>المحاولات المتبقية: {otpAttemptsLeft}</span>
            </div>

            <Button
              onClick={handleVerifyOtp}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 text-sm gap-2 transition-all cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>تأكيد الدخول لبوابتي</span>
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={otpSending}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors underline cursor-pointer"
              >
                {otpSending ? 'جاري إرسال الرمز...' : 'لم يصلك الرمز؟ أعد الإرسال الآن'}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* PDPPL Consent Single Line */}
      <div className="mt-6 text-center px-4">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          بالمتابعة أنت توافق على{' '}
          <a href="/privacy" target="_blank" className="text-emerald-400 underline">
            سياسة الخصوصية
          </a>
          . تستطيع طلب حذف بياناتك في أي وقت من الإعدادات.
        </p>
      </div>
    </div>

    {/* Footer */}
    <div className="w-full max-w-sm mx-auto text-center text-[10px] text-slate-600 py-3">
      سند للأمان القانوني • مشفر ومحمي بموجب نظام حماية البيانات الشخصية السعودي
    </div>
  </div>
)
    </>
  )
}
