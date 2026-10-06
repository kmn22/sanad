// Lawyer portal section slugs. Legacy view keys from the old single-page
// dashboard (e.g. `dashboard`, `today`) are mapped onto the new URLs.

export const LAWYER_SECTIONS = [
  'overview',
  'deepwork',
  'calendar',
  'cases',
  'tasks',
  'documents',
  'research',
  'briefs',
  'clients',
  'communications',
  'invoices',
  'compliance',
  'scanner',
  'ecosystem',
] as const

export type LawyerSection = (typeof LAWYER_SECTIONS)[number]

export function isLawyerSection(s: string): s is LawyerSection {
  return (LAWYER_SECTIONS as readonly string[]).includes(s)
}

export function lawyerHref(view: string): string {
  if (!view || view === 'today') return '/lawyer'
  if (view === 'dashboard') return '/lawyer/overview'
  return isLawyerSection(view) ? `/lawyer/${view}` : '/lawyer'
}
