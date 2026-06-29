import type { ReactNode } from 'react'

interface ViewHeaderProps {
  title: string
  subtitle: string
  action?: ReactNode
}

export function ViewHeader({ title, subtitle, action }: ViewHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}
