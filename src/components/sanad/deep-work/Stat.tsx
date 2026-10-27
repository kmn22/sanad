'use client'


export function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</span>
      <span className="text-sm font-mono font-medium" dir="ltr">{value}</span>
    </div>
  )
}
