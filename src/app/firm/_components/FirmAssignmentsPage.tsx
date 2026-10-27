'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Briefcase, UserPlus, UsersRound, X } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { PortalPageHeader, StatTile, useBilingual } from '@/components/portal/PortalShell'
import { FirmLoading } from './shared'
import { ROLE_LABELS } from './shared'
import { STAGE_LABELS } from './shared'
import { useFirm } from './shared'

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
