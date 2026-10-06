import { lawyerHref } from '../lawyer/sections'

// Practice sections the firm console renders with the shared lawyer views.
export const FIRM_PRACTICE_SECTIONS = ['cases', 'clients', 'invoices', 'compliance'] as const
export type FirmPracticeSection = (typeof FIRM_PRACTICE_SECTIONS)[number]

export function isFirmPracticeSection(s: string): s is FirmPracticeSection {
  return (FIRM_PRACTICE_SECTIONS as readonly string[]).includes(s)
}

/** Keep firm-owned sections inside /firm; everything else opens the lawyer workspace. */
export function firmHref(view: string): string {
  if (!view || view === 'today' || view === 'dashboard') return '/firm'
  return isFirmPracticeSection(view) ? `/firm/${view}` : lawyerHref(view)
}
