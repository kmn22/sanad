'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Newspaper,
  Timer,
  Zap,
} from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import {
  COMPLIANCE_COLORS,
  DOC_STATUS_COLORS,
  PRIORITY_COLORS,
  SOURCE_COLORS,
  daysUntil,
  formatDate,
  formatDuration,
  formatSAR,
  formatHijri,
  type DashboardData,
} from '@/lib/sanad/types'

interface Props {
  data: DashboardData
  onNavigate: (view: string) => void
}

export function DashboardView({ data, onNavigate }: Props) {
  const { lang, t } = useLang()
  const { stats } = data
  const now = new Date()
  const hour = now.getHours()
  const greetingKey = hour < 12 ? 'greeting.morning' : hour < 17 ? 'greeting.afternoon' : 'greeting.evening'

  return (
    <div className="space-y-6">
      {/* Morning greeting + date band */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {t(greetingKey)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            <span className="mx-2 text-muted-foreground/40">•</span>
            <span className="text-muted-foreground">{formatHijri(now, lang)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onNavigate('deepwork')}>
            <Timer className="mx-1.5 h-4 w-4" /> {t('dash.start_focus')}
          </Button>
          <Button size="sm" onClick={() => onNavigate('tasks')}>
            <CheckCircle2 className="mx-1.5 h-4 w-4" /> {t('dash.tasks_count', { n: stats.openTasks })}
          </Button>
        </div>
      </div>

      {/* Critical alerts row — the actual "morning hooks" */}
      {(stats.overdueTasks > 0 || stats.expiringCompliance > 0 || stats.urgentCases > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.overdueTasks > 0 && (
            <button
              onClick={() => onNavigate('tasks')}
              className="text-start rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 p-4 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-medium text-rose-700 dark:text-rose-300">{t('dash.overdue_tasks')}</span>
              </div>
              <p className="text-2xl font-semibold text-rose-700 dark:text-rose-300">{stats.overdueTasks}</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">{t('dash.needs_attention')}</p>
            </button>
          )}
          {stats.expiringCompliance > 0 && (
            <button
              onClick={() => onNavigate('compliance')}
              className="text-start rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('dash.expiring_soon')}</span>
              </div>
              <p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">{stats.expiringCompliance}</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">{t('dash.compliance_30')}</p>
            </button>
          )}
          {stats.urgentCases > 0 && (
            <button
              onClick={() => onNavigate('cases')}
              className="text-start rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-900 p-4 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('dash.urgent_cases')}</span>
              </div>
              <p className="text-2xl font-semibold text-purple-700 dark:text-purple-300">{stats.urgentCases}</p>
              <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">{t('dash.same_day')}</p>
            </button>
          )}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label={t('dash.active_cases')} value={stats.activeCases} icon={<Gavel className="h-4 w-4" />} onClick={() => onNavigate('cases')} />
        <KpiCard label={t('dash.open_tasks')} value={stats.openTasks} sub={stats.todayTasks ? `${stats.todayTasks} ${t('dash.due_today')}` : undefined} icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => onNavigate('tasks')} />
        <KpiCard label={t('dash.billable_today')} value={formatDuration(stats.billableTodaySec, lang)} sub={formatSAR(stats.billableTodaySAR, lang)} icon={<Clock className="h-4 w-4" />} onClick={() => onNavigate('deepwork')} />
        <KpiCard label={t('dash.focus_today')} value={formatDuration(stats.focusTodaySec, lang)} icon={<Timer className="h-4 w-4" />} onClick={() => onNavigate('deepwork')} />
      </div>

      {/* Two-column main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left col: today's tasks + expiring compliance */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t('dash.todays_priorities')}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('tasks')}>
                  {t('dash.view_all')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {data.tasks.today.length === 0 && data.tasks.overdue.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {t('dash.no_tasks_today')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {(() => {
                    const seen = new Set<string>()
                    return [...data.tasks.overdue, ...data.tasks.today]
                      .filter((task) => {
                        if (seen.has(task.id)) return false
                        seen.add(task.id)
                        return true
                      })
                      .slice(0, 6)
                  })().map((task) => {
                    const days = task.dueDate ? daysUntil(task.dueDate) : 0
                    const overdue = days < 0
                    return (
                      <li key={task.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]?.dot || 'bg-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[task.priority]?.color}`}>
                              {t(`prio.${task.priority}`)}
                            </Badge>
                            {task.dueDate && (
                              <span className={`text-[10px] ${overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground'}`}>
                                {overdue ? t('dash.d_overdue', { n: Math.abs(days) }) : formatDate(task.dueDate, lang)}
                              </span>
                            )}
                            {task.autoGen && (
                              <span className="text-[10px] text-muted-foreground/70 italic">{t('tasks.auto_badge')}</span>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-amber-600" />
                  {t('dash.expiring_compliance')}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('compliance')}>
                  {t('dash.view_all')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {data.compliance.expiringSoon.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {t('dash.nothing_expiring')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.compliance.expiringSoon.slice(0, 5).map((c) => {
                    const days = daysUntil(c.expiryDate)
                    const pct = Math.max(5, Math.min(100, (days / 90) * 100))
                    return (
                      <li key={c.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{c.entityName}</p>
                            <span className={`text-xs font-semibold ${days <= 7 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {days < 0 ? t('comp.days_overdue', { n: Math.abs(days) }) : t('comp.days_left', { n: days })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${COMPLIANCE_COLORS[c.category] || 'bg-muted'}`}>
                              {t(`cat.${c.category}`)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{c.title}</span>
                          </div>
                          <Progress value={pct} className="h-1 mt-1.5" />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right col: daily brief */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                {t('dash.daily_brief')}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{t('dash.brief_subtitle')}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[420px] px-2 scroll-thin">
                <div className="space-y-3">
                  {data.briefs.map((b, i) => (
                    <div key={b.id}>
                      {i > 0 && <Separator className="my-3" />}
                      <article className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${SOURCE_COLORS[b.source] || 'bg-muted'}`}>
                            {t(`src.${b.source}`)}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{formatDate(b.publishedAt, lang)}</span>
                        </div>
                        <h4 className="text-sm font-semibold leading-tight">{b.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{b.summary}</p>
                        {b.url && (
                          <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                            {t('dash.read_more')}
                          </a>
                        )}
                      </article>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: docs needing attention */}
      {data.documents.expiring.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                {t('dash.docs_expiring')}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('documents')}>
                {t('dash.view_all')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.documents.expiring.slice(0, 6).map((d) => {
                const days = d.expiryDate ? daysUntil(d.expiryDate) : 0
                return (
                  <button
                    key={d.id}
                    onClick={() => onNavigate('documents')}
                    className="text-start p-3 rounded-md border border-border hover:border-primary/50 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${DOC_STATUS_COLORS[d.status]}`}>
                        {t(`dstatus.${d.status}`)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{d.parties}</p>
                    <p className={`text-xs mt-1 font-medium ${days <= 7 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {days < 0 ? t('dash.d_overdue', { n: Math.abs(days) }) : t('dash.d_left', { n: days })}
                    </p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  onClick,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="text-start">
      <Card className="hover:border-primary/40 hover:shadow-sm transition-all h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-muted-foreground">{icon}</span>
          </div>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </CardContent>
      </Card>
    </button>
  )
}
