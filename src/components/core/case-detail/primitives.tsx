'use client'

import { Card, CardContent } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'

// ---- Small presentational helpers ----

export function CountChip({ n, lang }: { n: number; lang: 'ar' | 'en' }) {
  return (
    <span className="inline-flex items-center justify-center min-w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] px-1 leading-none">
      {n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
    </span>
  )
}

export function EmptyState({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground">
      <Icon className="size-7 mb-2 opacity-40" />
      <p>{label}</p>
    </div>
  )
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <div className="mt-0.5 shrink-0 rounded-md bg-muted/60 p-1.5">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate" title={value}>
          {value}
        </p>
        {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'emerald' | 'amber'
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-700 dark:text-emerald-300'
      : tone === 'amber'
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-foreground'
  return (
    <Card className="bg-muted/30 border-border">
      <CardContent className="p-2.5 space-y-0.5">
        <p className="text-[10px] text-muted-foreground truncate">{label}</p>
        <p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
      </CardContent>
    </Card>
  )
}
