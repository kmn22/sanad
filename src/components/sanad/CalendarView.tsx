'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CalendarClock,
  Gavel,
  CheckCircle2,
  ShieldAlert,
  MessageSquare,
  Calendar,
  Clock,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import { daysUntil, formatDate } from '@/lib/sanad/types'

// ---- Types ----

interface CalendarEvent {
  id: string
  date: string // ISO
  title: string
  type: 'case_deadline' | 'hearing' | 'task' | 'compliance' | 'communication'
  label: string
  color: 'amber' | 'purple' | 'rose' | 'cyan' | 'slate'
  refId?: string
  sub?: string
}

interface Props {
  onNavigate?: (view: string, refId?: string) => void
}

type FilterKey = 'today' | 'tomorrow' | 'this_week' | 'next_30' | 'past'

// ---- Static lookups ----

const TYPE_ICON: Record<CalendarEvent['type'], typeof CalendarClock> = {
  case_deadline: CalendarClock,
  hearing: Gavel,
  task: CheckCircle2,
  compliance: ShieldAlert,
  communication: MessageSquare,
}

const COLOR_BORDER: Record<CalendarEvent['color'], string> = {
  amber: 'border-s-amber-400 bg-amber-50/50 dark:bg-amber-950/20',
  purple: 'border-s-purple-400 bg-purple-50/50 dark:bg-purple-950/20',
  rose: 'border-s-rose-400 bg-rose-50/50 dark:bg-rose-950/20',
  cyan: 'border-s-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20',
  slate: 'border-s-slate-400 bg-slate-50/50 dark:bg-slate-950/20',
}

const COLOR_ICON: Record<CalendarEvent['color'], string> = {
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40',
  purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40',
  rose: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40',
  cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/40',
  slate: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/40',
}

const COLOR_BADGE: Record<CalendarEvent['color'], string> = {
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
  slate: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
}

// Map an event type to the destination Sanad view name (used by onNavigate)
const TYPE_VIEW: Record<CalendarEvent['type'], string> = {
  case_deadline: 'cases',
  hearing: 'cases',
  task: 'tasks',
  compliance: 'compliance',
  communication: 'communications',
}

const FILTERS: FilterKey[] = ['today', 'tomorrow', 'this_week', 'next_30', 'past']

// ---- Component ----

