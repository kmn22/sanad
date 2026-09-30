'use client'

import { useEffect, useState } from 'react'

type WorkflowData = { cases: any[]; events: any[]; requests: any[]; tasks: any[] }

export default function WorkflowPage() {
  const [data, setData] = useState<WorkflowData | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedCase, setSelectedCase] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [assignmentRole, setAssignmentRole] = useState('assignee')
  const [selectedClient, setSelectedClient] = useState('')
  const [portalCase, setPortalCase] = useState('')
  const [portalUrl, setPortalUrl] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const [workflow, team, clientResponse] = await Promise.all([fetch('/api/workflow'), fetch('/api/team'), fetch('/api/clients')])
    if (workflow.ok) setData(await workflow.json())
    if (team.ok) setMembers(await team.json())
    if (clientResponse.ok) setClients(await clientResponse.json())
  }
  useEffect(() => { load() }, [])

  async function assign() {
    const response = await fetch('/api/workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'assign', caseId: selectedCase, userId: selectedUser, role: assignmentRole }) })
    const result = await response.json().catch(() => ({}))
    setMessage(response.ok ? 'تم تحديث التعيين.' : result.error || 'تعذر التعيين')
    if (response.ok) load()
  }

  async function changeStage(caseId: string, stage: string) {
    const response = await fetch('/api/workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'stage', caseId, stage }) })
    const result = await response.json().catch(() => ({}))
    setMessage(response.ok ? 'تم تحديث المرحلة.' : result.error || 'تعذر تحديث المرحلة')
    if (response.ok) load()
  }

  async function createPortalLink() {
    const response = await fetch('/api/portal-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: selectedClient, caseId: portalCase || null, sendEmail: true }) })
    const result = await response.json().catch(() => ({}))
    setPortalUrl(response.ok ? result.url : '')
    setMessage(response.ok ? (result.delivery === 'email' ? 'تم إرسال رابط البوابة بالبريد.' : 'تم إنشاء رابط البوابة.') : result.error || 'تعذر إنشاء الرابط')
  }

  async function updateRequest(id: string, status: string) {
    const response = await fetch(`/api/portal-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setMessage(response.ok ? 'تم تحديث الطلب.' : 'تعذر تحديث الطلب')
    if (response.ok) load()
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 space-y-8" dir="rtl">
      <header><h1 className="text-3xl font-bold">سير العمل والتعاون</h1><p className="text-muted-foreground">تعيين القضايا، تتبع المهام، وإدارة طلبات وملفات العملاء.</p></header>
      {message && <p className="rounded border bg-muted p-3">{message}</p>}
      {!data ? <p>جاري تحميل سير العمل...</p> : <>
        <section className="rounded-xl border p-5 space-y-4">
          <h2 className="text-xl font-bold">تعيين قضية لعضو الفريق</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <select value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)} className="rounded border bg-background p-3"><option value="">اختر القضية</option>{data.cases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="rounded border bg-background p-3"><option value="">اختر العضو</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name || member.email} — {member.role}</option>)}</select>
            <select value={assignmentRole} onChange={(e) => setAssignmentRole(e.target.value)} className="rounded border bg-background p-3"><option value="lead">مسؤول رئيسي</option><option value="assignee">منفذ</option><option value="reviewer">مراجع</option><option value="observer">متابع</option></select>
            <button onClick={assign} disabled={!selectedCase || !selectedUser} className="rounded bg-emerald-700 px-5 text-white disabled:opacity-50">تعيين</button>
          </div>
        </section>

        <section className="rounded-xl border p-5 space-y-4">
          <h2 className="text-xl font-bold">رابط بوابة عميل</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="rounded border bg-background p-3"><option value="">اختر العميل</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
            <select value={portalCase} onChange={(e) => setPortalCase(e.target.value)} className="rounded border bg-background p-3"><option value="">بدون قضية محددة</option>{data.cases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
            <button onClick={createPortalLink} disabled={!selectedClient} className="rounded bg-slate-800 px-5 text-white disabled:opacity-50">إنشاء رابط آمن</button>
          </div>
          {portalUrl && <div className="rounded bg-muted p-3 text-left" dir="ltr"><code>{portalUrl}</code></div>}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold mb-4">القضايا والفريق</h2>
            <div className="space-y-3">{data.cases.map((item) => <div key={item.id} className="rounded border p-4">
              <div className="flex flex-wrap justify-between gap-3"><strong>{item.title}</strong><span className="text-sm">{item.stage}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">العميل: {item.client?.name || item.clientName}</p>
              <p className="mt-1 text-sm">الفريق: {item.assignments.map((a: any) => a.user.name || a.user.email).join('، ') || 'غير معين'}</p>
              <div className="mt-3 flex flex-wrap gap-2">{['drafting', 'client_review', 'filed', 'closed'].map((stage) => <button key={stage} onClick={() => changeStage(item.id, stage)} className={`rounded border px-3 py-1 text-xs ${item.stage === stage ? 'bg-primary text-white' : ''}`}>{stage}</button>)}</div>
            </div>)}</div>
          </div>
          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold mb-4">طلبات العملاء</h2>
            <div className="space-y-3">{data.requests.map((request) => <div key={request.id} className="rounded border p-4">
              <div className="flex justify-between gap-3"><strong>{request.title}</strong><span>{request.status}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{request.client.name} — {request.case?.title || 'طلب عام'}</p>
              <p className="mt-2 text-sm">{request.message}</p>
              <div className="mt-3 flex gap-2"><button onClick={() => updateRequest(request.id, 'answered')} className="rounded border px-3 py-1 text-xs">تم الرد</button><button onClick={() => updateRequest(request.id, 'closed')} className="rounded border px-3 py-1 text-xs">إغلاق</button></div>
            </div>)}{!data.requests.length && <p className="text-sm text-muted-foreground">لا توجد طلبات عملاء.</p>}</div>
          </div>
        </section>

        <section className="rounded-xl border p-5">
          <h2 className="text-xl font-bold mb-4">سجل سير العمل</h2>
          <div className="space-y-2">{data.events.map((event) => <div key={event.id} className="rounded border p-3 text-sm"><strong>{event.action}</strong> — {event.actor?.name || 'النظام'} — {new Date(event.createdAt).toLocaleString('ar-SA')}</div>)}</div>
        </section>
      </>}
    </main>
  )
}
