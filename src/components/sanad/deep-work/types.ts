import { type LegalCase, type TimeEntry } from '@/lib/sanad/types'

export interface Props {
  cases: LegalCase[]
  timeEntries: TimeEntry[]
  onChange: () => void
}
