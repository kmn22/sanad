'use client'

import { useState } from 'react'

export default function PrivacyRequestPage() {
  const [message, setMessage] = useState('')
  async function submit(formData: FormData) {
    setMessage('جاري الإرسال...')
    const response = await fetch('/api/privacy/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        requestType: formData.get('requestType'),
        details: formData.get('details'),
      }),
    })
    const result = await response.json()
    setMessage(response.ok ? `تم تسجيل الطلب: ${result.request.id}` : result.error || 'تعذر تسجيل الطلب')
  }
  return (
    <main className="mx-auto max-w-2xl px-6 py-12" dir="rtl">
      <h1 className="text-3xl font-bold mb-3">طلب حقوق صاحب البيانات</h1>
      <p className="mb-8 text-muted-foreground">نتحقق من الهوية قبل الإفصاح أو التصحيح أو الإتلاف. المدة النظامية المعتادة 30 يوماً.</p>
      <form action={submit} className="space-y-5">
        <label className="block">البريد الإلكتروني<input name="email" type="email" required className="mt-2 w-full rounded border p-3" /></label>
        <label className="block">نوع الطلب<select name="requestType" required className="mt-2 w-full rounded border p-3"><option value="access">الوصول</option><option value="copy">نسخة مقروءة</option><option value="correction">التصحيح</option><option value="destruction">الإتلاف</option><option value="consent_withdrawal">سحب الموافقة</option><option value="complaint">شكوى خصوصية</option></select></label>
        <label className="block">التفاصيل<textarea name="details" maxLength={4000} className="mt-2 min-h-32 w-full rounded border p-3" /></label>
        <button className="rounded bg-emerald-700 px-5 py-3 text-white">إرسال الطلب</button>
      </form>
      {message && <p className="mt-6" role="status">{message}</p>}
    </main>
  )
}
