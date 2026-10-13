'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Activity,
  AlertTriangle,
  Banknote,
  Briefcase,
  Building2,
  CalendarClock,
  Clock,
  Copy,
  FileText,
  Gavel,
  LayoutDashboard,
  Mail,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NAV_ICONS } from '@/lib/sanad/constants'
import { useLang } from '@/lib/sanad/i18n'
import { PortalPageHeader, PortalShell, StatTile, useBilingual, type NavSection } from '@/components/portal/PortalShell'
import { useFirmDashboard } from '@/components/portal/usePortalData'
import type { FirmDashboard } from '@/app/actions/firmDashboard'

const sar = (n: number, lang: string) =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(n)

const STAGE_LABELS: Record<string, { ar: string; en: string }> = {
  drafting: { ar: 'صياغة', en: 'Drafting' },
  client_review: { ar: 'مراجعة الموكّل', en: 'Client review' },
  filed: { ar: 'مقيدة', en: 'Filed' },
  hearing: { ar: 'جلسات', en: 'Hearings' },
  closed: { ar: 'مغلقة', en: 'Closed' },
}

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  admin: { ar: 'مدير النظام', en: 'Admin' },
  workspace_owner: { ar: 'مالك المكتب', en: 'Owner' },
  lawyer: { ar: 'محامٍ', en: 'Lawyer' },
  staff: { ar: 'فريق', en: 'Staff' },
  auditor: { ar: 'مدقق', en: 'Auditor' },
  student: { ar: 'متدرب', en: 'Trainee' },
  lead: { ar: 'رئيسي', en: 'Lead' },
  assignee: { ar: 'مكلّف', en: 'Assignee' },
  reviewer: { ar: 'مراجع', en: 'Reviewer' },
  observer: { ar: 'مطّلع', en: 'Observer' },
}

/* ─────────────────────────── Frame ─────────────────────────── */

export function FirmPortalFrame({ children }: { children: React.ReactNode }) {
  const { data, busy, refetch } = useFirmDashboard()
  const qc = useQueryClient()
  const k = data?.kpis
  const icon = (key: string, fallback: React.ComponentType<{ className?: string }>) => NAV_ICONS[key] || fallback

  const sections: NavSection[] = [
    {
      title: { ar: 'إدارة المكتب', en: 'Firm management' },
      items: [
        { href: '/firm', exact: true, icon: LayoutDashboard, label: { ar: 'لوحة المكتب', en: 'Firm overview' } },
        { href: '/firm/team', icon: UsersRound, label: { ar: 'الفريق والدعوات', en: 'Team & invites' }, badge: k?.pendingInvites ? { text: `${k.pendingInvites}`, tone: 'muted' } : null },
        {
          href: '/firm/assignments',
          icon: Gavel,
          label: { ar: 'توزيع القضايا', en: 'Case assignments' },
          badge: k?.unassignedCases ? { text: `${k.unassignedCases}`, tone: 'amber' } : null,
        },
        { href: '/firm/workflow', icon: Gavel, label: { ar: 'سير العمل والطلبات', en: 'Workflow & requests' }, badge: k?.openPortalRequests ? { text: `${k.openPortalRequests}`, tone: 'amber' } : null },
      ],
    },
    {
      title: { ar: 'الأعمال', en: 'Practice' },
      items: [
        { href: '/firm/cases', icon: icon('cases', Briefcase), label: { ar: 'كل القضايا', en: 'All cases' } },
        { href: '/firm/clients', icon: icon('clients', Users), label: { ar: 'الموكّلون والبوابة', en: 'Clients & portal' } },
        {
          href: '/firm/invoices',
          icon: icon('invoices', Banknote),
          label: { ar: 'الفوترة والتحصيل', en: 'Billing & collections' },
          badge: k?.overdueInvoices ? { text: `${k.overdueInvoices}`, tone: 'rose' } : null,
        },
        { href: '/firm/compliance', icon: icon('compliance', ShieldCheck), label: { ar: 'امتثال المكتب', en: 'Firm compliance' } },
      ],
    },
    {
      title: { ar: 'النظام', en: 'System' },
      items: [{ href: '/firm/settings', icon: Settings, label: { ar: 'الإعدادات والخصوصية', en: 'Settings & privacy' } }],
    },
  ]

  return (
    <PortalShell
      portal="firm"
      sections={sections}
      refreshing={busy}
      onRefresh={() => {
        refetch()
        qc.invalidateQueries({ queryKey: ['dashboard', 'lawyer'] })
      }}
    >
      {children}
    </PortalShell>
  )
}

