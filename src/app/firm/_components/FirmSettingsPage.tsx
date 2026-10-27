'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Activity, AlertTriangle, Banknote, Building2, FileText, Gavel, ShieldCheck, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PortalPageHeader, StatTile, useBilingual } from '@/components/portal/PortalShell'
import type { FirmDashboard } from '@/app/actions/firmDashboard'
import { useFirm } from './shared'

export function FirmSettingsPage() {
  const L = useBilingual()
  const { data, refetch } = useFirm()
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const [saasStatus, setSaasStatus] = useState<{ plan: { name: string; seatLimit: number; storageLimitMb: number }; subscription: { status: string; trialEndsAt: string | null; currentPeriodEnd: string } | null; usage: { seats: number; aiRequests: { used: number; limit: number | null }; portalUploads: { used: number; limit: number | null }; storage: { usedBytes: number; limitBytes: number | null } } } | null>(null)
  const [memberships, setMemberships] = useState<Array<{ userId: string; role: string; isOwner: boolean; status: string; user: { name: string | null; email: string; mfaEnabled: boolean } }>>([])
  const [transferTarget, setTransferTarget] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!data) return
    setName(data.workspace.name)
    setDomain(data.workspace.domain || '')
  }, [data])

  useEffect(() => {
    Promise.all([fetch('/api/saas/status'), fetch('/api/memberships')]).then(async ([statusResponse, membershipsResponse]) => {
      if (statusResponse.ok) setSaasStatus(await statusResponse.json())
      if (membershipsResponse.ok) setMemberships(await membershipsResponse.json())
    })
  }, [])

  async function saveWorkspace(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    const response = await fetch('/api/workspace', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, domain }) })
    const result = await response.json().catch(() => ({}))
    setSaving(false)
    if (!response.ok) return toast.error(result.error || L({ ar: 'تعذر حفظ بيانات المكتب', en: 'Could not save firm details' }))
    toast.success(L({ ar: 'تم تحديث بيانات المكتب', en: 'Firm details updated' }))
    refetch()
  }

  async function transferOwnership() {
    if (!transferTarget || !window.confirm(L({ ar: 'سيتم نقل ملكية المكتب وإنهاء جلستك الحالية. هل تريد المتابعة؟', en: 'This transfers firm ownership and ends your current session. Continue?' }))) return
    setTransferring(true)
    const response = await fetch('/api/memberships/transfer-ownership', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: transferTarget, confirmation: 'TRANSFER' }) })
    const result = await response.json().catch(() => ({}))
    setTransferring(false)
    if (!response.ok) return toast.error(result.error || L({ ar: 'تعذر نقل الملكية', en: 'Could not transfer ownership' }))
    toast.success(L({ ar: 'تم نقل الملكية. سجّل الدخول مجدداً.', en: 'Ownership transferred. Sign in again.' }))
    await signOut({ callbackUrl: '/login' })
  }

  async function exportWorkspaceData() {
    setExporting(true)
    try {
      const response = await fetch('/api/privacy/export', { method: 'POST' })
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `sanad-data-export-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error(L({ ar: 'تعذر تصدير البيانات', en: 'Could not export data' }))
    } finally {
      setExporting(false)
    }
  }

  async function deleteWorkspace() {
    setDeleting(true)
    const response = await fetch('/api/workspace', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmName: deleteConfirmName.trim(), password: deletePassword }),
    })
    const result = await response.json().catch(() => ({}))
    setDeleting(false)
    if (!response.ok) {
      if (result.code === 'MFA_REQUIRED') {
        return toast.error(L({ ar: 'فعّل التحقق الثنائي من صفحة الأمان أولاً', en: 'Enable MFA on the security page first' }))
      }
      return toast.error(result.error || L({ ar: 'تعذر حذف المكتب', en: 'Could not delete the workspace' }))
    }
    toast.success(L({ ar: 'تم حذف المكتب نهائياً', en: 'Workspace deleted permanently' }))
    await signOut({ callbackUrl: '/login' })
  }

  const links = [
    { href: '/admin', icon: Building2, title: { ar: 'لوحة الإدارة', en: 'Admin console' }, desc: { ar: 'المستخدمون، حالة النظام، طلبات الخصوصية', en: 'Users, system status, privacy requests' } },
    { href: '/settings/security', icon: ShieldCheck, title: { ar: 'الأمان والتحقق الثنائي', en: 'Security & MFA' }, desc: { ar: 'فعّل التحقق الثنائي لإدارة المستخدمين', en: 'Enable MFA to manage users' } },
    { href: '/pricing', icon: Banknote, title: { ar: 'الاشتراك والباقات', en: 'Subscription & plans' }, desc: { ar: 'ترقية الباقة وعدد المقاعد', en: 'Upgrade plan and seats' } },
    { href: '/firm/workflow', icon: Gavel, title: { ar: 'سير العمل', en: 'Workflow board' }, desc: { ar: 'مراحل القضايا وطلبات البوابة', en: 'Case stages and portal requests' } },
  ]
  return (
    <>
      <PortalPageHeader portal="firm" title={L({ ar: 'الإعدادات والخصوصية', en: 'Settings & privacy' })} subtitle={data?.workspace.name} />
      {saasStatus && <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={L({ ar: 'الباقة', en: 'Plan' })} value={saasStatus.plan.name} icon={Banknote} />
        <StatTile label={L({ ar: 'المقاعد المستخدمة', en: 'Seats used' })} value={`${saasStatus.usage.seats}/${saasStatus.plan.seatLimit}`} icon={UsersRound} tone={saasStatus.usage.seats >= saasStatus.plan.seatLimit ? 'warn' : 'good'} />
        <StatTile label={L({ ar: 'حالة الاشتراك', en: 'Subscription' })} value={saasStatus.subscription?.status || 'inactive'} icon={Activity} tone={saasStatus.subscription?.status === 'active' || saasStatus.subscription?.status === 'trialing' ? 'good' : 'warn'} />
        <StatTile label={L({ ar: 'طلبات الذكاء الاصطناعي', en: 'AI requests' })} value={`${saasStatus.usage.aiRequests.used}/${saasStatus.usage.aiRequests.limit ?? '∞'}`} icon={Activity} tone={saasStatus.usage.aiRequests.limit != null && saasStatus.usage.aiRequests.used >= saasStatus.usage.aiRequests.limit ? 'warn' : 'good'} />
        <StatTile label={L({ ar: 'رفعات البوابة', en: 'Portal uploads' })} value={`${saasStatus.usage.portalUploads.used}/${saasStatus.usage.portalUploads.limit ?? '∞'}`} icon={FileText} tone={saasStatus.usage.portalUploads.limit != null && saasStatus.usage.portalUploads.used >= saasStatus.usage.portalUploads.limit ? 'warn' : 'good'} />
        <StatTile label={L({ ar: 'التخزين المستخدم', en: 'Storage used' })} value={`${Math.round(saasStatus.usage.storage.usedBytes / 1024 / 1024)}/${saasStatus.usage.storage.limitBytes ? Math.round(saasStatus.usage.storage.limitBytes / 1024 / 1024) : '∞'} MB`} icon={FileText} tone={saasStatus.usage.storage.limitBytes != null && saasStatus.usage.storage.usedBytes >= saasStatus.usage.storage.limitBytes ? 'warn' : 'good'} />
      </div>}
      <form onSubmit={saveWorkspace} className="mb-5 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex items-start justify-between gap-4"><div><h2 className="font-semibold">{L({ ar: 'هوية المكتب', en: 'Firm identity' })}</h2><p className="mt-1 text-xs text-muted-foreground">{L({ ar: 'تظهر هذه البيانات للفريق وفي بوابة الموكل.', en: 'These details appear to your team and in the client portal.' })}</p></div><Building2 className="h-5 w-5 text-amber-600" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{L({ ar: 'اسم المكتب', en: 'Firm name' })}</span><Input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={120} required /></label>
          <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{L({ ar: 'النطاق الموثق', en: 'Verified domain' })}</span><Input value={domain} onChange={(event) => setDomain(event.target.value)} dir="ltr" placeholder="lawfirm.sa" maxLength={253} /></label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-[11px] text-muted-foreground">{L({ ar: 'تغييرات الهوية تسجّل في سجل التدقيق.', en: 'Identity changes are recorded in the audit log.' })}</p><Button type="submit" disabled={saving || name.trim().length < 2} className="bg-amber-700 text-white hover:bg-amber-600">{saving ? L({ ar: 'جارٍ الحفظ...', en: 'Saving...' }) : L({ ar: 'حفظ بيانات المكتب', en: 'Save firm details' })}</Button></div>
      </form>
      <div className="mb-5 rounded-2xl border border-rose-500/20 bg-card/70 p-5 shadow-sm">
        <div className="mb-4"><h2 className="font-semibold">{L({ ar: 'ملكية المكتب', en: 'Workspace ownership' })}</h2><p className="mt-1 text-xs text-muted-foreground">{L({ ar: 'انقل صلاحيات المالك إلى عضو نشط وموثوق. يتطلب ذلك تفعيل MFA وينهي جلسة المالك الحالي.', en: 'Transfer ownership to a trusted active member. MFA is required and the current owner session will end.' })}</p></div>
        <div className="flex flex-col gap-3 sm:flex-row"><select aria-label={L({ ar: 'اختر المالك الجديد', en: 'Select the new owner' })} value={transferTarget} onChange={(event) => setTransferTarget(event.target.value)} className="h-10 flex-1 rounded-xl border bg-background px-3 text-sm"><option value="">{L({ ar: 'اختر المالك الجديد', en: 'Select the new owner' })}</option>{memberships.filter((membership) => !membership.isOwner && membership.status === 'active' && ['lawyer', 'staff'].includes(membership.role)).map((membership) => <option key={membership.userId} value={membership.userId}>{membership.user.name || membership.user.email} — {membership.role}</option>)}</select><Button type="button" variant="destructive" onClick={transferOwnership} disabled={!transferTarget || transferring}>{transferring ? L({ ar: 'جارٍ النقل...', en: 'Transferring...' }) : L({ ar: 'نقل الملكية', en: 'Transfer ownership' })}</Button></div>
      </div>
      <div className="mb-5 rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /><div><h2 className="font-semibold text-rose-700 dark:text-rose-400">{L({ ar: 'حذف المكتب نهائياً', en: 'Delete workspace permanently' })}</h2><p className="mt-1 text-xs text-muted-foreground">{L({ ar: 'يمسح هذا كل بيانات المكتب والقضايا والمستندات والفواتير والأعضاء غير المرتبطين بمكاتب أخرى. إجراء غير قابل للتراجع — صدّر بياناتك أولاً.', en: 'This permanently erases all workspace data, cases, documents, invoices, and members not linked to other workspaces. This cannot be undone — export your data first.' })}</p></div></div>
        <div className="mb-3"><Button type="button" variant="outline" size="sm" disabled={exporting} onClick={exportWorkspaceData}>{exporting ? L({ ar: 'جارٍ تصدير البيانات...', en: 'Exporting data...' }) : L({ ar: 'تصدير كل بيانات المكتب (JSON)', en: 'Export all workspace data (JSON)' })}</Button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{L({ ar: 'اكتب اسم المكتب للتأكيد', en: 'Type the workspace name to confirm' })}</span><Input value={deleteConfirmName} onChange={(event) => setDeleteConfirmName(event.target.value)} placeholder={data?.workspace.name} dir="auto" /></label>
          <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{L({ ar: 'كلمة المرور', en: 'Password' })}</span><Input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" /></label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-[11px] text-muted-foreground">{L({ ar: 'يتطلب الحذف تفعيل التحقق الثنائي ولا يمكن مع وجود حجز قانوني نشط.', en: 'Deletion requires MFA and is blocked while a legal hold is active.' })}</p><Button type="button" variant="destructive" onClick={deleteWorkspace} disabled={deleting || !deletePassword || deleteConfirmName.trim() !== (data?.workspace.name || '')}>{deleting ? L({ ar: 'جارٍ الحذف...', en: 'Deleting...' }) : L({ ar: 'حذف المكتب نهائياً', en: 'Delete workspace' })}</Button></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="group rounded-2xl border border-border/60 bg-card/60 p-5 flex gap-4 items-start transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
              <l.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{L(l.title)}</p>
              <p className="text-xs text-muted-foreground mt-1">{L(l.desc)}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

export type { FirmDashboard }
