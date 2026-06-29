import { Card, CardContent } from '@/components/ui/card'
import type { ComponentType } from 'react'

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  message: string
}

export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-sm text-muted-foreground">
        <Icon className="h-8 w-8 mx-auto mb-2 opacity-40" />
        {message}
      </CardContent>
    </Card>
  )
}
