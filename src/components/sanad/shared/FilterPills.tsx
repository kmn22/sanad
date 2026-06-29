import { Button } from '@/components/ui/button'

interface FilterPillsProps {
  filters: { key: string; label: string }[]
  active: string
  onChange: (key: string) => void
}

export function FilterPills({ filters, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map(({ key, label }) => (
        <Button
          key={key}
          variant={active === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(key)}
          className="h-7 text-xs"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
