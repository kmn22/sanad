'use client'

import { useLang } from '@/lib/sanad/i18n'
import type { DashboardData } from '@/lib/sanad/types'

interface Props {
  data: DashboardData
  onNavigate: (view: string, refId?: string) => void
  onStartFocus: () => void
}

export function TodayFocusView({ data, onNavigate, onStartFocus }: Props) {
  const { t } = useLang()
  const now = new Date()
  const hour = now.getHours()
  const greetingKey = hour < 12 ? 'greeting.morning' : hour < 17 ? 'greeting.afternoon' : 'greeting.evening'

  const overdueTasks = data?.tasks?.overdue || []
  const todayTasks = data?.tasks?.today || []
  const criticalTasks = [...overdueTasks, ...todayTasks].slice(0, 5)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t(greetingKey)}</h1>
        <p className="text-sm text-muted-foreground">
          {now.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {criticalTasks.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">{t('dash.todays_priorities')}</h3>
          <div className="space-y-2">
            {criticalTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onNavigate('tasks', task.id)}
                className="w-full text-start flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onStartFocus}
        className="w-full p-4 rounded-lg border-2 border-primary/30 bg-primary/5 hover:border-primary transition-all text-center"
      >
        <p className="text-sm font-semibold">{t('dash.start_focus')}</p>
      </button>
    </div>
  )
}
