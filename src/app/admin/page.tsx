'use client'

import { useEffect, useState } from 'react'

type Status = { emailConfigured: boolean; billingConfigured: boolean; backupEncryptionConfigured: boolean; mfaEnabled: boolean; overduePrivacyRequests: number; openIncidents: number }

export default function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')
  const [message, setMessage] = useState('')
  useEffect(() => {
    Promise.all([fetch('/api/admin/system/status'), fetch('/api/admin/privacy/requests')]).then(async ([a, b]) => {
      if (a.ok) setStatus(await a.json())
      if (b.ok) setRequests(await b.json())
    })
  }, [])
  async function invite(e: React.FormEvent) {
    e.preventDefault()
    const response = await fetch('/api/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
    const result = await response.json()
    setMessage(response.ok ? 'تم إرسال الدعوة بالبريد.' : result.error || 'تعذر إرسال الدعوة')
  }
  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">إدارة سند والامتثال</h1>
      {!status && <p>يتطلب الوصول دور مالك/مدير مع تفعيل التحقق بخطوتين.</p>}
      {status && <><div className="grid gap-4 md:grid-cols-3 mb-10"><Card title="البريد" value={status.emailConfigured ? 'مهيأ' : 'غير مهيأ'} /><Card title="طلبات متأخرة" value={String(status.overduePrivacyRequests)} /><Card title="حوادث مفتوحة" value={String(status.openIncidents)} /><Card title="النسخ المشفر" value={status.backupEncryptionConfigured ? 'مهيأ' : 'غير مهيأ'} /><Card title="الدفع" value={status.billingConfigured ? 'مهيأ' : 'معطل'} /><Card title="MFA" value={status.mfaEnabled ? 'مفعّل' : 'مطلوب'} /></div><section className="rounded border p-5 mb-8"><h2 className="text-xl font-bold mb-4">دعوة مستخدم</h2><form onSubmit={invite} className="flex flex-wrap gap-3"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded border p-3" placeholder="البريد" /><select value={role} onChange={(e) => setRole(e.target.value)} className="rounded border p-3"><option value="staff">موظف</option><option value="lawyer">محامٍ</option><option value="student">متدرب</option><option value="auditor">مدقق</option></select><button className="rounded bg-emerald-700 px-5 text-white">إرسال الدعوة</button></form>{message && <p className="mt-3">{message}</p>}</section><section><h2 className="text-xl font-bold mb-4">طلبات أصحاب البيانات</h2><div className="space-y-2">{requests.map((request) => <div key={request.id} className="rounded border p-4"><strong>{request.requestType}</strong> — {request.requesterEmail} — {request.status} — الاستحقاق {new Date(request.dueAt).toLocaleDateString('ar-SA')}</div>)}</div></section></>}
    </main>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return <div className="rounded border p-4"><p className="text-sm text-muted-foreground">{title}</p><p className="text-xl font-bold">{value}</p></div>
}