export function CalendarView({ onNavigate }: Props) {
  const { lang, t } = useLang()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('today')

  // Number formatter (Arabic-Indic digits when lang === 'ar')
  const fmt = (n: number) => (lang === 'ar' ? n.toLocaleString('ar-EG') : n.toString())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/calendar')
        if (!res.ok) throw new Error('Failed to fetch calendar')
        const json = await res.json()
        if (!cancelled) setEvents((json.events as CalendarEvent[]) ?? [])
      } catch (e) {
        console.error('Failed to load calendar:', e)
        if (!cancelled) toast.error(t('common.failed'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // ---- Filter counts + active set ----

  const counts = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()

    const inRange = (ev: CalendarEvent, days: number) => {
      const d = daysUntil(ev.date)
      return d >= 0 && d <= days
    }

    return {
      today: events.filter((e) => new Date(e.date).toDateString() === todayStr).length,
      tomorrow: events.filter((e) => new Date(e.date).toDateString() === tomorrowStr).length,
      this_week: events.filter((e) => inRange(e, 7)).length,
      next_30: events.filter((e) => inRange(e, 30)).length,
      past: events.filter((e) => daysUntil(e.date) < 0).length,
    }
  }, [events])

  const filtered = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()

    const inRange = (ev: CalendarEvent, days: number) => {
      const d = daysUntil(ev.date)
      return d >= 0 && d <= days
    }

    switch (filter) {
      case 'today':
        return events.filter((e) => new Date(e.date).toDateString() === todayStr)
      case 'tomorrow':
        return events.filter((e) => new Date(e.date).toDateString() === tomorrowStr)
      case 'this_week':
        return events.filter((e) => inRange(e, 7))
      case 'next_30':
        return events.filter((e) => inRange(e, 30))
      case 'past':
        return events.filter((e) => daysUntil(e.date) < 0)
    }
  }, [events, filter])

  // Group filtered events by date (yyyy-mm-dd) — preserves ascending sort from API
  const grouped = useMemo(() => {
    const buckets = new Map<string, CalendarEvent[]>()
    for (const ev of filtered) {
      const key = new Date(ev.date).toDateString()
      const arr = buckets.get(key)
      if (arr) arr.push(ev)
      else buckets.set(key, [ev])
    }
    return Array.from(buckets.entries())
  }, [filtered])

  // Breakdown by type for the stats summary
  const typeBreakdown = useMemo(() => {
    const map = new Map<CalendarEvent['type'], number>()
    for (const ev of events) map.set(ev.type, (map.get(ev.type) ?? 0) + 1)
    return map
  }, [events])

  const filterLabel = (key: FilterKey) => {
    const labelKey =
      key === 'today'
        ? 'cal.today'
        : key === 'tomorrow'
          ? 'cal.tomorrow'
          : key === 'this_week'
            ? 'cal.this_week'
            : key === 'next_30'
              ? 'cal.next_30'
              : 'cal.past'
    return `${t(labelKey)} (${fmt(counts[key])})`
  }

  const handleNavigate = (ev: CalendarEvent) => {
    if (!ev.refId) return
    onNavigate?.(TYPE_VIEW[ev.type], ev.refId)
  }

  // ---- Render ----

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t('cal.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('cal.subtitle')}</p>
      </div>

      {/* Stats summary */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-xs gap-1">
          <Calendar className="h-3 w-3" />
          {t('cal.events_count', { n: fmt(events.length) })}
        </Badge>
        {(
          [
            'case_deadline',
            'hearing',
            'task',
            'compliance',
            'communication',
          ] as const
        ).map((tp) => {
          const n = typeBreakdown.get(tp) ?? 0
          if (n === 0) return null
          const Icon = TYPE_ICON[tp]
          // Pick a representative color per type for the badge
          const repColor: CalendarEvent['color'] =
            tp === 'case_deadline'
              ? 'amber'
              : tp === 'hearing'
                ? 'purple'
                : tp === 'compliance'
                  ? 'rose'
                  : tp === 'communication'
                    ? 'cyan'
                    : 'slate'
          return (
            <Badge
              key={tp}
              variant="outline"
              className={`text-[10px] px-1.5 py-0 gap-1 ${COLOR_BADGE[repColor]}`}
            >
              <Icon className="h-2.5 w-2.5" />
              {t(`cal.types.${tp}`)}
              <span className="ms-0.5 tabular-nums">{fmt(n)}</span>
            </Badge>
          )
        })}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((key) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
            className="h-7 text-xs"
          >
            {filterLabel(key)}
          </Button>
        ))}
      </div>

      {/* Grouped events */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
            {loading ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40 animate-pulse" />
                {t('cal.title')}
              </div>
            ) : grouped.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                {t('cal.no_events')}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {grouped.map(([dayKey, dayEvents]) => (
                  <div key={dayKey} className="px-4 py-3">
                    <DateHeader dateStr={dayEvents[0].date} />
                    <ul className="mt-2 space-y-2">
                      {dayEvents.map((ev) => (
                        <EventCard
                          key={ev.id}
                          ev={ev}
                          onNavigate={handleNavigate}
                          fmt={fmt}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Sub-components ----

function DateHeader({ dateStr }: { dateStr: string }) {
  const { lang, t } = useLang()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const d = new Date(dateStr)
  const cmp = new Date(d)
  cmp.setHours(0, 0, 0, 0)

  let label: string
  let tone = 'text-foreground'
  if (cmp.getTime() === today.getTime()) {
    label = t('cal.today')
    tone = 'text-primary font-semibold'
  } else if (cmp.getTime() === tomorrow.getTime()) {
    label = t('cal.tomorrow')
    tone = 'text-primary font-semibold'
  } else {
    label = d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  return (
    <div className="flex items-center gap-2">
      <h3 className={`text-sm ${tone}`}>{label}</h3>
      <span className="text-[11px] text-muted-foreground">
        {formatDate(dateStr, lang)}
      </span>
    </div>
  )
}

function EventCard({
  ev,
  onNavigate,
  fmt,
}: {
  ev: CalendarEvent
  onNavigate: (ev: CalendarEvent) => void
  fmt: (n: number) => string
}) {
  const { lang, t } = useLang()
  const Icon = TYPE_ICON[ev.type]
  const color = ev.color

  const days = daysUntil(ev.date)
  const overdue = days < 0
  const isToday = days === 0
  const soon = !overdue && !isToday && days <= 7

  const time = new Date(ev.date).toLocaleTimeString(
    lang === 'ar' ? 'ar-SA' : 'en-GB',
    { hour: '2-digit', minute: '2-digit' },
  )

  const daysText = overdue
    ? t('dash.d_overdue', { n: fmt(Math.abs(days)) })
    : isToday
      ? t('cal.today')
      : t('dash.d_left', { n: fmt(days) })

  const daysTone = overdue
    ? 'text-rose-600 dark:text-rose-400 font-medium'
    : isToday
      ? 'text-primary font-medium'
      : soon
        ? 'text-amber-600 dark:text-amber-400 font-medium'
        : 'text-muted-foreground'

  const clickable = !!ev.refId

  return (
    <li>
      <div
        onClick={() => clickable && onNavigate(ev)}
        className={[
          'rounded-lg border-s-4 p-3 transition-colors',
          COLOR_BORDER[color],
          clickable
            ? 'cursor-pointer hover:border-primary/40 hover:bg-muted/30'
            : '',
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          {/* Type icon (color-tinted) */}
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${COLOR_ICON[color]}`}
          >
            <Icon className="h-4 w-4" />
          </span>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${COLOR_BADGE[color]}`}
              >
                {t(`cal.types.${ev.type}`)}
              </Badge>
              {overdue && (
                <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {t('dash.d_overdue', { n: fmt(Math.abs(days)) })}
                </span>
              )}
            </div>

            <p className="text-sm font-medium mt-1 truncate text-start">
              {ev.title}
            </p>

            {ev.sub && (
              <p className="text-xs text-muted-foreground truncate text-start mt-0.5">
                {ev.sub}
              </p>
            )}

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(ev.date, lang)}
              </span>
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {time}
              </span>
              {!overdue && (
                <span className={`text-[11px] inline-flex items-center gap-1 ${daysTone}`}>
                  {daysText}
                </span>
              )}
            </div>
          </div>

          {/* Navigation chevron */}
          {clickable && (
            <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground mt-1 rtl:rotate-180" />
          )}
        </div>
      </div>
    </li>
  )
}

export default CalendarView
