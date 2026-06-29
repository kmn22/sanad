'use client'

import { useEffect, useState, useMemo } from 'react'
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
  Trophy,
  TrendingUp,
  Users,
  Receipt,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { useLang } from '@/lib/sanad/i18n'
import { AiSearchChat } from './AiSearchChat'
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

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const weeklyChartData = useMemo(() => {
    const days: any[] = []
    const locale = lang === 'ar' ? 'ar-SA' : 'en-US'
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const dateStr = d.toDateString()
      const dayLabel = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })

      const dayEntries = data.timeEntries.filter(
        (entry) => new Date(entry.date).toDateString() === dateStr
      )
      const billableHours = dayEntries
        .filter((e) => e.billable)
        .reduce((sum, e) => sum + e.durationSec / 3600, 0)
      const focusHours = dayEntries
        .filter((e) => !e.billable && e.sessionType === 'focus')
        .reduce((sum, e) => sum + e.durationSec / 3600, 0)

      days.push({
        name: dayLabel,
        [lang === 'ar' ? 'ساعات فوترة' : 'Billable Hours']: Number(billableHours.toFixed(1)),
        [lang === 'ar' ? 'ساعات تركيز' : 'Focus Hours']: Number(focusHours.toFixed(1)),
      })
    }
    return days
  }, [data.timeEntries, lang])

  const invoiceChartData = useMemo(() => {
    const paid = data.invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0)
    const outstanding = data.invoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + (i.total - i.paidAmount), 0)

    return [
      { name: lang === 'ar' ? 'مدفوعة' : 'Paid', value: paid, color: 'oklch(0.42 0.09 160)' },
      { name: lang === 'ar' ? 'مستحقة' : 'Outstanding', value: outstanding, color: 'oklch(0.78 0.15 85)' },
    ]
  }, [data.invoices, lang])

  // Compliance expiry: weekly buckets across next 90 days
  const complianceTimelineData = useMemo(() => {
    const buckets: { label: string; count: number; tone: 'urgent' | 'soon' | 'ok' }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const all = data.compliance?.all ?? []
    for (let week = 0; week < 13; week++) {
      const start = new Date(today)
      start.setDate(start.getDate() + week * 7)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      const count = all.filter((c) => {
        const exp = new Date(c.expiryDate)
        return exp >= start && exp < end
      }).length
      const label =
        week === 0
          ? lang === 'ar' ? 'هذا الأسبوع' : 'This wk'
          : lang === 'ar' ? `+${week} أسبوع` : `+${week}w`
      const tone = week < 2 ? 'urgent' : week < 6 ? 'soon' : 'ok'
      buckets.push({ label, count, tone })
    }
    return buckets
  }, [data.compliance, lang])

  const caseTypeChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    data.cases?.all?.forEach(c => {
      counts[c.caseType] = (counts[c.caseType] || 0) + 1
    })
    
    // Generate distinct colors
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b']
    
    return Object.entries(counts).map(([type, count], i) => ({
      name: t(`ctype.${type}`),
      value: count,
      color: colors[i % colors.length]
    }))
  }, [data.cases, t])

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
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <FileText className="mx-1.5 h-4 w-4" /> {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Button>
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label={lang === 'ar' ? 'معدل كسب القضايا' : 'Case Win Rate'} value={`${stats.winRate}%`} icon={<Trophy className="h-4 w-4 text-amber-500" />} />
        <KpiCard label={lang === 'ar' ? 'توقعات الإيرادات' : 'Revenue Forecast'} value={formatSAR(stats.revenueForecast, lang)} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
        <KpiCard label={lang === 'ar' ? 'إجمالي العملاء' : 'Total Clients'} value={stats.totalClients} icon={<Users className="h-4 w-4" />} onClick={() => onNavigate('clients')} />
        <KpiCard label={lang === 'ar' ? 'الفواتير المستحقة' : 'Outstanding Invoices'} value={stats.outstandingInvoices} sub={formatSAR(stats.outstandingSAR, lang)} icon={<Receipt className="h-4 w-4 text-rose-500" />} onClick={() => onNavigate('invoices')} />
      </div>

      {/* Visual Analytics section */}
      {isMounted && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {lang === 'ar' ? 'تحليل ساعات العمل والتركيز الأسبوعي' : 'Weekly Billable & Focus Hours Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey={lang === 'ar' ? 'ساعات فوترة' : 'Billable Hours'} stackId="a" fill="oklch(0.42 0.09 160)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey={lang === 'ar' ? 'ساعات تركيز' : 'Focus Hours'} stackId="a" fill="oklch(0.7 0.13 160)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {lang === 'ar' ? 'تحصيل وتوزيع الفواتير' : 'Invoice Payment Distribution'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex flex-col justify-center items-center pt-2">
              {invoiceChartData.every(d => d.value === 0) ? (
                <div className="text-xs text-muted-foreground py-8 text-center">
                  {lang === 'ar' ? 'لا توجد بيانات فواتير كافية' : 'Insufficient invoice data'}
                </div>
              ) : (
                <>
                  <div className="relative h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={invoiceChartData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {invoiceChartData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => formatSAR(Number(value), lang)}
                          contentStyle={{
                            background: 'var(--card)',
                            borderColor: 'var(--border)',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'المجموع المستحق' : 'Total Outstanding'}</span>
                      <span className="text-sm font-bold mt-0.5">{formatSAR(stats.outstandingSAR, lang)}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs mt-2 justify-center">
                    {invoiceChartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {lang === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `SAR ${value/1000}k`} />
                  <Tooltip
                    formatter={(value: any) => formatSAR(Number(value), lang)}
                    contentStyle={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="oklch(0.42 0.09 160)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gavel className="h-4 w-4 text-primary" />
                {lang === 'ar' ? 'توزيع القضايا حسب النوع' : 'Cases by Type'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex flex-col justify-center items-center pt-2">
              {caseTypeChartData.length === 0 ? (
                <div className="text-xs text-muted-foreground py-8 text-center">
                  {lang === 'ar' ? 'لا توجد قضايا حالياً' : 'No cases found'}
                </div>
              ) : (
                <>
                  <div className="relative h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={caseTypeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {caseTypeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'var(--card)',
                            borderColor: 'var(--border)',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'إجمالي القضايا' : 'Total Cases'}</span>
                      <span className="text-sm font-bold mt-0.5">{data.cases?.all?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs mt-2 justify-center flex-wrap">
                    {caseTypeChartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Compliance Expiry Timeline — next 90 days */}
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                {lang === 'ar' ? 'جدول انتهاء الالتزامات — 90 يوماً' : 'Compliance Expiry — Next 90 Days'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56 pt-2">
              {complianceTimelineData.every((b) => b.count === 0) ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  {lang === 'ar' ? 'لا توجد التزامات قادمة' : 'No upcoming items'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={complianceTimelineData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.78 0.15 60)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="oklch(0.78 0.15 60)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="label" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: any) => [v, lang === 'ar' ? 'بنود منتهية' : 'Items expiring']}
                    />
                    <Area type="monotone" dataKey="count" stroke="oklch(0.65 0.15 60)" strokeWidth={2} fill="url(#complianceGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

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

        {/* Right col: daily brief + AI Search */}
        <div className="flex flex-col gap-6">
          <AiSearchChat />
          
          <Card className="flex-1">
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
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="text-start w-full">
      <Card className={`transition-colors h-full ${onClick ? 'hover:border-primary/40 hover:shadow-sm cursor-pointer' : ''}`}>
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
