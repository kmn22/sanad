'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

export default function AcceptPrivacyPage() {
  const [accepted, setAccepted] = useState(false)
  const [message, setMessage] = useState('')
  async function submit() {
    const response = await fetch('/api/privacy/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: '2026-09-28', accept: accepted }) })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'تعذر حفظ الإقرار')
    setMessage('تم حفظ الإقرار. يرجى تسجيل الدخول مجدداً لتحديث الجلسة.')
    await signOut({ callbackUrl: '/login?privacyAccepted=1' })
  }
  return (
    <main className="mx-auto max-w-2xl px-6 py-12" dir="rtl">
      <h1 className="text-3xl font-bold mb-4">تحديث إشعار الخصوصية</h1>
      <p className="mb-6">يلزم الإقرار بالإصدار الحالي قبل متابعة استخدام المنصة. اقرأ <Link href="/privacy" className="underline">سياسة الخصوصية</Link> و<Link href="/terms" className="underline">شروط الاستخدام</Link>.</p>
      <label className="flex gap-3"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /><span>قرأت إشعار الخصوصية إصدار 2026-09-28 وأقر بالعلم بمحتواه. أفهم أن الموافقة الاختيارية، عند طلبها، تكون منفصلة.</span></label>
      <button onClick={submit} disabled={!accepted} className="mt-6 rounded bg-emerald-700 px-5 py-3 text-white disabled:opacity-50">حفظ ومتابعة</button>
      {message && <p className="mt-5" role="status">{message}</p>}
    </main>
  )
}
