import {
  MessageSquare,
  Phone,
  Mail,
  Users,
  StickyNote,
  ArrowDownLeft,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

// ---- Display color maps ----

export const STAGE_COLORS: Record<string, string> = {
  drafting: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  client_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  filed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  closed: 'bg-muted text-muted-foreground',
}

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  overdue: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  cancelled: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
}

export const COMM_TYPE_META: Record<string, { Icon: LucideIcon; color: string }> = {
  call: { Icon: Phone, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  email: { Icon: Mail, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  meeting: { Icon: Users, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  sms: { Icon: MessageSquare, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  note: { Icon: StickyNote, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
}

export function getCommMeta(type: string) {
  return COMM_TYPE_META[type] ?? COMM_TYPE_META.note
}

export const DIRECTION_META: Record<string, { Icon: LucideIcon; color: string }> = {
  incoming: { Icon: ArrowDownLeft, color: 'text-emerald-600 dark:text-emerald-400' },
  outgoing: { Icon: ArrowUpRight, color: 'text-amber-600 dark:text-amber-400' },
}

export function getDirectionMeta(direction: string) {
  return DIRECTION_META[direction] ?? DIRECTION_META.outgoing
}
