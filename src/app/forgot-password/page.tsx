'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [devResetUrl, setDevResetUrl] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const response = await fetch('/api/auth/password-reset/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const data = await response.json().catch(() => ({}))
    setDevResetUrl(data.devResetUrl || '')
    setMessage(response.ok ? (data.message || 'إذا كان الحساب موجوداً فسيصل رابط إعادة التعيين.') : data.error || 'تعذر إرسال الطلب.')
  }
  return <main className="mx-auto min-h-screen max-w-md px-6 py-20" dir="rtl"><h1 className="mb-6 text-3xl font-bold">نسيت كلمة المرور</h1><form onSubmit={submit} className="space-y-4"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border p-3" placeholder="البريد الإلكتروني" /><button className="rounded bg-emerald-700 px-5 py-3 text-white">إرسال رابط آمن</button></form>{message && <p className="mt-5" role="status">{message}</p>}{devResetUrl && <a href={devResetUrl} className="mt-3 block break-all text-sm text-amber-700 underline">فتح رابط التجربة</a>}</main>
}
