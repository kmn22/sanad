'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const response = await fetch('/api/auth/password-reset/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setMessage(response.ok ? 'إذا كان الحساب موجوداً فسيصل رابط إعادة التعيين.' : 'خدمة البريد غير مهيأة حالياً.')
  }
  return <main className="mx-auto max-w-md px-6 py-20" dir="rtl"><h1 className="text-3xl font-bold mb-6">نسيت كلمة المرور</h1><form onSubmit={submit} className="space-y-4"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border p-3" placeholder="البريد الإلكتروني" /><button className="rounded bg-emerald-700 px-5 py-3 text-white">إرسال رابط آمن</button></form>{message && <p className="mt-5">{message}</p>}</main>
}
