'use client'

export function StatTile({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  tone: 'amber' | 'emerald' | 'rose' | 'slate'
  icon: React.ReactNode
}) {
  const toneClasses: Record<string, string> = {
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300',
    emerald:
      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300',
    rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300',
    slate:
      'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-300',
  }
  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-[11px] mt-0.5">{sub}</p>}
    </div>
  )
}
