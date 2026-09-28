'use client'

import { useState } from 'react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const token = new URLSearchParams(window.location.search).get('token')
    const response = await fetch('/api/auth/password-reset/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    const result = await response.json()
    setMessage(response.ok ? 'تم تغيير كلمة المرور. يمكنك تسجيل الدخول.' : result.error || 'تعذر تغيير كلمة المرور')
  }
  return <main className="mx-auto max-w-md px-6 py-20" dir="rtl"><h1 className="text-3xl font-bold mb-6">إعادة تعيين كلمة المرور</h1><form onSubmit={submit} className="space-y-4"><input type="password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded border p-3" placeholder="12 خانة مع حروف وأرقام" /><button className="rounded bg-emerald-700 px-5 py-3 text-white">حفظ كلمة المرور</button></form>{message && <p className="mt-5">{message}</p>}</main>
}
