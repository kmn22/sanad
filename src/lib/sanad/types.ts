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

// ---- Formatting helpers ----

export function daysUntil(dateStr: string | Date): number {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
}

export function formatDate(dateStr: string | Date | null): string {
  if (!dateStr) return '—'
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}

export function formatSAR(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' SAR'
}

export function formatHijri(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return ''
  }
}

// ---- Display maps ----

export const COMPLIANCE_LABELS: Record<string, { label: string; color: string }> = {
  ikama: { label: 'Iqama', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  cr: { label: 'Commercial Reg.', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  contract: { label: 'Contract', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
  license: { label: 'License', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
  tax: { label: 'Tax', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  gosi: { label: 'GOSI', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200' },
}

export const CASE_STAGE_LABELS: Record<string, { label: string; accent: string }> = {
  drafting: { label: 'Drafting', accent: 'border-t-amber-400' },
  client_review: { label: 'Client Review', accent: 'border-t-purple-400' },
  filed: { label: 'Filed', accent: 'border-t-emerald-400' },
  closed: { label: 'Closed', accent: 'border-t-muted-foreground' },
}

export const PRIORITY_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  normal: { label: 'Normal', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200', dot: 'bg-emerald-500' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200', dot: 'bg-amber-500' },
  urgent: { label: 'Urgent', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200', dot: 'bg-rose-500' },
}

export const DOC_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent for Signature', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  expiring: { label: 'Expiring', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  expired: { label: 'Expired', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  nda: 'NDA',
  employment: 'Employment',
  non_compete: 'Non-Compete',
  msa: 'MSA / Settlement',
  subcontract: 'Subcontract',
  policy: 'Policy',
}

export const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  MoJ: { label: 'Ministry of Justice', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  MHRSD: { label: 'MHRSD', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  VAT: { label: 'ZATCA', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  local_tip: { label: 'Local Tip', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
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
