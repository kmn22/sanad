

import { getMigratedItem, setMigratedItem } from '@/lib/storage-migration'

export const MAQAR_TIMER_KEY = 'maqar.timer.state.v1'
export const LEGACY_TIMER_KEY = 'sanad.timer.state.v1'

export interface TimerState {
  mode: 'focus' | 'billable' | 'break'
  remaining: number
  total: number
  running: boolean
  startedAt: number | null
  description: string
  caseId: string | null
  hourlyRate: number
}

export const DEFAULT_STATE: TimerState = {
  mode: 'focus',
  remaining: 25 * 60,
  total: 25 * 60,
  running: false,
  startedAt: null,
  description: '',
  caseId: null,
  hourlyRate: 850,
}

export function saveState(state: TimerState): void {
  setMigratedItem(MAQAR_TIMER_KEY, LEGACY_TIMER_KEY, JSON.stringify(state))
}

export function loadState(): TimerState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = getMigratedItem(MAQAR_TIMER_KEY, LEGACY_TIMER_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as TimerState
    if (parsed.running && parsed.startedAt) {
      const elapsed = Math.floor((Date.now() - parsed.startedAt) / 1000)
      const left = parsed.total - elapsed
      if (left <= 0) return { ...DEFAULT_STATE }
      return { ...parsed, remaining: left }
    }
    return parsed
  } catch {
    return DEFAULT_STATE
  }
}
