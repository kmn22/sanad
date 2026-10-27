'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Pause, Play, Square, Timer as TimerIcon, Clock, TrendingUp, Brain, History } from 'lucide-react'
import { formatDate, formatDuration, formatSAR } from '@/lib/sanad/types'
import { Stat } from './Stat'
import type { DeepWorkState } from './use-deep-work'

export function DeepWorkGrid({ v }: { v: DeepWorkState }) {
  const { cases, timeEntries, lang, t, state, setState, displaySec, start, pause, stop, setMode, setDuration, billableTodaySec, focusTodaySec, billableTodaySAR, focusSessionsToday, modeMeta, ModeIcon, circleRadius, circleCircumference, strokeOffset, fmtTime } = v
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TimerIcon className="h-4 w-4" />
                {t('dw.active_session')}
              </CardTitle>
              <Badge variant="outline" className={`${modeMeta[state.mode].color}`}>
                <ModeIcon className="h-3 w-3 mx-1" />
                {modeMeta[state.mode].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mode tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {(['focus', 'billable', 'break'] as const).map((m) => {
                const Icon = modeMeta[m].icon
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      state.mode === m ? `${modeMeta[m].ring} bg-primary/5` : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${state.mode === m ? modeMeta[m].color : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium">{modeMeta[m].label}</span>
                  </button>
                )
              })}
            </div>

            {/* Circular timer */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg width="300" height="300" viewBox="0 0 300 300" className="-rotate-90">
                  <circle cx="150" cy="150" r={circleRadius} fill="none" stroke="var(--muted)" strokeWidth="10" />
                  <circle
                    cx="150"
                    cy="150"
                    r={circleRadius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeOffset}
                    style={{ transition: state.running ? 'stroke-dashoffset 0.25s linear' : 'none' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-mono font-semibold tabular-nums" dir="ltr">
                    {fmtTime(displaySec)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {state.running ? t('dw.in_progress') : t('dw.paused')}
                  </p>
                </div>
              </div>
            </div>

            {/* Duration presets */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {[15, 25, 45, 60, 90].map((min) => (
                <Button
                  key={min}
                  variant={state.total === min * 60 ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  disabled={state.running}
                  onClick={() => setDuration(min)}
                >
                  {lang === 'ar' ? min.toLocaleString('ar-EG') : min}{lang === 'ar' ? 'د' : 'm'}
                </Button>
              ))}
            </div>

            {/* Session metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="t-desc" className="text-xs">{t('dw.what_working')}</Label>
                <Input
                  id="t-desc"
                  value={state.description}
                  onChange={(e) => setState({ ...state, description: e.target.value })}
                  placeholder={t('dw.what_ph')}
                  disabled={state.running}
                />
              </div>
              {state.mode === 'billable' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-case" className="text-xs">{t('dw.bill_to_case')}</Label>
                    <Select
                      value={state.caseId || ''}
                      onValueChange={(v) => setState({ ...state, caseId: v })}
                      disabled={state.running}
                    >
                      <SelectTrigger id="t-case"><SelectValue placeholder={t('dw.select_case')} /></SelectTrigger>
                      <SelectContent>
                        {cases.filter((c) => c.stage !== 'closed').map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-rate" className="text-xs">{t('dw.hourly_rate')}</Label>
                    <Input
                      id="t-rate"
                      type="number"
                      value={state.hourlyRate}
                      onChange={(e) => setState({ ...state, hourlyRate: parseFloat(e.target.value) || 0 })}
                      disabled={state.running}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2">
              {!state.running ? (
                <Button size="lg" onClick={start} className="min-w-32">
                  <Play className="mx-1.5 h-4 w-4" /> {t('dw.start')}
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={pause} className="min-w-32">
                  <Pause className="mx-1.5 h-4 w-4" /> {t('dw.pause')}
                </Button>
              )}
              <Button size="lg" variant="destructive" onClick={stop} disabled={!state.running && state.remaining === state.total}>
                <Square className="mx-1.5 h-4 w-4" /> {t('dw.stop_save')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> {t('dw.today')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Stat label={t('dw.billable_hours')} value={formatDuration(billableTodaySec, lang)} icon={<Clock className="h-3.5 w-3.5" />} />
              <Stat label={t('dw.focus_time')} value={formatDuration(focusTodaySec, lang)} icon={<Brain className="h-3.5 w-3.5" />} />
              <Stat label={t('dw.focus_sessions')} value={focusSessionsToday.toLocaleString('ar-EG')} icon={<TimerIcon className="h-3.5 w-3.5" />} />
              <Separator />
              <div className="pt-1">
                <p className="text-xs text-muted-foreground mb-1">{t('dw.billable_revenue')}</p>
                <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{formatSAR(billableTodaySAR, lang)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" /> {t('dw.recent_sessions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] px-2 scroll-thin">
                <div className="space-y-2">
                  {timeEntries.slice(0, 15).map((e) => (
                    <div key={e.id} className="rounded-md border border-border p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-medium truncate flex-1">{e.description}</p>
                        <span className="text-xs font-mono" dir="ltr">{formatDuration(e.durationSec, lang)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            e.sessionType === 'billable' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                            e.sessionType === 'focus' ? 'bg-primary/10 text-primary' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}
                        >
                          {t(`session.${e.sessionType}`)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(e.date, lang)}</span>
                      </div>
                      {e.billable && e.hourlyRate && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                          {formatSAR((e.durationSec / 3600) * e.hourlyRate, lang)}
                        </p>
                      )}
                    </div>
                  ))}
                  {timeEntries.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">{t('dw.no_sessions')}</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
