'use client'

import type { Props } from './types'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Coffee, DollarSign, Brain } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { saveState, TimerState, DEFAULT_STATE, loadState } from './state'

export function useDeepWork({ cases, timeEntries, onChange }: Props) {
  const { lang, t } = useLang()
  const [state, setState] = useState<TimerState>(DEFAULT_STATE)
  const [now, setNow] = useState(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => { setState(loadState()) }, [])
  useEffect(() => { saveState(state) }, [state])

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(() => setNow(Date.now()), 250)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [state.running])

  const elapsedSec = state.running && state.startedAt ? Math.floor((now - state.startedAt) / 1000) : 0
  const displaySec = state.running ? Math.max(0, state.total - elapsedSec) : state.remaining
  const progressPct = state.total > 0 ? ((state.total - displaySec) / state.total) * 100 : 0

  async function saveSession(durationSec: number) {
    const isBillable = state.mode === 'billable'
    const payload = {
      caseId: isBillable ? state.caseId : null,
      description: state.description || (state.mode === 'focus' ? t('dw.mode_focus') : isBillable ? t('dw.mode_billable') : t('dw.mode_break')),
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
      toast.error(t('dw.failed_save'))
    }
  }

  async function completeSession() {
    await saveSession(state.total)
    setState({ ...DEFAULT_STATE })
    const modeLabel = state.mode === 'focus' ? t('dw.mode_focus') : state.mode === 'billable' ? t('dw.mode_billable') : t('dw.mode_break')
    toast.success(t('dw.session_complete', { mode: modeLabel }))
  }

  useEffect(() => {
    if (state.running && displaySec === 0) {
      completeSession()
    }
  }, [displaySec])

  const start = () => setState({ ...state, running: true, startedAt: Date.now() })
  const pause = () => setState({ ...state, running: false, startedAt: null, remaining: displaySec })

  const stop = async () => {
    const elapsedTotal = state.total - displaySec
    if (elapsedTotal >= 60) await saveSession(elapsedTotal)
    setState({ ...DEFAULT_STATE })
    toast.info(t('dw.stopped'))
  }

  const setMode = (mode: 'focus' | 'billable' | 'break') => {
    const presets = { focus: 25 * 60, billable: 60 * 60, break: 5 * 60 }
    setState({ ...state, mode, total: presets[mode], remaining: presets[mode], running: false, startedAt: null })
  }

  const setDuration = (min: number) => {
    const sec = min * 60
    setState({ ...state, total: sec, remaining: sec, running: false, startedAt: null })
  }

  const todayStr = new Date().toDateString()
  const todayEntries = timeEntries.filter((t) => new Date(t.date).toDateString() === todayStr)
  const billableTodaySec = todayEntries.filter((e) => e.billable).reduce((s, e) => s + e.durationSec, 0)
  const focusTodaySec = todayEntries.filter((e) => !e.billable && e.sessionType === 'focus').reduce((s, e) => s + e.durationSec, 0)
  const billableTodaySAR = todayEntries.filter((e) => e.billable).reduce((s, e) => s + (e.durationSec / 3600) * (e.hourlyRate || 0), 0)
  const focusSessionsToday = todayEntries.filter((e) => e.sessionType === 'focus').length

  const weeklyChartData = useMemo(() => {
    const locale = lang === 'ar' ? 'ar-SA' : 'en-US'
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      const dayEntries = timeEntries.filter(
        (e) => new Date(e.date).toDateString() === d.toDateString()
      )
      const billable = dayEntries.filter((e) => e.billable).reduce((s, e) => s + e.durationSec / 3600, 0)
      const focus = dayEntries.filter((e) => !e.billable && e.sessionType === 'focus').reduce((s, e) => s + e.durationSec / 3600, 0)
      return {
        name: d.toLocaleDateString(locale, { weekday: 'short' }),
        [lang === 'ar' ? 'فوترة' : 'Billable']: Number(billable.toFixed(1)),
        [lang === 'ar' ? 'تركيز' : 'Focus']: Number(focus.toFixed(1)),
      }
    })
  }, [timeEntries, lang])

  const [chartMounted, setChartMounted] = useState(false)
  useEffect(() => { setChartMounted(true) }, [])

  const modeMeta = {
    focus: { label: t('dw.mode_focus'), icon: Brain, color: 'text-primary', ring: 'border-primary' },
    billable: { label: t('dw.mode_billable'), icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', ring: 'border-emerald-500' },
    break: { label: t('dw.mode_break'), icon: Coffee, color: 'text-amber-600 dark:text-amber-400', ring: 'border-amber-500' },
  }
  const ModeIcon = modeMeta[state.mode].icon

  const circleRadius = 130
  const circleCircumference = 2 * Math.PI * circleRadius
  const strokeOffset = circleCircumference - (progressPct / 100) * circleCircumference

  // Format timer display in Arabic numerals when lang=ar
  const fmtTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const pad = (n: number) => lang === 'ar' ? n.toLocaleString('ar-EG').padStart(2, '٠') : n.toString().padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }

  return {
    cases,
    timeEntries,
    onChange,
    lang,
    t,
    state,
    setState,
    now,
    setNow,
    intervalRef,
    elapsedSec,
    displaySec,
    progressPct,
    saveSession,
    completeSession,
    start,
    pause,
    stop,
    setMode,
    setDuration,
    todayStr,
    todayEntries,
    billableTodaySec,
    focusTodaySec,
    billableTodaySAR,
    focusSessionsToday,
    weeklyChartData,
    chartMounted,
    setChartMounted,
    modeMeta,
    ModeIcon,
    circleRadius,
    circleCircumference,
    strokeOffset,
    fmtTime,
  }
}

export type DeepWorkState = ReturnType<typeof useDeepWork>
