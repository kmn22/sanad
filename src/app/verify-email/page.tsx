'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [message, setMessage] = useState('جاري التحقق...')
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) return setMessage('رابط التحقق غير صالح')
    fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async (response) => ({ ok: response.ok, body: await response.json() }))
      .then(({ ok, body }) => setMessage(ok ? 'تم تأكيد البريد الإلكتروني بنجاح.' : body.error || 'تعذر التحقق'))
      .catch(() => setMessage('تعذر التحقق'))
  }, [])
  return <main className="mx-auto max-w-xl px-6 py-20 text-center" dir="rtl"><h1 className="text-3xl font-bold mb-6">تأكيد البريد الإلكتروني</h1><p>{message}</p><Link href="/login" className="mt-8 inline-block underline">تسجيل الدخول</Link></main>
}
