'use client'

import Link from 'next/link'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, AlertTriangle, Banknote, Briefcase, CalendarClock, Clock, FileText, Gavel, Mail, UserPlus, Users, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/sanad/i18n'
import { PortalPageHeader, StatTile, useBilingual } from '@/components/portal/PortalShell'
import { sar } from './shared'
import { FirmLoading } from './shared'
import { ROLE_LABELS } from './shared'
import { STAGE_LABELS } from './shared'
import { useFirm } from './shared'
import { Panel } from './shared'

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
