import { type LegalCase, type TimeEntry } from '@/lib/core/types'

export interface Props {
  cases: LegalCase[]
  timeEntries: TimeEntry[]
  onChange: () => void
}
