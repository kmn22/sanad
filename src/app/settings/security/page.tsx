'use client'

import { useState } from 'react'

export default function SecuritySettingsPage() {
  const [secret, setSecret] = useState('')
  const [uri, setUri] = useState('')
  const [token, setToken] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [message, setMessage] = useState('')

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
    setMessage('تم تفعيل التحقق بخطوتين. احفظ رموز الاسترداد الآن.')
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12" dir="rtl">
      <h1 className="text-3xl font-bold mb-3">أمان الحساب</h1>
      <p className="mb-8 text-muted-foreground">التحقق بخطوتين إلزامي لمالكي مساحات العمل والإدارة.</p>
      {!secret && <button onClick={beginSetup} className="rounded bg-emerald-700 px-5 py-3 text-white">بدء إعداد تطبيق المصادقة</button>}
      {secret && !recoveryCodes.length && <div className="space-y-4"><p className="break-all rounded border p-3 font-mono">{secret}</p><details><summary>رابط الإعداد المتقدم</summary><p className="break-all text-xs">{uri}</p></details><input value={token} onChange={(e) => setToken(e.target.value)} inputMode="numeric" maxLength={6} placeholder="رمز من 6 أرقام" className="w-full rounded border p-3" /><button onClick={verify} className="rounded bg-emerald-700 px-5 py-3 text-white">تحقق وفعّل</button></div>}
      {recoveryCodes.length > 0 && <div className="mt-6 rounded border p-5"><h2 className="font-bold mb-3">رموز الاسترداد — تظهر مرة واحدة</h2><ul className="grid grid-cols-2 gap-2 font-mono">{recoveryCodes.map((code) => <li key={code}>{code}</li>)}</ul></div>}
      {message && <p className="mt-6" role="status">{message}</p>}
    </main>
  )
}
