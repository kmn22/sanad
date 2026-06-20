'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Pause,
  Play,
  Square,
  Timer as TimerIcon,
  Clock,
  Coffee,
  TrendingUp,
  DollarSign,
  Brain,
  History,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  formatDate,
  formatDuration,
  formatSAR,
  type LegalCase,
  type TimeEntry,
} from '@/lib/sanad/types'

interface Props {
  cases: LegalCase[]
  timeEntries: TimeEntry[]
  onChange: () => void
}

const STORAGE_KEY = 'sanad.timer.state.v1'

interface TimerState {
  mode: 'focus' | 'billable' | 'break'
  remaining: number // seconds remaining (when paused)
  total: number // total target seconds
  running: boolean
  startedAt: number | null // epoch ms when started
  description: string
  caseId: string | null
  hourlyRate: number
}

const DEFAULT_STATE: TimerState = {
  mode: 'focus',
  remaining: 25 * 60,
  total: 25 * 60,
  running: false,
  startedAt: null,
  description: '',
  caseId: null,
  hourlyRate: 850,
}

function loadState(): TimerState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as TimerState
    // If was running and time elapsed during browser close, recompute remaining
    if (parsed.running && parsed.startedAt) {
      const elapsed = Math.floor((Date.now() - parsed.startedAt) / 1000)
      const left = parsed.total - elapsed
      if (left <= 0) {
        // Session completed while away — auto-save
        return { ...DEFAULT_STATE }
      }
      return { ...parsed, remaining: left }
    }
    return parsed
  } catch {
    return DEFAULT_STATE
  }
}

