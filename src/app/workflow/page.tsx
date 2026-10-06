'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, BriefcaseBusiness, CalendarClock, CheckCircle2, CircleUserRound, Clock3, FileInput, Gavel, Loader2, MessageSquareText, RefreshCw, Send, ShieldCheck, UserRoundCheck, UsersRound, XCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PortalPageHeader, StatTile } from '@/components/portal/PortalShell'

type Member = { id: string; name: string | null; email: string; role: string }
type Client = { id: string; name: string }
type Assignment = { role: string; user: Member }
type WorkflowCase = { id: string; title: string; clientName: string; stage: string; priority: string; client?: Client | null; assignments: Assignment[] }
type PortalRequest = { id: string; title: string; message: string; status: string; priority: string; dueDate: string | null; client: Client; case?: { id: string; title: string } | null; assignedTo?: { id: string; name: string | null } | null }
type Task = { id: string; title: string; status: string; priority: string; dueDate: string | null; assignedTo?: { id: string; name: string | null } | null }
type WorkflowEvent = { id: string; action: string; createdAt: string; actor?: { id: string; name: string | null } | null }
type Approval = { id: string; title: string; status: string; decisionNote: string | null; createdAt: string; case?: { id: string; title: string } | null; document?: { id: string; title: string } | null; requestedBy: { id: string; name: string | null }; approver: { id: string; name: string | null } }
type WorkflowData = { cases: WorkflowCase[]; events: WorkflowEvent[]; requests: PortalRequest[]; tasks: Task[] }

const stages = [
  { value: 'intake', label: 'استقبال' },
  { value: 'drafting', label: 'إعداد' },
  { value: 'client_review', label: 'مراجعة العميل' },
  { value: 'pleading', label: 'مرافعات' },
  { value: 'filed', label: 'مقيدة' },
  { value: 'hearing', label: 'جلسات' },
  { value: 'appeal', label: 'اعتراض' },
  { value: 'enforcement', label: 'تنفيذ' },
  { value: 'closed', label: 'مغلقة' },
]

const fieldClass = 'h-10 w-full rounded-xl border border-border/70 bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

function SelectField({ value, onChange, children, label }: { value: string; onChange: (value: string) => void; children: React.ReactNode; label: string }) {
  return <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>{children}</select></label>
}

