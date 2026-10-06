import type { PortalId } from '@/lib/auth/portals'

export type Bilingual = { ar: string; en: string }

export type PortalTheme = {
  id: PortalId
  name: Bilingual
  tagline: Bilingual
  badge: string
  /** Logo tile gradient */
  logo: string
  /** Active nav item */
  active: string
  /** Active mobile pill */
  activePill: string
  /** Soft accent text + background, for chips */
  chip: string
  /** Ambient background glows */
  glowA: string
  glowB: string
  /** Accent text colour */
  text: string
  /** Hero gradient for page headers */
  hero: string
}

// Literal class strings so Tailwind's scanner picks them up.
export const PORTAL_THEMES: Record<PortalId, PortalTheme> = {
  student: {
    id: 'student',
    name: { ar: 'بوابة الطالب', en: 'Student Portal' },
    tagline: { ar: 'دراستك القانونية في مكان واحد', en: 'Your legal studies, organised' },
    badge: 'STUDENT',
    logo: 'from-indigo-500 to-violet-700 ring-indigo-400/30',
    active: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-e-2 border-indigo-500',
    activePill: 'bg-indigo-600 text-white',
    chip: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
    glowA: 'bg-indigo-600/10',
    glowB: 'bg-violet-600/10',
    text: 'text-indigo-600 dark:text-indigo-300',
    hero: 'from-indigo-600/20 via-violet-600/10 to-transparent',
  },
  lawyer: {
    id: 'lawyer',
    name: { ar: 'بوابة المحامي', en: 'Lawyer Portal' },
    tagline: { ar: 'مساحة عملك القانونية اليومية', en: 'Your daily practice workspace' },
    badge: 'PRO',
    logo: 'from-emerald-600 to-emerald-800 ring-emerald-400/30',
    active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-e-2 border-emerald-500',
    activePill: 'bg-emerald-600 text-white',
    chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    glowA: 'bg-emerald-600/10',
    glowB: 'bg-teal-600/10',
    text: 'text-emerald-600 dark:text-emerald-300',
    hero: 'from-emerald-600/20 via-teal-600/10 to-transparent',
  },
  firm: {
    id: 'firm',
    name: { ar: 'بوابة المكتب', en: 'Law Firm Portal' },
    tagline: { ar: 'إدارة المكتب والفريق والأداء', en: 'Run your firm, team and performance' },
    badge: 'FIRM',
    logo: 'from-amber-500 to-orange-700 ring-amber-400/30',
    active: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-e-2 border-amber-500',
    activePill: 'bg-amber-600 text-white',
    chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25',
    glowA: 'bg-amber-500/10',
    glowB: 'bg-orange-600/10',
    text: 'text-amber-600 dark:text-amber-300',
    hero: 'from-amber-500/20 via-orange-600/10 to-transparent',
  },
  client: {
    id: 'client',
    name: { ar: 'بوابة الموكّل', en: 'Client Portal' },
    tagline: { ar: 'تابع قضاياك وفواتيرك بأمان', en: 'Follow your cases and invoices securely' },
    badge: 'CLIENT',
    logo: 'from-sky-500 to-blue-700 ring-sky-400/30',
    active: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-e-2 border-sky-500',
    activePill: 'bg-sky-600 text-white',
    chip: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25',
    glowA: 'bg-sky-500/10',
    glowB: 'bg-blue-600/10',
    text: 'text-sky-600 dark:text-sky-300',
    hero: 'from-sky-500/20 via-blue-600/10 to-transparent',
  },
}
