'use client'

import { ShieldCheck, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SecuritySettingsState } from './use-security-settings'

export function MfaSection({ v }: { v: SecuritySettingsState }) {
  const { user, privileged, secret, uri, qrDataUrl, token, setToken, recoveryCodes, copiedSecret, setCopiedSecret, disablePassword, setDisablePassword, disableOtp, setDisableOtp, beginSetup, verify, disableMfa } = v
  return (
    <>
        {/* 1. Two-Factor Authentication (MFA) with Scannable QR Code */}
        <section className="rounded-2xl border border-[#CCD8CE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1F7A46]" />
                <span>التحقق بخطوتين (MFA / TOTP)</span>
              </h2>
              <p className="text-xs text-[#566A5C] mt-0.5">
                إلزامي لمالكي المكاتب والمديرين، ويحمي حسابك عبر تطبيقات المصادقة القياسية.
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                user?.mfaEnabled
                  ? 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]'
                  : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
              }`}
            >
              {user?.mfaEnabled ? 'مفعّل ✓' : 'غير مفعّل'}
            </span>
          </div>

          {!secret && !user?.mfaEnabled && (
            <Button
              onClick={beginSetup}
              className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-10 px-5 cursor-pointer"
            >
              بدء إعداد تطبيق المصادقة
            </Button>
          )}

          {secret && !recoveryCodes.length && (
            <div className="space-y-4 pt-2 border-t border-[#CCD8CE]">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5 items-center bg-[#F5F7F5] p-4 rounded-2xl border border-[#CCD8CE]">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="رمز QR لإعداد التحقق بخطوتين"
                    className="w-44 h-44 rounded-xl border border-[#CCD8CE] bg-white p-2 mx-auto"
                  />
                )}
                <div className="space-y-2.5 text-xs">
                  <p className="font-bold text-[#1B281F]">
                    1. امسح رمز QR بتطبيق المصادقة على جوالك، أو انسخ المفتاح السري يدوياً:
                  </p>
                  <div className="flex items-center gap-2 bg-white border border-[#CCD8CE] rounded-xl p-2.5 font-mono text-xs" dir="ltr">
                    <span className="truncate flex-1 select-all">{secret}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(secret)
                        setCopiedSecret(true)
                        setTimeout(() => setCopiedSecret(false), 2000)
                      }}
                      className="text-[#1F7A46] font-sans font-bold text-[11px] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSecret ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                  <details className="text-[11px] text-[#566A5C]">
                    <summary className="cursor-pointer hover:text-[#1B281F]">رابط الإعداد المتقدم (otpauth)</summary>
                    <p className="break-all font-mono mt-1 bg-white p-2 rounded border border-[#CCD8CE]" dir="ltr">{uri}</p>
                  </details>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="أدخل الرمز المكون من 6 أرقام"
                  className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs sm:max-w-xs"
                />
                <Button
                  onClick={verify}
                  className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-10 px-6 cursor-pointer"
                >
                  تحقق وفعّل
                </Button>
              </div>
            </div>
          )}

          {recoveryCodes.length > 0 && (
            <div className="mt-4 rounded-xl border border-[#CCD8CE] bg-[#F5F7F5] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1B281F]">رموز الاسترداد الاحتياطية — تظهر مرة واحدة فقط</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryCodes.join('\n'))
                    toast.success('تم نسخ رموز الاسترداد')
                  }}
                  className="h-7 text-xs"
                >
                  نسخ الرموز
                </Button>
              </div>
              <ul className="grid grid-cols-2 gap-2 font-mono text-xs bg-white p-3 rounded-lg border border-[#CCD8CE]" dir="ltr">
                {recoveryCodes.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
            </div>
          )}

          {user?.mfaEnabled && !privileged && (
            <form onSubmit={disableMfa} className="mt-4 grid gap-3 border-t border-[#CCD8CE] pt-4">
              <h3 className="font-bold text-sm">تعطيل التحقق بخطوتين</h3>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                placeholder="كلمة المرور الحالية"
                className="bg-[#F5F7F5] border-[#CCD8CE]"
              />
              <Input
                value={disableOtp}
                onChange={(e) => setDisableOtp(e.target.value)}
                required
                placeholder="رمز المصادقة أو الاسترداد"
                className="bg-[#F5F7F5] border-[#CCD8CE]"
              />
              <Button variant="destructive" className="w-fit text-xs">
                تعطيل MFA
              </Button>
            </form>
          )}
          {privileged && (
            <p className="text-xs text-[#566A5C]">
              لا يمكن تعطيل MFA للحسابات الإدارية ومالكي مساحات العمل إلا عبر إعادة تعيين من مدير آخر.
            </p>
          )}
        </section>

    </>
  )
}