function useFirm() {
  const res = useFirmDashboard()
  return res
}

function FirmLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-muted/50 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted/40 rounded-2xl" />)}</div>
      <div className="h-72 bg-muted/30 rounded-2xl" />
    </div>
  )
}

function Panel({ title, icon: Icon, action, children, className = '' }: { title: string; icon?: React.ComponentType<{ className?: string }>; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/* ─────────────────────────── Overview ─────────────────────────── */

export function FirmOverviewPage() {
  const { lang } = useLang()
  const L = useBilingual()
  const { data, isLoading } = useFirm()
  if (isLoading && !data) return <FirmLoading />
  if (!data) return <p className="text-sm text-muted-foreground py-12 text-center">{L({ ar: 'تعذر تحميل بيانات المكتب.', en: 'Could not load firm data.' })}</p>

  const k = data.kpis
  const delta = k.revenueLastMonth > 0 ? Math.round(((k.revenueThisMonth - k.revenueLastMonth) / k.revenueLastMonth) * 100) : null
  const maxLoad = Math.max(1, ...data.members.map((m) => m.activeCases))
  const totalPipeline = data.pipeline.reduce((s, p) => s + p.count, 0) || 1

  return (
    <>
      <PortalPageHeader
        portal="firm"
        title={data.workspace.name}
        subtitle={L({ ar: 'نظرة شاملة على أداء المكتب والفريق والتحصيل', en: 'Firm-wide performance, team load and collections' })}
        actions={
          <Button asChild size="sm" className="bg-amber-700 hover:bg-amber-600 text-white">
            <Link href="/firm/team" id="firm-invite-cta">
              <UserPlus className="h-4 w-4 me-1.5" />
              {L({ ar: 'دعوة عضو', en: 'Invite member' })}
            </Link>
          </Button>
        }
      />

      {k.unassignedCases > 0 && (
        <Link
          href="/firm/assignments"
          className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 hover:bg-amber-500/15 transition-colors"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {L({ ar: `${k.unassignedCases} قضية نشطة بدون محامٍ مكلّف — وزّعها الآن`, en: `${k.unassignedCases} active cases have no assigned lawyer — assign now` })}
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile
          label={L({ ar: 'إيرادات الشهر', en: 'Revenue this month' })}
          value={sar(k.revenueThisMonth, lang)}
          hint={delta === null ? undefined : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}% ${L({ ar: 'عن الشهر الماضي', en: 'vs last month' })}`}
          icon={Banknote}
          tone={delta !== null && delta < 0 ? 'warn' : 'good'}
        />
        <StatTile label={L({ ar: 'مستحقات قائمة', en: 'Outstanding' })} value={sar(k.outstanding, lang)} hint={L({ ar: `${k.overdueInvoices} فاتورة متأخرة`, en: `${k.overdueInvoices} overdue invoices` })} icon={FileText} tone={k.overdueInvoices > 0 ? 'bad' : 'default'} />
        <StatTile label={L({ ar: 'القضايا النشطة', en: 'Active cases' })} value={k.activeCases} hint={L({ ar: `${k.urgentCases} عالية الأولوية`, en: `${k.urgentCases} high priority` })} icon={Briefcase} />
        <StatTile label={L({ ar: 'ساعات مفوترة (الشهر)', en: 'Billable hours (month)' })} value={k.billableHoursMonth} hint={L({ ar: `${sar(k.uninvoicedValue, lang)} غير مفوتر`, en: `${sar(k.uninvoicedValue, lang)} unbilled` })} icon={Clock} />
        <StatTile label={L({ ar: 'أعضاء الفريق', en: 'Team members' })} value={k.teamSize} hint={k.pendingInvites ? L({ ar: `${k.pendingInvites} دعوة معلّقة`, en: `${k.pendingInvites} pending invites` }) : undefined} icon={UsersRound} />
        <StatTile label={L({ ar: 'الموكّلون', en: 'Clients' })} value={k.totalClients} hint={L({ ar: `${k.clientsWithPortal} لديهم حساب في البوابة`, en: `${k.clientsWithPortal} with portal accounts` })} icon={Users} />
        <StatTile label={L({ ar: 'جلسات خلال 14 يوماً', en: 'Hearings in 14 days' })} value={k.upcomingHearings} icon={CalendarClock} tone={k.upcomingHearings > 0 ? 'warn' : 'default'} />
        <StatTile label={L({ ar: 'طلبات موكّلين مفتوحة', en: 'Open client requests' })} value={k.openPortalRequests} icon={Mail} tone={k.openPortalRequests > 0 ? 'warn' : 'default'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Panel title={L({ ar: 'الإيرادات والفوترة — 6 أشهر', en: 'Revenue & invoicing — 6 months' })} icon={Banknote} className="xl:col-span-2">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="firmRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="firmInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={60} />
                <Tooltip formatter={(v: number) => sar(v, lang)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="invoiced" name={L({ ar: 'مفوتر', en: 'Invoiced' })} stroke="#64748b" fill="url(#firmInv)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" name={L({ ar: 'محصّل', en: 'Collected' })} stroke="#f59e0b" fill="url(#firmRev)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={L({ ar: 'مسار القضايا', en: 'Case pipeline' })} icon={Gavel}>
          {data.pipeline.length === 0 ? (
            <p className="text-xs text-muted-foreground">{L({ ar: 'لا توجد قضايا بعد.', en: 'No cases yet.' })}</p>
          ) : (
            <ul className="space-y-3">
              {data.pipeline.map((p) => (
                <li key={p.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{L(STAGE_LABELS[p.stage] || { ar: p.stage, en: p.stage })}</span>
                    <span className="tabular-nums text-muted-foreground">{p.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-l from-amber-500 to-orange-600 transition-all duration-700" style={{ width: `${(p.count / totalPipeline) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel
          title={L({ ar: 'عبء العمل على الفريق', en: 'Team workload' })}
          icon={UsersRound}
          className="xl:col-span-2"
          action={
            <Link href="/firm/assignments" className="text-xs text-amber-700 dark:text-amber-300 hover:underline">
              {L({ ar: 'إدارة التوزيع', en: 'Manage assignments' })}
            </Link>
          }
        >
          <ul className="divide-y divide-border/60">
            {data.members.map((m) => (
              <li key={m.id} className="py-2.5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 grid place-items-center text-xs font-bold shrink-0">
                  {(m.name || m.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{m.name || m.email}</p>
                    <span className="text-[10px] text-muted-foreground">{L(ROLE_LABELS[m.role] || { ar: m.role, en: m.role })}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-amber-500/80 rounded-full transition-all duration-700" style={{ width: `${(m.activeCases / maxLoad) * 100}%` }} />
                  </div>
                </div>
                <div className="text-end text-[11px] text-muted-foreground tabular-nums shrink-0 w-28">
                  <p>
                    {m.activeCases} {L({ ar: 'قضية', en: 'cases' })} · {m.openTasks} {L({ ar: 'مهمة', en: 'tasks' })}
                  </p>
                  {m.overdueTasks > 0 && <p className="text-rose-600 dark:text-rose-400">{m.overdueTasks} {L({ ar: 'متأخرة', en: 'overdue' })}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={L({ ar: 'آخر النشاطات', en: 'Recent activity' })} icon={Activity}>
          {data.activity.length === 0 ? (
            <p className="text-xs text-muted-foreground">{L({ ar: 'لا يوجد نشاط مسجّل.', en: 'No recorded activity.' })}</p>
          ) : (
            <ul className="space-y-2.5">
              {data.activity.map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-xs">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] truncate">{a.action}</p>
                    <p className="text-muted-foreground text-[10px]">
                      {a.actor || L({ ar: 'النظام', en: 'System' })} · {new Date(a.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}

/* ─────────────────────────── Team ─────────────────────────── */

const INVITE_ROLES = ['lawyer', 'staff', 'student', 'auditor'] as const

export function FirmTeamPage() {
  const { lang } = useLang()
  const L = useBilingual()
  const { data, isLoading, refetch } = useFirm()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<(typeof INVITE_ROLES)[number]>('lawyer')
  const [sending, setSending] = useState(false)
  const [lastUrl, setLastUrl] = useState('')

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      setLastUrl(json.url || '')
      setEmail('')
      toast.success(json.delivery === 'email' ? L({ ar: 'أُرسلت الدعوة بالبريد', en: 'Invitation emailed' }) : L({ ar: 'أُنشئ رابط الدعوة — انسخه وأرسله', en: 'Invite link created — copy and share it' }))
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  async function revokeInvitation(id: string) {
    const res = await fetch(`/api/invitations/${id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(json.error || L({ ar: 'تعذر إلغاء الدعوة', en: 'Could not revoke invitation' }))
      return
    }
    toast.success(L({ ar: 'أُلغيت الدعوة', en: 'Invitation revoked' }))
    refetch()
  }

  if (isLoading && !data) return <FirmLoading />
  if (!data) return null

  return (
    <>
      <PortalPageHeader portal="firm" title={L({ ar: 'الفريق والدعوات', en: 'Team & invitations' })} subtitle={L({ ar: 'أضف محامين وموظفين وحدد صلاحياتهم', en: 'Add lawyers and staff and set their roles' })} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={L({ ar: 'أعضاء المكتب', en: 'Firm members' })} value={data.members.length} icon={UsersRound} />
        <StatTile label={L({ ar: 'محامون', en: 'Lawyers' })} value={data.members.filter((member) => ['lawyer', 'workspace_owner', 'admin'].includes(member.role)).length} icon={Gavel} />
        <StatTile label={L({ ar: 'MFA مفعّل', en: 'MFA enabled' })} value={`${data.members.filter((member) => member.mfaEnabled).length}/${data.members.length}`} icon={ShieldCheck} tone={data.members.every((member) => member.mfaEnabled) ? 'good' : 'warn'} />
        <StatTile label={L({ ar: 'دعوات معلّقة', en: 'Pending invites' })} value={data.invitations.length} icon={Mail} tone={data.invitations.length ? 'warn' : 'default'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title={L({ ar: `أعضاء المكتب (${data.members.length})`, en: `Firm members (${data.members.length})` })} icon={UsersRound} className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground text-start border-b border-border/60">
                  <th className="text-start py-2 font-medium">{L({ ar: 'العضو', en: 'Member' })}</th>
                  <th className="text-start py-2 font-medium">{L({ ar: 'الدور', en: 'Role' })}</th>
                  <th className="text-start py-2 font-medium">{L({ ar: 'القضايا', en: 'Cases' })}</th>
                  <th className="text-start py-2 font-medium">MFA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5">
                      <p className="font-medium">{m.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </td>
                    <td className="py-2.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">{L(ROLE_LABELS[m.role] || { ar: m.role, en: m.role })}</span>
                    </td>
                    <td className="py-2.5 tabular-nums">
                      {m.activeCases}
                      {m.leadCases > 0 && <span className="text-xs text-muted-foreground"> ({m.leadCases} {L({ ar: 'رئيسي', en: 'lead' })})</span>}
                    </td>
                    <td className="py-2.5">
                      {m.mfaEnabled ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <span className="text-xs text-rose-600 dark:text-rose-400">{L({ ar: 'غير مفعّل', en: 'Off' })}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {L({ ar: 'لتعطيل حساب أو فرض إعادة الدخول استخدم ', en: 'To disable accounts or force sign-out use ' })}
            <Link href="/admin" className="underline">{L({ ar: 'لوحة الإدارة', en: 'the admin console' })}</Link>.
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel title={L({ ar: 'دعوة عضو جديد', en: 'Invite a member' })} icon={UserPlus}>
            <form onSubmit={invite} className="space-y-3">
              <Input id="firm-invite-email" type="email" required placeholder="name@lawfirm.sa" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="grid grid-cols-2 gap-1.5">
                {INVITE_ROLES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    id={`firm-invite-role-${r}`}
                    onClick={() => setRole(r)}
                    className={`text-xs py-1.5 rounded-lg border transition-all ${role === r ? 'bg-amber-700 text-white border-amber-700' : 'border-border hover:bg-muted'}`}
                  >
                    {L(ROLE_LABELS[r])}
                  </button>
                ))}
              </div>
              <Button type="submit" disabled={sending} className="w-full bg-amber-700 hover:bg-amber-600 text-white" id="firm-invite-submit">
                {sending ? L({ ar: 'جارٍ الإرسال...', en: 'Sending...' }) : L({ ar: 'إرسال الدعوة', en: 'Send invitation' })}
              </Button>
              {lastUrl && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(lastUrl).then(() => toast.success(L({ ar: 'نُسخ الرابط', en: 'Link copied' })))}
                  className="w-full flex items-center gap-2 text-[11px] text-start p-2 rounded-lg bg-muted/60 hover:bg-muted break-all"
                >
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2" dir="ltr">{lastUrl}</span>
                </button>
              )}
            </form>
          </Panel>

          <Panel title={L({ ar: 'دعوات معلّقة', en: 'Pending invitations' })} icon={Mail}>
            {data.invitations.length === 0 ? (
              <p className="text-xs text-muted-foreground">{L({ ar: 'لا توجد دعوات معلّقة.', en: 'No pending invitations.' })}</p>
            ) : (
              <ul className="space-y-2">
                {data.invitations.map((i) => (
                  <li key={i.id} className="text-xs flex items-center justify-between gap-2">
                    <span className="truncate" dir="ltr">{i.email}</span>
                    <span className="text-muted-foreground shrink-0">
                      {L(ROLE_LABELS[i.role] || { ar: i.role === 'client' ? 'موكّل' : i.role, en: i.role })} · {new Date(i.expiresAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB')}
                    </span>
                    <button type="button" onClick={() => revokeInvitation(i.id)} className="text-rose-600 hover:underline shrink-0">
                      {L({ ar: 'إلغاء', en: 'Revoke' })}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────── Assignments ─────────────────────────── */

export function FirmAssignmentsPage() {
  const { lang } = useLang()
  const L = useBilingual()
  const { data, isLoading, refetch } = useFirm()
  const [filter, setFilter] = useState<'all' | 'unassigned'>('all')
  const [pending, setPending] = useState<string | null>(null)
  const assignable = useMemo(() => (data?.members || []).filter((m) => m.role !== 'auditor'), [data])

  async function act(caseId: string, userId: string, action: 'assign' | 'unassign', role = 'assignee') {
    setPending(`${caseId}:${userId}`)
    try {
      const res = await fetch('/api/workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, caseId, userId, role }) })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed')
      await refetch()
      toast.success(action === 'assign' ? L({ ar: 'تم التعيين', en: 'Assigned' }) : L({ ar: 'أُلغي التعيين', en: 'Unassigned' }))
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setPending(null)
    }
  }

  if (isLoading && !data) return <FirmLoading />
  if (!data) return null
  const rows = filter === 'unassigned' ? data.cases.filter((c) => c.assignees.length === 0) : data.cases

  return (
    <>
      <PortalPageHeader
        portal="firm"
        title={L({ ar: 'توزيع القضايا', en: 'Case assignments' })}
        subtitle={L({ ar: 'عيّن المحامين على القضايا ووازن عبء العمل', en: 'Staff cases and balance workload' })}
        actions={
          <div className="flex rounded-full bg-muted/70 p-0.5 border border-border/60">
            {(['all', 'unassigned'] as const).map((f) => (
              <button
                key={f}
                id={`assign-filter-${f}`}
                onClick={() => setFilter(f)}
                className={`h-7 px-3 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground'}`}
              >
                {f === 'all' ? L({ ar: `الكل (${data.cases.length})`, en: `All (${data.cases.length})` }) : L({ ar: `بدون تعيين (${data.kpis.unassignedCases})`, en: `Unassigned (${data.kpis.unassignedCases})` })}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={L({ ar: 'القضايا النشطة', en: 'Active cases' })} value={data.cases.length} icon={Briefcase} />
        <StatTile label={L({ ar: 'بدون مسؤول', en: 'Unassigned' })} value={data.kpis.unassignedCases} icon={AlertTriangle} tone={data.kpis.unassignedCases ? 'warn' : 'good'} />
        <StatTile label={L({ ar: 'متوسط الحمل', en: 'Average workload' })} value={assignable.length ? (data.cases.reduce((total, item) => total + item.assignees.length, 0) / assignable.length).toFixed(1) : '0'} icon={UsersRound} />
        <StatTile label={L({ ar: 'أعضاء متاحون', en: 'Assignable members' })} value={assignable.length} icon={UserPlus} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{L({ ar: 'لا توجد قضايا في هذا العرض.', en: 'No cases in this view.' })}</div>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => {
            const unassigned = assignable.filter((m) => !c.assignees.some((a) => a.userId === m.id))
            return (
              <li key={c.id} className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-all hover:shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">{c.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{L(STAGE_LABELS[c.stage] || { ar: c.stage, en: c.stage })}</span>
                      {(c.priority === 'urgent' || c.priority === 'high') && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">{c.priority}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.clientName}
                      {c.hearingDate && ` · ${L({ ar: 'جلسة', en: 'Hearing' })} ${new Date(c.hearingDate).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {c.assignees.length === 0 && <span className="text-[11px] text-amber-700 dark:text-amber-300">{L({ ar: 'غير مكلّفة', en: 'Unassigned' })}</span>}
                    {c.assignees.map((a) => (
                      <span key={a.userId} className="inline-flex items-center gap-1 text-[11px] ps-2 pe-1 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {a.name || '—'} <span className="text-muted-foreground">· {L(ROLE_LABELS[a.role] || { ar: a.role, en: a.role })}</span>
                        <button
                          aria-label="Unassign"
                          disabled={pending === `${c.id}:${a.userId}`}
                          onClick={() => act(c.id, a.userId, 'unassign', a.role)}
                          className="h-4 w-4 grid place-items-center rounded-full hover:bg-rose-500/20 hover:text-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {unassigned.length > 0 && (
                      <select
                        aria-label={L({ ar: 'تعيين محامٍ', en: 'Assign lawyer' })}
                        className="h-7 text-xs rounded-full border border-border bg-background px-2 cursor-pointer"
                        value=""
                        disabled={Boolean(pending)}
                        onChange={(e) => e.target.value && act(c.id, e.target.value, 'assign', c.assignees.length === 0 ? 'lead' : 'assignee')}
                      >
                        <option value="">+ {L({ ar: 'تعيين', en: 'Assign' })}</option>
                        {unassigned.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name || m.email} ({m.activeCases})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

/* ─────────────────────────── Settings ─────────────────────────── */

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
        <div className="flex flex-col gap-3 sm:flex-row"><select value={transferTarget} onChange={(event) => setTransferTarget(event.target.value)} className="h-10 flex-1 rounded-xl border bg-background px-3 text-sm"><option value="">{L({ ar: 'اختر المالك الجديد', en: 'Select the new owner' })}</option>{memberships.filter((membership) => !membership.isOwner && membership.status === 'active' && ['lawyer', 'staff'].includes(membership.role)).map((membership) => <option key={membership.userId} value={membership.userId}>{membership.user.name || membership.user.email} — {membership.role}</option>)}</select><Button type="button" variant="destructive" onClick={transferOwnership} disabled={!transferTarget || transferring}>{transferring ? L({ ar: 'جارٍ النقل...', en: 'Transferring...' }) : L({ ar: 'نقل الملكية', en: 'Transfer ownership' })}</Button></div>
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
