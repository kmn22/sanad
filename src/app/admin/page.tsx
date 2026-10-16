'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

type Status = { emailConfigured: boolean; billingConfigured: boolean; backupEncryptionConfigured: boolean; mfaEnabled: boolean; overduePrivacyRequests: number; openIncidents: number; uptimeSeconds?: number; queuedJobs?: number; failedJobs?: number; lastBackupAt?: string | null }

export default function AdminPage() {
  const { data: session } = useSession()
  const isPlatformAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin'
  const [status, setStatus] = useState<Status | null>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [workspaces, setWorkspaces] = useState<any[] | null>(null)
  const [jobs, setJobs] = useState<any | null>(null)
  const [flags, setFlags] = useState<Record<string, boolean> | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')
  const [message, setMessage] = useState('')
  const [lastInviteUrl, setLastInviteUrl] = useState('')

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const res = await fetch('/api/admin/audit-logs')
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.items || [])
      }
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/system/status'),
      fetch('/api/admin/privacy/requests'),
      fetch('/api/admin/users'),
      fetch('/api/admin/jobs'),
      fetch('/api/admin/audit-logs')
    ]).then(async ([a, b, c, e, f]) => {
      if (a.ok) setStatus(await a.json())
      if (b.ok) setRequests(await b.json())
      if (c.ok) setUsers(await c.json())
      if (e.ok) setJobs(await e.json())
      if (f.ok) {
        const logData = await f.json()
        setAuditLogs(logData.items || [])
      }
    })
    fetch('/api/admin/feature-flags').then(async (response) => {
      if (response.ok) setFlags((await response.json()).flags)
    })
  }, [])

  useEffect(() => {
    if (!isPlatformAdmin) return
    fetch('/api/admin/platform/workspaces').then(async (res) => {
      if (res.ok) setWorkspaces(await res.json())
    })
  }, [isPlatformAdmin])

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

  async function handleExportData() {
    setExporting(true)
    setMessage('')
    try {
      const res = await fetch('/api/privacy/export', { method: 'POST' })
      if (!res.ok) throw new Error('فشل تصدير البيانات')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sanad-data-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setMessage('تم تنزيل ملف تصدير البيانات بنجاح.')
    } catch (err: any) {
      setMessage(err.message || 'تعذر إتمام تصدير البيانات')
    } finally {
      setExporting(false)
    }
  }

  async function updatePrivacyRequest(id: string, payload: Record<string, any>) {
    try {
      const res = await fetch(`/api/admin/privacy/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (res.ok) {
        setRequests((current) => current.map((r) => (r.id === id ? { ...r, ...result } : r)))
        setMessage('تم تحديث طلب الخصوصية بنجاح.')
      } else {
        setMessage(result.error || 'تعذر تحديث طلب الخصوصية')
      }
    } catch {
      setMessage('حدث خطأ أثناء الاتصال بالخادم')
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="text-emerald-700 hover:underline font-medium">العودة إلى مساحة العمل</Link>
            <span>/</span>
            <span>لوحة الإدارة</span>
          </div>
          <h1 className="text-3xl font-bold">إدارة سند والامتثال</h1>
          <p className="text-sm text-muted-foreground mt-1">الرقابة الإدارية، طلبات نظام حماية البيانات الشخصية، وسجلات التدقيق.</p>
        </div>
        <button
          onClick={handleExportData}
          disabled={exporting}
          className="rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium transition-colors"
        >
          {exporting ? 'جارٍ التصدير...' : 'تصدير بيانات الامتثال (PDPPL)'}
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          {message}
        </div>
      )}

      {!status && <p className="text-sm text-muted-foreground">يتطلب الوصول دور مالك/مدير مع تفعيل التحقق بخطوتين.</p>}
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

        {flags && <section className="rounded-xl border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">مفاتيح الميزات</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(flags).map(([key, enabled]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border p-3">
                <span dir="ltr" className="text-sm font-mono">{key}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={async (event) => {
                    const response = await fetch('/api/admin/feature-flags', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, enabled: event.target.checked }) })
                    if (response.ok) setFlags((current) => current && { ...current, [key]: event.target.checked })
                    else setMessage('تعذر تحديث المفتاح')
                  }}
                />
              </label>
            ))}
          </div>
        </section>}

        <section className="rounded-xl border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">اختبار البريد</h2>
          <button onClick={testEmail} disabled={!status.emailConfigured} className="rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm text-white disabled:opacity-50">
            إرسال رسالة اختبار إلى بريدي
          </button>
        </section>

        <section className="rounded-xl border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">دعوة مستخدم جديد</h2>
          <form onSubmit={invite} className="flex flex-wrap gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-lg border p-2.5 text-sm flex-1 min-w-[200px]" placeholder="البريد الإلكتروني" />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border p-2.5 text-sm">
              <option value="staff">موظف</option>
              <option value="lawyer">محامٍ</option>
              <option value="student">متدرب</option>
              <option value="auditor">مدقق</option>
            </select>
            <button className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-5 text-sm text-white font-medium">إنشاء الدعوة</button>
          </form>
          {lastInviteUrl && (
            <div className="mt-3 rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-left" dir="ltr">
              <code className="text-xs break-all">{lastInviteUrl}</code>
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">المستخدمون والجلسات</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong>{user.name || user.email}</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user.email} — {user.role} — MFA: {user.mfaEnabled ? 'مفعّل' : 'غير مفعّل'} {user.disabledAt ? '— (معطل)' : ''}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => updateUser(user.id, { revokeSessions: true })} className="rounded-lg border px-3 py-1.5 hover:bg-muted">إنهاء الجلسات</button>
                  <button onClick={() => updateUser(user.id, { mfaReset: true })} className="rounded-lg border px-3 py-1.5 hover:bg-muted">إعادة تعيين MFA</button>
                  <button onClick={() => updateUser(user.id, { disabled: !user.disabledAt })} className="rounded-lg border px-3 py-1.5 hover:bg-muted">{user.disabledAt ? 'تفعيل' : 'تعطيل'}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {workspaces && <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">مساحات العمل (المنصة)</h2>
          <div className="space-y-2">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <strong>{workspace.name}</strong>
                    <p className="text-sm text-muted-foreground">
                      {workspace.type} — {workspace.status} — {workspace.plan?.name || 'بدون باقة'} ({workspace.subscriptionStatus || '—'}) — المالك: {workspace.owner?.email || '—'}
                    </p>
                    {workspace.usage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        مقاعد {workspace.usage.seats}/{workspace.plan?.seatLimit ?? '—'} • تخزين {Math.round((workspace.usage.storage?.usedBytes || 0) / 1048576)}MB • ذكاء {workspace.usage.aiRequests?.used ?? 0}/{workspace.usage.aiRequests?.limit ?? '∞'} • رفعات {workspace.usage.portalUploads?.used ?? 0}/{workspace.usage.portalUploads?.limit ?? '∞'}
                      </p>
                    )}
                    {workspace.suspensionReason && <p className="text-xs text-rose-600 mt-1">سبب الإيقاف: {workspace.suspensionReason}</p>}
                  </div>
                  <div className="flex gap-2 text-xs">
                    {workspace.status === 'active' ? <>
                      <button onClick={() => updateWorkspace(workspace.id, 'suspend')} className="rounded-lg border px-3 py-1.5 hover:bg-muted">إيقاف</button>
                      <button onClick={() => updateWorkspace(workspace.id, 'archive')} className="rounded-lg border px-3 py-1.5 hover:bg-muted">أرشفة</button>
                    </> : <button onClick={() => updateWorkspace(workspace.id, 'reactivate')} className="rounded-lg border px-3 py-1.5 hover:bg-muted">إعادة تفعيل</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>}

        {jobs && <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">قائمة المهام الخلفية</h2>
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            {['queued', 'processing', 'completed', 'failed'].map((key) => <Card key={key} title={key} value={String(jobs.counts?.[key] || 0)} />)}
          </div>
          {jobs.stuckProcessing > 0 && <p className="mb-3 text-sm text-rose-600 font-semibold">{jobs.stuckProcessing} مهمة عالقة في المعالجة — تحقق من السجلات.</p>}
          <div className="space-y-1 text-sm">
            {jobs.recent?.slice(0, 10).map((job: any) => (
              <div key={job.id} className="flex flex-wrap justify-between gap-2 rounded-lg border p-2 text-xs">
                <span>{job.type} — {job.status} ({job.attempts}/{job.maxAttempts})</span>
                <span className="text-muted-foreground">{job.lastError || new Date(job.updatedAt || job.createdAt).toLocaleString('ar-SA')}</span>
              </div>
            ))}
          </div>
        </section>}

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">طلبات أصحاب البيانات (PDPPL)</h2>
          {requests.length === 0 ? (
            <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
              لا توجد طلبات معلقة من أصحاب البيانات حالياً.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-xl border p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong className="text-sm font-semibold">{request.requestType}</strong>
                      <span className="text-xs text-muted-foreground mx-2">•</span>
                      <span className="text-xs font-mono text-muted-foreground">{request.requesterEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        request.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                          : request.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      }`}>
                        {request.status}
                      </span>
                      {request.identityVerified ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                          الهوية موثقة ✓
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          الهوية بانتظار التوثيق
                        </span>
                      )}
                    </div>
                  </div>

                  {request.details && (
                    <p className="text-xs bg-muted/40 p-2.5 rounded-lg text-muted-foreground leading-relaxed">
                      تفاصيل الطلب: {request.details}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t text-xs">
                    <span className="text-muted-foreground">
                      تاريخ الاستحقاق: {new Date(request.dueAt).toLocaleDateString('ar-SA')}
                    </span>
                    <div className="flex items-center gap-2">
                      {!request.identityVerified && (
                        <button
                          onClick={() => updatePrivacyRequest(request.id, { identityVerified: true, status: 'in_progress' })}
                          className="rounded-lg border border-blue-600/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2.5 py-1"
                        >
                          توثيق الهوية
                        </button>
                      )}
                      {request.status !== 'completed' && request.status !== 'rejected' && (
                        <>
                          <button
                            onClick={() => updatePrivacyRequest(request.id, { status: 'completed' })}
                            className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 font-medium"
                          >
                            إكمال الطلب
                          </button>
                          <button
                            onClick={() => {
                              const reason = window.prompt('سبب الرفض:')
                              if (reason) updatePrivacyRequest(request.id, { status: 'rejected', rejectionReason: reason })
                            }}
                            className="rounded-lg border border-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1"
                          >
                            رفض
                          </button>
                        </>
                      )}
                      {request.requestType === 'destruction' && request.identityVerified && request.status !== 'completed' && (
                        <button
                          onClick={() => {
                            if (window.confirm('تحذير: سيتم إتلاف بيانات المستخدم بالكامل وحذف سجلات الرضا والإشعارات نهائياً وفق نظام حماية البيانات الشخصية. هل أنت متأكد؟')) {
                              updatePrivacyRequest(request.id, { executeDestruction: true, status: 'completed' })
                            }
                          }}
                          className="rounded-lg bg-rose-700 hover:bg-rose-800 text-white px-2.5 py-1 font-medium"
                        >
                          تنفيذ الإتلاف النهائي
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">سجل التدقيق الإداري (Audit Logs)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">تسجيل غير قابل للتعديل لجميع العمليات الحساسة والتغييرات الإدارية.</p>
            </div>
            <button
              onClick={loadLogs}
              disabled={loadingLogs}
              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
            >
              {loadingLogs ? 'جارٍ التحديث...' : 'تحديث السجل'}
            </button>
          </div>
          {auditLogs.length === 0 ? (
            <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
              لا توجد سجلات تدقيق مسجلة حتى الآن.
            </div>
          ) : (
            <div className="space-y-1.5">
              {auditLogs.slice(0, 15).map((log) => (
                <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-primary">{log.action}</span>
                    {log.entityType && (
                      <span className="text-muted-foreground">
                        ({log.entityType}{log.entityId ? ` #${log.entityId.slice(-6)}` : ''})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {log.ipAddress && <span className="font-mono text-[11px]">{log.ipAddress}</span>}
                    <span>{new Date(log.createdAt).toLocaleString('ar-SA')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>}
    </main>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return <div className="rounded-xl border p-4"><p className="text-sm text-muted-foreground">{title}</p><p className="text-xl font-bold">{value}</p></div>
}
