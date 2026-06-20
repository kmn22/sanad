// Shared Sanad types + helpers (kept in one place so client/server stay in sync)

export type ComplianceCategory = 'ikama' | 'cr' | 'contract' | 'license' | 'tax' | 'gosi'
export type CaseStage = 'drafting' | 'client_review' | 'filed' | 'closed'
export type CasePriority = 'low' | 'normal' | 'high' | 'urgent'
export type DocStatus = 'draft' | 'sent' | 'active' | 'expiring' | 'expired'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface ComplianceItem {
  id: string
  title: string
  category: string
  entityName: string
  issueDate: string
  expiryDate: string
  status: string
  notes: string | null
  notifyDays: number
}

export interface LegalCase {
  id: string
  title: string
  clientName: string
  caseType: string
  stage: string
  priority: string
  dueDate: string | null
  value: number | null
  notes: string | null
}

export interface LegalDocument {
  id: string
  title: string
  docType: string
  status: string
  parties: string
  signedDate: string | null
  expiryDate: string | null
  caseId: string | null
  notes: string | null
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  relatedDoc: string | null
  caseId: string | null
  autoGen: boolean
}

export interface TimeEntry {
  id: string
  caseId: string | null
  description: string
  durationSec: number
  billable: boolean
  hourlyRate: number | null
  sessionType: string
  date: string
  case?: LegalCase | null
}

export interface DailyBrief {
  id: string
  title: string
  summary: string
  source: string
  category: string
  url: string | null
  publishedAt: string
}

export interface DashboardData {
  stats: {
    expiringCompliance: number
    expiredCompliance: number
    activeDocs: number
    expiringDocs: number
    openTasks: number
    overdueTasks: number
    todayTasks: number
    activeCases: number
    urgentCases: number
    billableTodaySec: number
    focusTodaySec: number
    billableTodaySAR: number
  }
  compliance: { expiringSoon: ComplianceItem[]; expired: ComplianceItem[]; all: ComplianceItem[] }
  cases: { active: LegalCase[]; urgent: LegalCase[]; all: LegalCase[] }
  documents: { active: LegalDocument[]; expiring: LegalDocument[]; all: LegalDocument[] }
  tasks: { open: Task[]; overdue: Task[]; today: Task[]; all: Task[] }
  briefs: DailyBrief[]
  timeEntries: TimeEntry[]
}

// ===== Student types =====

export interface Course {
  id: string
  title: string
  code: string | null
  instructor: string | null
  semester: string | null
  credits: number | null
  color: string
  notes: string | null
  lectures?: Lecture[]
  deadlines?: AcademicDeadline[]
}

export interface Lecture {
  id: string
  courseId: string
  title: string
  lectureDate: string
  topic: string | null
  notes: string
  attachments: string | null
  status: string
  course?: Course | null
}

export interface AcademicDeadline {
  id: string
  courseId: string | null
  title: string
  type: string
  dueDate: string
  status: string
  priority: string
  weight: number | null
  notes: string | null
  course?: Course | null
}

export interface LegalTerm {
  id: string
  term: string
  definition: string
  category: string
  origin: string | null
  example: string | null
  mastery: string
}

export interface CaseEntry {
  id: string
  caseName: string
  citation: string | null
  court: string | null
  principle: string
  subject: string
  summary: string | null
  significance: string | null
  rating: number
}

export interface StudentDashboardData {
  stats: {
    courses: number
    upcomingDeadlines: number
    overdueDeadlines: number
    dueThisWeek: number
    dueThisMonth: number
    recentLectures: number
    draftLectures: number
    terms: number
    masteredTerms: number
    learningTerms: number
    familiarTerms: number
    cases: number
    totalWeight: number
  }
  courses: (Course & { lectures: Lecture[]; deadlines: AcademicDeadline[] })[]
  lectures: (Lecture & { course: Course | null })[]
  deadlines: { upcoming: AcademicDeadline[]; overdue: AcademicDeadline[]; dueThisWeek: AcademicDeadline[]; dueThisMonth: AcademicDeadline[]; all: (AcademicDeadline & { course: Course | null })[] }
  terms: LegalTerm[]
  cases: CaseEntry[]
  briefs: DailyBrief[]
}

// ---- Formatting helpers ----

export function daysUntil(dateStr: string | Date): number {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
}

export function formatDate(dateStr: string | Date | null, lang: 'ar' | 'en' = 'ar'): string {
  if (!dateStr) return '—'
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const locale = lang === 'ar' ? 'ar-SA' : 'en-GB'
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDuration(sec: number, lang: 'ar' | 'en' = 'ar'): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  // Use Arabic-Indic digits when lang=ar for a more native feel
  const fmt = (n: number) => lang === 'ar' ? n.toLocaleString('ar-EG') : n.toString()
  if (h > 0) return `${fmt(h)}${lang === 'ar' ? 'س ' : 'h '}${fmt(m).padStart(lang === 'ar' ? 2 : 2, lang === 'ar' ? '٠' : '0')}${lang === 'ar' ? 'د' : 'm'}`
  if (m > 0) return `${fmt(m)}${lang === 'ar' ? 'د ' : 'm '}${fmt(s).padStart(lang === 'ar' ? 2 : 2, lang === 'ar' ? '٠' : '0')}${lang === 'ar' ? 'ث' : 's'}`
  return `${fmt(s)}${lang === 'ar' ? 'ث' : 's'}`
}

export function formatSAR(n: number, lang: 'ar' | 'en' = 'ar'): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US'
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)
  return lang === 'ar' ? `${num} ر.س` : `${num} SAR`
}

export function formatHijri(date: Date, lang: 'ar' | 'en' = 'ar'): string {
  try {
    const locale = lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-SA-u-ca-islamic-umalqura'
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return ''
  }
}

// ---- Display maps (colors only — labels come from i18n via t('cat.ikama') etc.) ----

export const COMPLIANCE_COLORS: Record<string, string> = {
  ikama: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  cr: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  contract: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  license: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  tax: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  gosi: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
}

export const CASE_STAGE_ACCENTS: Record<string, string> = {
  drafting: 'border-t-amber-400',
  client_review: 'border-t-purple-400',
  filed: 'border-t-emerald-400',
  closed: 'border-t-muted-foreground',
}

export const PRIORITY_COLORS: Record<string, { color: string; dot: string }> = {
  low: { color: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  normal: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200', dot: 'bg-emerald-500' },
  high: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200', dot: 'bg-amber-500' },
  urgent: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200', dot: 'bg-rose-500' },
}

export const DOC_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  expiring: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  expired: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
}

export const SOURCE_COLORS: Record<string, string> = {
  MoJ: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  MHRSD: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  VAT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  local_tip: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
}

export function getDaysUntilColor(days: number, notifyDays: number = 30): string {
  if (days < 0) return 'text-rose-600 dark:text-rose-400'
  if (days <= 7) return 'text-rose-600 dark:text-rose-400 font-semibold'
  if (days <= notifyDays) return 'text-amber-600 dark:text-amber-400 font-semibold'
  return 'text-emerald-600 dark:text-emerald-400'
}

export function getDaysUntilBg(days: number, notifyDays: number = 30): string {
  if (days < 0) return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
  if (days <= 7) return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
  if (days <= notifyDays) return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
  return 'bg-card border-border'
}
