import { type TimeEntry } from '@/lib/sanad/types'

/** Saudi VAT rate (15%) applied to legal fees on ZATCA tax invoices. */
export const VAT_RATE = 0.15

/** Compute SAR amount for a single time entry. */
export function entryAmount(e: Pick<TimeEntry, 'hourlyRate' | 'durationSec'>): number {
  if (!e.hourlyRate) return 0
  return (e.hourlyRate * e.durationSec) / 3600
}
