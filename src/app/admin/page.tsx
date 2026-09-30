'use client'

import { useEffect, useState } from 'react'

type Status = { emailConfigured: boolean; billingConfigured: boolean; backupEncryptionConfigured: boolean; mfaEnabled: boolean; overduePrivacyRequests: number; openIncidents: number }

export default function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')
  const [message, setMessage] = useState('')
  const [lastInviteUrl, setLastInviteUrl] = useState('')
  useEffect(() => {
    Promise.all([fetch('/api/admin/system/status'), fetch('/api/admin/privacy/requests'), fetch('/api/admin/users')]).then(async ([a, b, c]) => {
      if (a.ok) setStatus(await a.json())
      if (b.ok) setRequests(await b.json())
      if (c.ok) setUsers(await c.json())
    })
  }, [])
  async function invite(e: React.FormEvent) {
    e.preventDefault()
    const response = await fetch('/api/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
    const result = await response.json()
    if (response.ok) {
      setLastInviteUrl(result.url || '')
      setMessage(result.delivery === 'email' ? 'تم إرسال الدعوة بالبريد وإنشاء رابط احتياطي.' : 'تم إنشاء رابط الدعوة. انسخه وأرسله للعضو عبر قناة موثوقة.')
    } else {
      setLastInviteUrl('')
      setMessage(result.error || 'تعذر إنشاء الدعوة')
    }
  }
  async function testEmail() {
    const response = await fetch('/api/admin/system/email-test', { method: 'POST' })
    const result = await response.json()
    setMessage(response.ok ? 'تم إرسال رسالة الاختبار إلى بريدك.' : result.error || 'تعذر إرسال رسالة الاختبار')
  }
  async function updateUser(id: string, data: Record<string, boolean>) {
    const response = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const result = await response.json()
    if (response.ok) setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...result } : user)))
    setMessage(response.ok ? 'تم تحديث المستخدم.' : result.error || 'تعذر تحديث المستخدم')
  }
  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">إدارة سند والامتثال</h1>
      {!status && <p>يتطلب الوصول دور مالك/مدير مع تفعيل التحقق بخطوتين.</p>}
      {status && <>
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <Card title="البريد" value={status.emailConfigured ? 'مهيأ' : 'غير مهيأ'} />
          <Card title="طلبات متأخرة" value={String(status.overduePrivacyRequests)} />
          <Card title="حوادث مفتوحة" value={String(status.openIncidents)} />
          <Card title="النسخ المشفر" value={status.backupEncryptionConfigured ? 'مهيأ' : 'غير مهيأ'} />
          <Card title="الدفع" value={status.billingConfigured ? 'مهيأ' : 'معطل'} />
          <Card title="MFA" value={status.mfaEnabled ? 'مفعّل' : 'مطلوب'} />
        </div>
        <section className="rounded border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">اختبار البريد</h2>
          <button onClick={testEmail} disabled={!status.emailConfigured} className="rounded bg-slate-800 px-5 py-3 text-white disabled:opacity-50">إرسال رسالة اختبار إلى بريدي</button>
        </section>
        <section className="rounded border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">دعوة مستخدم</h2>
          <form onSubmit={invite} className="flex flex-wrap gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded border p-3" placeholder="البريد" />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded border p-3"><option value="staff">موظف</option><option value="lawyer">محامٍ</option><option value="student">متدرب</option><option value="auditor">مدقق</option></select>
            <button className="rounded bg-emerald-700 px-5 text-white">إنشاء الدعوة</button>
          </form>
          {message && <p className="mt-3">{message}</p>}
          {lastInviteUrl && <div className="mt-3 rounded bg-slate-100 dark:bg-slate-800 p-3 text-left" dir="ltr"><code>{lastInviteUrl}</code></div>}
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">المستخدمون والجلسات</h2>
          <div className="space-y-2">
            {users.map((user) => <div key={user.id} className="rounded border p-4 flex flex-wrap items-center justify-between gap-3">
              <div><strong>{user.name || user.email}</strong><p className="text-sm text-muted-foreground">{user.email} — {user.role} — MFA: {user.mfaEnabled ? 'مفعّل' : 'غير مفعّل'} {user.disabledAt ? '— معطل' : ''}</p></div>
              <div className="flex gap-2">
                <button onClick={() => updateUser(user.id, { revokeSessions: true })} className="rounded border px-3 py-2">إنهاء الجلسات</button>
                <button onClick={() => updateUser(user.id, { mfaReset: true })} className="rounded border px-3 py-2">إعادة تعيين MFA</button>
                <button onClick={() => updateUser(user.id, { disabled: !user.disabledAt })} className="rounded border px-3 py-2">{user.disabledAt ? 'تفعيل' : 'تعطيل'}</button>
              </div>
            </div>)}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4">طلبات أصحاب البيانات</h2>
          <div className="space-y-2">{requests.map((request) => <div key={request.id} className="rounded border p-4"><strong>{request.requestType}</strong> — {request.requesterEmail} — {request.status} — الاستحقاق {new Date(request.dueAt).toLocaleDateString('ar-SA')}</div>)}</div>
        </section>
      </>}
    </main>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return <div className="rounded border p-4"><p className="text-sm text-muted-foreground">{title}</p><p className="text-xl font-bold">{value}</p></div>
}
