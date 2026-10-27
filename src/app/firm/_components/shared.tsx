'use client'

import React from 'react'
import { useFirmDashboard } from '@/components/portal/usePortalData'

export const sar = (n: number, lang: string) =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(n)

export const STAGE_LABELS: Record<string, { ar: string; en: string }> = {
  drafting: { ar: 'صياغة', en: 'Drafting' },
  client_review: { ar: 'مراجعة الموكّل', en: 'Client review' },
  filed: { ar: 'مقيدة', en: 'Filed' },
  hearing: { ar: 'جلسات', en: 'Hearings' },
  closed: { ar: 'مغلقة', en: 'Closed' },
}

export const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  admin: { ar: 'مدير النظام', en: 'Admin' },
  workspace_owner: { ar: 'مالك المكتب', en: 'Owner' },
  lawyer: { ar: 'محامٍ', en: 'Lawyer' },
  staff: { ar: 'فريق', en: 'Staff' },
  auditor: { ar: 'مدقق', en: 'Auditor' },
  student: { ar: 'متدرب', en: 'Trainee' },
  lead: { ar: 'رئيسي', en: 'Lead' },
  assignee: { ar: 'مكلّف', en: 'Assignee' },
  reviewer: { ar: 'مراجع', en: 'Reviewer' },
  observer: { ar: 'مطّلع', en: 'Observer' },
}

/* ─────────────────────────── Frame ─────────────────────────── */

export function useFirm() {
  const res = useFirmDashboard()
  return res
}

export function FirmLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-muted/50 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted/40 rounded-2xl" />)}</div>
      <div className="h-72 bg-muted/30 rounded-2xl" />
    </div>
  )
}

export function Panel({ title, icon: Icon, action, children, className = '' }: { title: string; icon?: React.ComponentType<{ className?: string }>; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/* ─────────────────────────── Overview ─────────────────────────── */