function EmptyState({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 text-center"><span className="mb-3 rounded-2xl bg-muted p-3"><Icon className="h-5 w-5 text-muted-foreground" /></span><p className="font-semibold">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{text}</p></div>
}

export default function WorkflowPage() {
  const { data: session } = useSession()
  const myUserId = (session?.user as { id?: string } | undefined)?.id || ''
  const [data, setData] = useState<WorkflowData | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [showMine, setShowMine] = useState(false)
  const [myRequests, setMyRequests] = useState<PortalRequest[]>([])
  const [assignment, setAssignment] = useState({ caseId: '', userId: '', role: 'assignee' })
  const [portal, setPortal] = useState({ clientId: '', caseId: '' })
  const [portalUrl, setPortalUrl] = useState('')
  const [request, setRequest] = useState({ title: '', message: '', dueDate: '', assignedToId: '' })
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [approvalForm, setApprovalForm] = useState({ caseId: '', approverId: '', title: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const responses = await Promise.all([fetch('/api/workflow'), fetch('/api/team'), fetch('/api/clients'), fetch('/api/portal-requests?mine=1')])
      if (responses.some((response) => !response.ok)) throw new Error('تعذر تحميل بيانات سير العمل')
      const [workflow, team, clientList, mine] = await Promise.all(responses.map((response) => response.json()))
      setData(workflow)
      setMembers(team)
      setClients(clientList)
      setMyRequests(mine)
      const approvalsResponse = await fetch('/api/approvals')
      if (approvalsResponse.ok) setApprovals(await approvalsResponse.json())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل سير العمل')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const displayedRequests = showMine ? myRequests : data?.requests || []
  const openRequests = data?.requests.filter((item) => item.status !== 'closed').length || 0
  const overdueRequests = data?.requests.filter((item) => item.status !== 'closed' && item.dueDate && new Date(item.dueDate) < new Date()).length || 0
  const unassignedCases = data?.cases.filter((item) => !item.assignments.length).length || 0
  const openTasks = data?.tasks.filter((item) => item.status !== 'done').length || 0
  const selectedClientCases = useMemo(() => data?.cases.filter((item) => item.client?.id === portal.clientId) || [], [data, portal.clientId])

  async function assignCase() {
    setBusy('assignment')
    const response = await fetch('/api/workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'assign', caseId: assignment.caseId, userId: assignment.userId, role: assignment.role }) })
    const result = await response.json().catch(() => ({}))
    setBusy('')
    if (!response.ok) return toast.error(result.error || 'تعذر تعيين القضية')
    toast.success('تم تعيين عضو الفريق على القضية')
    setAssignment({ caseId: '', userId: '', role: 'assignee' })
    load()
  }

  async function changeStage(caseId: string, stage: string) {
    setBusy(`stage:${caseId}`)
    const response = await fetch('/api/workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'stage', caseId, stage }) })
    setBusy('')
    if (!response.ok) return toast.error('تعذر تحديث مرحلة القضية')
    toast.success('تم تحديث مرحلة القضية')
    load()
  }

  async function createPortalLink() {
    setBusy('portal')
    const response = await fetch('/api/portal-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: portal.clientId, caseId: portal.caseId || null, sendEmail: true }) })
    const result = await response.json().catch(() => ({}))
    setBusy('')
    if (!response.ok) return toast.error(result.error || 'تعذر إنشاء رابط البوابة')
    setPortalUrl(result.url)
    toast.success(result.delivery === 'email' ? 'تم إرسال الرابط وإنشاء نسخة آمنة' : 'تم إنشاء رابط البوابة')
  }

  async function createClientRequest() {
    setBusy('request')
    const response = await fetch('/api/portal-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: portal.clientId, caseId: portal.caseId || null, assignedToId: request.assignedToId || null, title: request.title, message: request.message, dueDate: request.dueDate || null }) })
    const result = await response.json().catch(() => ({}))
    setBusy('')
    if (!response.ok) return toast.error(result.error || 'تعذر إرسال الطلب')
    toast.success('تم إرسال الطلب وربطه بسير العمل')
    setRequest({ title: '', message: '', dueDate: '', assignedToId: '' })
    load()
  }

  async function updateRequest(id: string, status: string) {
    setBusy(`request:${id}`)
    const response = await fetch(`/api/portal-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setBusy('')
    if (!response.ok) return toast.error('تعذر تحديث الطلب')
    toast.success(status === 'closed' ? 'تم إغلاق الطلب' : 'تم تحديث الطلب')
    load()
  }

  async function requestApproval() {
    setBusy('approval')
    const response = await fetch('/api/approvals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId: approvalForm.caseId, approverId: approvalForm.approverId, title: approvalForm.title }) })
    const result = await response.json().catch(() => ({}))
    setBusy('')
    if (!response.ok) return toast.error(result.error || 'تعذر إنشاء طلب الاعتماد')
    toast.success('تم إرسال طلب الاعتماد')
    setApprovalForm({ caseId: '', approverId: '', title: '' })
    load()
  }

  async function decideApproval(id: string, decision: 'approved' | 'rejected') {
    setBusy(`approval:${id}`)
    const response = await fetch(`/api/approvals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) })
    const result = await response.json().catch(() => ({}))
    setBusy('')
    if (!response.ok) return toast.error(result.error || 'تعذر تسجيل القرار')
    toast.success(decision === 'approved' ? 'تم الاعتماد' : 'تم الرفض')
    load()
  }

  if (loading && !data) return <div className="space-y-5"><div className="h-28 animate-pulse rounded-3xl bg-muted/50" /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-muted/40" />)}</div><div className="h-96 animate-pulse rounded-3xl bg-muted/30" /></div>
  if (error && !data) return <EmptyState icon={AlertCircle} title="تعذر فتح سير العمل" text={`${error}. تحقق من الاتصال ثم حاول مرة أخرى.`} />
  if (!data) return null

  return <div className="space-y-6" dir="rtl">
    <PortalPageHeader portal="lawyer" title="مركز سير العمل" subtitle="وزّع القضايا، اطلب مستندات العملاء، وتابع الالتزامات من مساحة تشغيل واحدة." actions={<Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`ms-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />تحديث</Button>} />

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="طلبات مفتوحة" value={openRequests} hint={`${overdueRequests} متأخرة`} icon={MessageSquareText} tone={overdueRequests ? 'bad' : 'default'} />
      <StatTile label="قضايا بلا مسؤول" value={unassignedCases} icon={BriefcaseBusiness} tone={unassignedCases ? 'warn' : 'good'} />
      <StatTile label="مهام جارية" value={openTasks} icon={Clock3} />
      <StatTile label="أعضاء الفريق" value={members.length} icon={UsersRound} />
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="border-border/60 bg-card/70 shadow-sm backdrop-blur-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserRoundCheck className="h-5 w-5 text-primary" />تعيين مسؤول على قضية</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
        <SelectField label="القضية" value={assignment.caseId} onChange={(caseId) => setAssignment((current) => ({ ...current, caseId }))}><option value="">اختر القضية</option>{data.cases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectField>
        <SelectField label="عضو الفريق" value={assignment.userId} onChange={(userId) => setAssignment((current) => ({ ...current, userId }))}><option value="">اختر العضو</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name || member.email} — {member.role}</option>)}</SelectField>
        <SelectField label="دور العضو" value={assignment.role} onChange={(role) => setAssignment((current) => ({ ...current, role }))}><option value="lead">مسؤول رئيسي</option><option value="assignee">منفذ</option><option value="reviewer">مراجع</option><option value="observer">متابع</option></SelectField>
        <div className="flex items-end"><Button className="w-full" onClick={assignCase} disabled={!assignment.caseId || !assignment.userId || busy === 'assignment'}>{busy === 'assignment' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundCheck className="ms-1 h-4 w-4" />}تأكيد التعيين</Button></div>
      </CardContent></Card>

      <Card className="border-border/60 bg-card/70 shadow-sm backdrop-blur-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileInput className="h-5 w-5 text-primary" />بوابة العميل</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><SelectField label="العميل" value={portal.clientId} onChange={(clientId) => { setPortal({ clientId, caseId: '' }); setPortalUrl('') }}><option value="">اختر العميل</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</SelectField><SelectField label="القضية" value={portal.caseId} onChange={(caseId) => setPortal((current) => ({ ...current, caseId }))}><option value="">ملف العميل العام</option>{selectedClientCases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectField></div>
        <Button variant="outline" className="w-full" onClick={createPortalLink} disabled={!portal.clientId || busy === 'portal'}>{busy === 'portal' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="ms-1 h-4 w-4" />}إنشاء رابط آمن</Button>
        {portalUrl && <button type="button" onClick={() => navigator.clipboard.writeText(portalUrl).then(() => toast.success('تم نسخ الرابط'))} className="w-full truncate rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-left text-xs text-emerald-700 dark:text-emerald-300" dir="ltr">{portalUrl}</button>}
      </CardContent></Card>
    </div>

    <Card className="overflow-hidden border-border/60 bg-card/70 shadow-sm backdrop-blur-sm"><CardHeader className="border-b border-border/60 bg-muted/20"><CardTitle className="flex items-center gap-2 text-base"><MessageSquareText className="h-5 w-5 text-primary" />طلب مستند أو معلومة من العميل</CardTitle><p className="text-xs text-muted-foreground">حدد العميل أعلاه. يجب أن يملك رابط بوابة نشطاً حتى يستلم الطلب ويرفع الرد.</p></CardHeader><CardContent className="grid gap-4 p-5 lg:grid-cols-4">
      <label className="space-y-1.5 lg:col-span-2"><span className="text-xs font-medium text-muted-foreground">عنوان الطلب</span><Input value={request.title} onChange={(event) => setRequest((current) => ({ ...current, title: event.target.value }))} placeholder="مثال: رفع صورة الهوية الوطنية" maxLength={160} /></label>
      <SelectField label="المسؤول الداخلي" value={request.assignedToId} onChange={(assignedToId) => setRequest((current) => ({ ...current, assignedToId }))}><option value="">بدون مسؤول</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name || member.email}</option>)}</SelectField>
      <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">تاريخ الاستحقاق</span><Input type="date" value={request.dueDate} onChange={(event) => setRequest((current) => ({ ...current, dueDate: event.target.value }))} /></label>
      <label className="space-y-1.5 lg:col-span-3"><span className="text-xs font-medium text-muted-foreground">تعليمات العميل</span><Textarea value={request.message} onChange={(event) => setRequest((current) => ({ ...current, message: event.target.value }))} placeholder="وضّح المطلوب والصيغة المقبولة وأي تعليمات مهمة" maxLength={4000} className="min-h-24" /></label>
      <div className="flex items-end"><Button className="w-full" onClick={createClientRequest} disabled={!portal.clientId || !request.title || !request.message || busy === 'request'}>{busy === 'request' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="ms-1 h-4 w-4" />}إرسال الطلب</Button></div>
    </CardContent></Card>

    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <Card className="border-border/60 bg-card/70 shadow-sm"><CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-base"><Gavel className="h-5 w-5 text-primary" />القضايا والفريق</CardTitle><Badge variant="outline">{data.cases.length} قضية</Badge></CardHeader><CardContent className="space-y-3">{data.cases.map((item) => <div key={item.id} className="rounded-2xl border border-border/60 bg-background/50 p-4 transition hover:border-primary/30 hover:shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.client?.name || item.clientName}</p></div><Badge variant={item.priority === 'urgent' ? 'destructive' : 'secondary'}>{item.priority}</Badge></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><CircleUserRound className="h-4 w-4" /><span>{item.assignments.map((assignmentItem) => assignmentItem.user.name || assignmentItem.user.email).join('، ') || 'لم يعيّن فريق بعد'}</span></div><div className="mt-4 flex flex-wrap gap-1.5">{stages.map((stage) => <button key={stage.value} onClick={() => changeStage(item.id, stage.value)} disabled={busy === `stage:${item.id}`} className={`rounded-full border px-3 py-1 text-[11px] transition ${item.stage === stage.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>{stage.label}</button>)}</div></div>)}{!data.cases.length && <EmptyState icon={BriefcaseBusiness} title="لا توجد قضايا" text="أنشئ أول قضية لتبدأ التوزيع والمتابعة." />}</CardContent></Card>

      <Card className="border-border/60 bg-card/70 shadow-sm"><CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-base"><MessageSquareText className="h-5 w-5 text-primary" />طلبات العملاء</CardTitle><Button size="sm" variant="ghost" onClick={() => setShowMine((value) => !value)}>{showMine ? 'كل الطلبات' : 'عملي فقط'}</Button></CardHeader><CardContent className="space-y-3">{displayedRequests.map((item) => { const overdue = Boolean(item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'closed'); return <div key={item.id} className={`rounded-2xl border p-4 ${overdue ? 'border-rose-500/30 bg-rose-500/5' : 'border-border/60 bg-background/50'}`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.client.name} • {item.case?.title || 'طلب عام'}</p></div><Badge variant={overdue ? 'destructive' : 'outline'}>{item.status}</Badge></div><p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.message}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className={`flex items-center gap-1 text-xs ${overdue ? 'text-rose-600' : 'text-muted-foreground'}`}><CalendarClock className="h-3.5 w-3.5" />{item.dueDate ? new Date(item.dueDate).toLocaleDateString('ar-SA') : 'بدون موعد'} • {item.assignedTo?.name || 'غير معين'}</span><span className="flex gap-1"><Button size="sm" variant="outline" onClick={() => updateRequest(item.id, 'answered')} disabled={busy === `request:${item.id}`}><CheckCircle2 className="ms-1 h-3.5 w-3.5" />تم الرد</Button><Button size="sm" variant="ghost" onClick={() => updateRequest(item.id, 'closed')} disabled={busy === `request:${item.id}`}>إغلاق</Button></span></div></div> })}{!displayedRequests.length && <EmptyState icon={MessageSquareText} title={showMine ? 'لا توجد طلبات معيّنة لك' : 'لا توجد طلبات عملاء'} text="ستظهر هنا الطلبات الجديدة والردود والمواعيد." />}</CardContent></Card>
    </div>

    <Card className="border-border/60 bg-card/70 shadow-sm backdrop-blur-sm"><CardHeader className="border-b border-border/60 bg-muted/20"><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-primary" />الاعتمادات</CardTitle><p className="text-xs text-muted-foreground">اطلب اعتماد مستند أو قرار على قضية من عضو آخر، وتابع القرارات الواردة إليك.</p></CardHeader><CardContent className="space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">عنوان الطلب</span><Input value={approvalForm.title} onChange={(event) => setApprovalForm((current) => ({ ...current, title: event.target.value }))} placeholder="مثال: اعتماد صحيفة الدعوى" maxLength={200} /></label>
        <SelectField label="القضية" value={approvalForm.caseId} onChange={(caseId) => setApprovalForm((current) => ({ ...current, caseId }))}><option value="">اختر القضية</option>{data.cases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectField>
        <SelectField label="المعتمد" value={approvalForm.approverId} onChange={(approverId) => setApprovalForm((current) => ({ ...current, approverId }))}><option value="">اختر العضو</option>{members.filter((member) => member.id !== myUserId).map((member) => <option key={member.id} value={member.id}>{member.name || member.email}</option>)}</SelectField>
        <div className="flex items-end"><Button onClick={requestApproval} disabled={!approvalForm.title || !approvalForm.caseId || !approvalForm.approverId || busy === 'approval'}>{busy === 'approval' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="ms-1 h-4 w-4" />}إرسال</Button></div>
      </div>
      {approvals.length ? <div className="space-y-2">{approvals.slice(0, 15).map((item) => {
        const canDecide = item.status === 'pending' && item.approver.id === myUserId
        return <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.case?.title || item.document?.title || 'طلب عام'} • {item.requestedBy.name || 'عضو'} → {item.approver.name || 'عضو'}</p></div><div className="flex items-center gap-2">{canDecide ? <><Button size="sm" variant="outline" onClick={() => decideApproval(item.id, 'approved')} disabled={busy === `approval:${item.id}`}><CheckCircle2 className="ms-1 h-3.5 w-3.5" />اعتماد</Button><Button size="sm" variant="ghost" onClick={() => decideApproval(item.id, 'rejected')} disabled={busy === `approval:${item.id}`}><XCircle className="ms-1 h-3.5 w-3.5" />رفض</Button></> : <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}>{item.status === 'pending' ? 'بانتظار القرار' : item.status === 'approved' ? 'معتمد' : item.status === 'rejected' ? 'مرفوض' : 'ملغي'}</Badge>}</div></div>
      })}</div> : <p className="text-xs text-muted-foreground">لا توجد طلبات اعتماد بعد.</p>}
    </CardContent></Card>

    <Card className="border-border/60 bg-card/70 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock3 className="h-5 w-5 text-primary" />آخر النشاطات</CardTitle></CardHeader><CardContent>{data.events.length ? <div className="grid gap-2 md:grid-cols-2">{data.events.slice(0, 12).map((event) => <div key={event.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3"><span className="h-2 w-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium">{event.action}</p><p className="text-xs text-muted-foreground">{event.actor?.name || 'النظام'} • {new Date(event.createdAt).toLocaleString('ar-SA')}</p></div></div>)}</div> : <EmptyState icon={Clock3} title="لا يوجد نشاط بعد" text="ستظهر تغييرات القضايا والتعيينات والطلبات هنا." />}</CardContent></Card>
  </div>
}
