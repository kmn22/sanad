'use client'

import { FormEvent, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function SecuritySettingsPage() {
  const { data: session } = useSession()
  const user = session?.user as { role?: string; mfaEnabled?: boolean } | undefined
  const privileged = user?.role === 'admin' || user?.role === 'workspace_owner'
  const [secret, setSecret] = useState('')
  const [uri, setUri] = useState('')
  const [token, setToken] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordOtp, setPasswordOtp] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableOtp, setDisableOtp] = useState('')

  async function beginSetup() {
    const response = await fetch('/api/auth/mfa/setup', { method: 'POST' })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'تعذر بدء الإعداد')
    setSecret(result.secret)
    setUri(result.uri)
    setMessage('أضف المفتاح إلى تطبيق المصادقة ثم أدخل الرمز.')
  }

  async function verify() {
    const response = await fetch('/api/auth/mfa/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'رمز غير صالح')
    setRecoveryCodes(result.recoveryCodes)
    setMessage('تم تفعيل التحقق بخطوتين. احفظ رموز الاسترداد الآن، ثم سجّل الدخول من جديد.')
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) return setMessage('تأكيد كلمة المرور غير متطابق')
    const response = await fetch('/api/auth/password/change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, otp: passwordOtp }),
    })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'تعذر تغيير كلمة المرور')
    setMessage('تم تغيير كلمة المرور وإنهاء الجلسات الأخرى. سجّل الدخول مرة أخرى.')
  }

  async function disableMfa(e: FormEvent) {
    e.preventDefault()
    const response = await fetch('/api/auth/mfa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: disablePassword, otp: disableOtp }),
    })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'تعذر تعطيل التحقق بخطوتين')
    setMessage('تم تعطيل التحقق بخطوتين وإنهاء الجلسات الأخرى.')
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold mb-3">أمان الحساب</h1>
        <p className="text-muted-foreground">التحقق بخطوتين إلزامي لمالكي مساحات العمل والإدارة.</p>
      </div>

      <section className="rounded border p-5">
        <h2 className="text-xl font-bold mb-4">تغيير كلمة المرور</h2>
        <form onSubmit={changePassword} className="grid gap-3">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="كلمة المرور الحالية" className="rounded border p-3" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={12} placeholder="كلمة المرور الجديدة — 12 حرفاً على الأقل مع حرف ورقم" className="rounded border p-3" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={12} placeholder="تأكيد كلمة المرور الجديدة" className="rounded border p-3" />
          {user?.mfaEnabled && <input value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} required inputMode="numeric" maxLength={6} placeholder="رمز المصادقة الحالي" className="rounded border p-3" />}
          <button className="rounded bg-emerald-700 px-5 py-3 text-white">تغيير كلمة المرور</button>
        </form>
      </section>

      <section className="rounded border p-5">
        <h2 className="text-xl font-bold mb-4">التحقق بخطوتين</h2>
        {!secret && <button onClick={beginSetup} className="rounded bg-emerald-700 px-5 py-3 text-white">بدء إعداد تطبيق المصادقة</button>}
        {secret && !recoveryCodes.length && <div className="space-y-4"><p className="break-all rounded border p-3 font-mono" dir="ltr">{secret}</p><details><summary>رابط الإعداد المتقدم</summary><p className="break-all text-xs" dir="ltr">{uri}</p></details><input value={token} onChange={(e) => setToken(e.target.value)} inputMode="numeric" maxLength={6} placeholder="رمز من 6 أرقام" className="w-full rounded border p-3" /><button onClick={verify} className="rounded bg-emerald-700 px-5 py-3 text-white">تحقق وفعّل</button></div>}
        {recoveryCodes.length > 0 && <div className="mt-6 rounded border p-5"><h2 className="font-bold mb-3">رموز الاسترداد — تظهر مرة واحدة</h2><ul className="grid grid-cols-2 gap-2 font-mono" dir="ltr">{recoveryCodes.map((code) => <li key={code}>{code}</li>)}</ul></div>}
        {user?.mfaEnabled && !privileged && <form onSubmit={disableMfa} className="mt-6 grid gap-3 border-t pt-6">
          <h3 className="font-bold">تعطيل التحقق بخطوتين</h3>
          <input type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} required placeholder="كلمة المرور الحالية" className="rounded border p-3" />
          <input value={disableOtp} onChange={(e) => setDisableOtp(e.target.value)} required placeholder="رمز المصادقة أو الاسترداد" className="rounded border p-3" />
          <button className="rounded bg-rose-700 px-5 py-3 text-white">تعطيل MFA</button>
        </form>}
        {privileged && <p className="mt-4 text-sm text-muted-foreground">لا يمكن تعطيل MFA للحسابات الإدارية إلا عبر إعادة تعيين من مدير آخر.</p>}
      </section>

      {message && <p role="status">{message}</p>}
    </main>
  )
}