export function DeepWorkView({ cases, timeEntries, onChange }: Props) {
  const [state, setState] = useState<TimerState>(DEFAULT_STATE)
  const [now, setNow] = useState(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadState())
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Ticking
  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(() => setNow(Date.now()), 250)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.running])

  const elapsedSec = state.running && state.startedAt
    ? Math.floor((now - state.startedAt) / 1000)
    : 0
  const displaySec = state.running ? Math.max(0, state.total - elapsedSec) : state.remaining
  const progressPct = state.total > 0 ? ((state.total - displaySec) / state.total) * 100 : 0

  // Auto-complete
  useEffect(() => {
    if (state.running && displaySec === 0) {
      completeSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySec])

  const start = () => {
    setState({
      ...state,
      running: true,
      startedAt: Date.now(),
    })
  }
  const pause = () => {
    setState({
      ...state,
      running: false,
      startedAt: null,
      remaining: displaySec,
    })
  }
  const stop = async () => {
    // Save partial session if at least 1 min elapsed
    const elapsedTotal = state.total - displaySec
    if (elapsedTotal >= 60) {
      await saveSession(elapsedTotal)
    }
    setState({ ...DEFAULT_STATE })
    toast.info('Session stopped')
  }
  const completeSession = async () => {
    await saveSession(state.total)
    setState({ ...DEFAULT_STATE })
    toast.success(`${state.mode === 'focus' ? 'Focus' : state.mode === 'billable' ? 'Billable' : 'Break'} session complete!`)
  }

  const saveSession = async (durationSec: number) => {
    const isBillable = state.mode === 'billable'
    const payload = {
      caseId: isBillable ? state.caseId : null,
      description: state.description || (state.mode === 'focus' ? 'Focus session' : isBillable ? 'Billable session' : 'Break'),
      durationSec,
      billable: isBillable,
      hourlyRate: isBillable ? state.hourlyRate : null,
      sessionType: state.mode,
      date: new Date().toISOString(),
    }
    try {
      await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      onChange()
    } catch {
      toast.error('Failed to save session')
    }
  }

  const setMode = (mode: 'focus' | 'billable' | 'break') => {
    const presets = { focus: 25 * 60, billable: 60 * 60, break: 5 * 60 }
    setState({
      ...state,
      mode,
      total: presets[mode],
      remaining: presets[mode],
      running: false,
      startedAt: null,
    })
  }

  const setDuration = (min: number) => {
    const sec = min * 60
    setState({ ...state, total: sec, remaining: sec, running: false, startedAt: null })
  }

  // Today's stats
  const todayStr = new Date().toDateString()
  const todayEntries = timeEntries.filter((t) => new Date(t.date).toDateString() === todayStr)
  const billableTodaySec = todayEntries.filter((t) => t.billable).reduce((s, t) => s + t.durationSec, 0)
  const focusTodaySec = todayEntries.filter((t) => !t.billable && t.sessionType === 'focus').reduce((s, t) => s + t.durationSec, 0)
  const billableTodaySAR = todayEntries
    .filter((t) => t.billable)
    .reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)
  const focusSessionsToday = todayEntries.filter((t) => t.sessionType === 'focus').length

  const modeMeta = {
    focus: { label: 'Deep Focus', icon: Brain, color: 'text-primary', ring: 'border-primary' },
    billable: { label: 'Billable', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', ring: 'border-emerald-500' },
    break: { label: 'Break', icon: Coffee, color: 'text-amber-600 dark:text-amber-400', ring: 'border-amber-500' },
  }
  const ModeIcon = modeMeta[state.mode].icon

  const circleRadius = 130
  const circleCircumference = 2 * Math.PI * circleRadius
  const strokeOffset = circleCircumference - (progressPct / 100) * circleCircumference

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Deep Work &amp; Billing</h2>
        <p className="text-sm text-muted-foreground">
          Pomodoro focus sessions + billable hours tied to client files. Timer state persists locally between visits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TimerIcon className="h-4 w-4" />
                Active session
              </CardTitle>
              <Badge variant="outline" className={`${modeMeta[state.mode].color}`}>
                <ModeIcon className="h-3 w-3 mr-1" />
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
                      state.mode === m
                        ? `${modeMeta[m].ring} bg-primary/5`
                        : 'border-border hover:border-muted-foreground/30'
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
                  <p className="text-5xl font-mono font-semibold tabular-nums">
                    {Math.floor(displaySec / 3600).toString().padStart(2, '0')}:
                    {Math.floor((displaySec % 3600) / 60).toString().padStart(2, '0')}:
                    {(displaySec % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {state.running ? 'In progress' : 'Paused'}
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
                  {min}m
                </Button>
              ))}
            </div>

            {/* Session metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="t-desc" className="text-xs">What are you working on?</Label>
                <Input
                  id="t-desc"
                  value={state.description}
                  onChange={(e) => setState({ ...state, description: e.target.value })}
                  placeholder="e.g. Drafting SPA revisions — Gulf Pharma"
                  disabled={state.running}
                />
              </div>
              {state.mode === 'billable' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-case" className="text-xs">Bill to case</Label>
                    <Select
                      value={state.caseId || ''}
                      onValueChange={(v) => setState({ ...state, caseId: v })}
                      disabled={state.running}
                    >
                      <SelectTrigger id="t-case"><SelectValue placeholder="Select case" /></SelectTrigger>
                      <SelectContent>
                        {cases.filter((c) => c.stage !== 'closed').map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-rate" className="text-xs">Hourly rate (SAR)</Label>
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
                  <Play className="mr-1.5 h-4 w-4" /> Start
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={pause} className="min-w-32">
                  <Pause className="mr-1.5 h-4 w-4" /> Pause
                </Button>
              )}
              <Button size="lg" variant="destructive" onClick={stop} disabled={!state.running && state.remaining === state.total}>
                <Square className="mr-1.5 h-4 w-4" /> Stop &amp; save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Stat label="Billable hours" value={formatDuration(billableTodaySec)} icon={<Clock className="h-3.5 w-3.5" />} />
              <Stat label="Focus time" value={formatDuration(focusTodaySec)} icon={<Brain className="h-3.5 w-3.5" />} />
              <Stat label="Focus sessions" value={String(focusSessionsToday)} icon={<TimerIcon className="h-3.5 w-3.5" />} />
              <Separator />
              <div className="pt-1">
                <p className="text-xs text-muted-foreground mb-1">Billable revenue today</p>
                <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{formatSAR(billableTodaySAR)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" /> Recent sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] -mx-2 px-2 scroll-thin">
                <div className="space-y-2">
                  {timeEntries.slice(0, 15).map((t) => (
                    <div key={t.id} className="rounded-md border border-border p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-medium truncate flex-1">{t.description}</p>
                        <span className="text-xs font-mono">{formatDuration(t.durationSec)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            t.sessionType === 'billable' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                            t.sessionType === 'focus' ? 'bg-primary/10 text-primary' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}
                        >
                          {t.sessionType}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(t.date)}</span>
                      </div>
                      {t.billable && t.hourlyRate && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                          {formatSAR((t.durationSec / 3600) * t.hourlyRate)} billed
                        </p>
                      )}
                    </div>
                  ))}
                  {timeEntries.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">No sessions logged yet.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</span>
      <span className="text-sm font-mono font-medium">{value}</span>
    </div>
  )
}
