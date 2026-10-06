'use client'

import { useEffect, useState } from 'react'

type Status = { emailConfigured: boolean; billingConfigured: boolean; backupEncryptionConfigured: boolean; mfaEnabled: boolean; overduePrivacyRequests: number; openIncidents: number; uptimeSeconds?: number; queuedJobs?: number; failedJobs?: number; lastBackupAt?: string | null }

export default function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [workspaces, setWorkspaces] = useState<any[] | null>(null)
  const [jobs, setJobs] = useState<any | null>(null)
  const [flags, setFlags] = useState<Record<string, boolean> | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')
  const [message, setMessage] = useState('')
  const [lastInviteUrl, setLastInviteUrl] = useState('')
  useEffect(() => {
    Promise.all([fetch('/api/admin/system/status'), fetch('/api/admin/privacy/requests'), fetch('/api/admin/users'), fetch('/api/admin/platform/workspaces'), fetch('/api/admin/jobs')]).then(async ([a, b, c, d, e]) => {
      if (a.ok) setStatus(await a.json())
      if (b.ok) setRequests(await b.json())
      if (c.ok) setUsers(await c.json())
      if (d.ok) setWorkspaces(await d.json())
      if (e.ok) setJobs(await e.json())
    })
    fetch('/api/admin/feature-flags').then(async (response) => { if (response.ok) setFlags((await response.json()).flags) })
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
  async function updateWorkspace(id: string, action: string) {
    const reason = action === 'reactivate' ? '' : (window.prompt('سبب الإجراء (يسجل في سجل التدقيق):') || '')
    if (action !== 'reactivate' && reason.trim().length < 3) return setMessage('يجب إدخال سبب واضح.')
    const response = await fetch(`/api/admin/platform/workspaces/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, reason }) })
    const result = await response.json()
    if (response.ok) setWorkspaces((current) => current && current.map((workspace) => (workspace.id === id ? { ...workspace, status: result.status } : workspace)))
    setMessage(response.ok ? 'تم تحديث مساحة العمل وإنهاء جلسات أعضائها.' : result.error || 'تعذر تحديث مساحة العمل')
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
          <Card title="مدة التشغيل" value={`${Math.floor((status.uptimeSeconds || 0) / 3600)}س ${Math.floor(((status.uptimeSeconds || 0) % 3600) / 60)}د`} />
          <Card title="مهام فاشلة" value={String(status.failedJobs ?? 0)} />
          <Card title="آخر نسخة احتياطية" value={status.lastBackupAt ? new Date(status.lastBackupAt).toLocaleString('ar-SA') : 'لا يوجد'} />
        </div>
        {flags && <section className="rounded border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">مفاتيح الميزات</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(flags).map(([key, enabled]) => <label key={key} className="flex items-center justify-between rounded border p-3"><span dir="ltr">{key}</span><input type="checkbox" checked={enabled} onChange={async (event) => { const response = await fetch('/api/admin/feature-flags', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, enabled: event.target.checked }) }); if (response.ok) setFlags((current) => current && { ...current, [key]: event.target.checked }); else setMessage('تعذر تحديث المفتاح') }} /></label>)}
          </div>
        </section>}
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
        {workspaces && <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">مساحات العمل (المنصة)</h2>
          <div className="space-y-2">
            {workspaces.map((workspace) => <div key={workspace.id} className="rounded border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><strong>{workspace.name}</strong><p className="text-sm text-muted-foreground">{workspace.type} — {workspace.status} — {workspace.plan?.name || 'بدون باقة'} ({workspace.subscriptionStatus || '—'}) — المالك: {workspace.owner?.email || '—'}</p>
                  {workspace.usage && <p className="text-xs text-muted-foreground mt-1">مقاعد {workspace.usage.seats}/{workspace.plan?.seatLimit ?? '—'} • تخزين {Math.round((workspace.usage.storage?.usedBytes || 0) / 1048576)}MB • ذكاء {workspace.usage.aiRequests?.used ?? 0}/{workspace.usage.aiRequests?.limit ?? '∞'} • رفعات {workspace.usage.portalUploads?.used ?? 0}/{workspace.usage.portalUploads?.limit ?? '∞'}</p>}
                  {workspace.suspensionReason && <p className="text-xs text-rose-600 mt-1">سبب: {workspace.suspensionReason}</p>}
                </div>
                <div className="flex gap-2">
                  {workspace.status === 'active' ? <>
                    <button onClick={() => updateWorkspace(workspace.id, 'suspend')} className="rounded border px-3 py-2">إيقاف</button>
                    <button onClick={() => updateWorkspace(workspace.id, 'archive')} className="rounded border px-3 py-2">أرشفة</button>
                  </> : <button onClick={() => updateWorkspace(workspace.id, 'reactivate')} className="rounded border px-3 py-2">إعادة تفعيل</button>}
                </div>
              </div>
            </div>)}
          </div>
        </section>}
        {jobs && <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">قائمة المهام الخلفية</h2>
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            {['queued', 'processing', 'completed', 'failed'].map((key) => <Card key={key} title={key} value={String(jobs.counts?.[key] || 0)} />)}
          </div>
          {jobs.stuckProcessing > 0 && <p className="mb-3 text-sm text-rose-600">{jobs.stuckProcessing} مهمة عالقة في المعالجة — تحقق من السجلات.</p>}
          <div className="space-y-1 text-sm">{jobs.recent?.slice(0, 10).map((job: any) => <div key={job.id} className="flex flex-wrap justify-between gap-2 rounded border p-2"><span>{job.type} — {job.status} ({job.attempts}/{job.maxAttempts})</span><span className="text-muted-foreground">{job.lastError || new Date(job.updatedAt || job.createdAt).toLocaleString('ar-SA')}</span></div>)}</div>
        </section>}
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
