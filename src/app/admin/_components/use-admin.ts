'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Status } from './types'

export function useAdmin() {
  const { data: session, status: sessionStatus } = useSession()
  const user = session?.user as { role?: string; mfaEnabled?: boolean } | undefined
  const isPlatformAdmin = user?.role === 'admin'
  const mfaEnabled = Boolean(user?.mfaEnabled)
  const [status, setStatus] = useState<Status | null>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [workspaces, setWorkspaces] = useState<any[] | null>(null)
  const [jobs, setJobs] = useState<any | null>(null)
  const [flags, setFlags] = useState<Record<string, boolean> | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [feedback, setFeedback] = useState<Array<{ id: string; type: string; message: string; pagePath: string | null; status: string; adminNote: string | null; createdAt: string; user: { email: string; name: string | null }; workspace: { name: string } }>>([])
  const [waitlist, setWaitlist] = useState<Array<{ id: string; email: string; interest: string | null; source: string | null; createdAt: string }>>([])
  const [incidents, setIncidents] = useState<any[]>([])
  const [registers, setRegisters] = useState<{ processors: any[]; transfers: any[]; dpias: any[]; retentionPolicies: any[]; legalHolds: any[] } | null>(null)
  const [incidentTitle, setIncidentTitle] = useState('')
  const [incidentDesc, setIncidentDesc] = useState('')
  const [incidentSeverity, setIncidentSeverity] = useState('medium')
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
    if (sessionStatus !== 'authenticated' || !mfaEnabled) return
    Promise.all([
      fetch('/api/admin/system/status'),
      fetch('/api/admin/privacy/requests'),
      fetch('/api/admin/users'),
      fetch('/api/admin/jobs'),
      fetch('/api/admin/audit-logs'),
      fetch('/api/admin/waitlist'),
      fetch('/api/admin/privacy/incidents'),
      fetch('/api/admin/privacy/registers'),
      fetch('/api/admin/feedback'),
    ]).then(async ([a, b, c, e, f, w, inc, reg, fb]) => {
      if (a.ok) setStatus(await a.json())
      if (b.ok) setRequests(await b.json())
      if (c.ok) setUsers(await c.json())
      if (e.ok) setJobs(await e.json())
      if (f.ok) {
        const logData = await f.json()
        setAuditLogs(logData.items || [])
      }
      if (w.ok) {
        const wlData = await w.json()
        setWaitlist(wlData.items || [])
      }
      if (inc.ok) setIncidents(await inc.json())
      if (reg.ok) setRegisters(await reg.json())
      if (fb.ok) setFeedback((await fb.json()).items || [])
    })
    fetch('/api/admin/feature-flags').then(async (response) => {
      if (response.ok) setFlags((await response.json()).flags)
    })
  }, [sessionStatus, mfaEnabled])

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !mfaEnabled || !isPlatformAdmin) return
    fetch('/api/admin/platform/workspaces').then(async (res) => {
      if (res.ok) setWorkspaces(await res.json())
    })
  }, [sessionStatus, mfaEnabled, isPlatformAdmin])

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

  const updateFeedback = async (id: string, patch: { status?: string; adminNote?: string | null }) => {
    const res = await fetch(`/api/admin/feedback/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    if (!res.ok) {
      setMessage('تعذر تحديث الملاحظة')
      return
    }
    const { item } = await res.json()
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, status: item.status, adminNote: item.adminNote } : f)))
  }

  return {
    session,
    sessionStatus,
    user,
    isPlatformAdmin,
    mfaEnabled,
    status,
    setStatus,
    requests,
    setRequests,
    users,
    setUsers,
    workspaces,
    setWorkspaces,
    jobs,
    setJobs,
    flags,
    setFlags,
    auditLogs,
    setAuditLogs,
    waitlist,
    setWaitlist,
    feedback,
    setFeedback,
    updateFeedback,
    incidents,
    setIncidents,
    registers,
    setRegisters,
    incidentTitle,
    setIncidentTitle,
    incidentDesc,
    setIncidentDesc,
    incidentSeverity,
    setIncidentSeverity,
    loadingLogs,
    setLoadingLogs,
    exporting,
    setExporting,
    email,
    setEmail,
    role,
    setRole,
    message,
    setMessage,
    lastInviteUrl,
    setLastInviteUrl,
    loadLogs,
    invite,
    testEmail,
    updateUser,
    updateWorkspace,
    handleExportData,
    updatePrivacyRequest,
  }
}

export type AdminState = ReturnType<typeof useAdmin>
