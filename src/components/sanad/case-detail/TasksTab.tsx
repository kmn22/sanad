'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, daysUntil, PRIORITY_COLORS, type Task } from '@/lib/sanad/types'
import { EmptyState } from './primitives'

export function TasksTab({ tasks, onToggle }: { tasks: Task[]; onToggle: (task: Task) => void }) {
  const { lang, t } = useLang()

  if (tasks.length === 0) {
    return <EmptyState icon={CheckCircle2} label={t('case.no_tasks')} />
  }

  // Sort: open first, then by due date asc; done last
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <ul className="p-3 space-y-2">
      {sorted.map((task) => {
        const done = task.status === 'done'
        const days = task.dueDate ? daysUntil(task.dueDate) : null
        const overdue = !done && days !== null && days < 0
        return (
          <li key={task.id}>
            <Card className={`${done ? 'opacity-60' : ''} hover:border-primary/30 transition-colors`}>
              <CardContent className="p-3 flex items-start gap-2.5">
                <Checkbox
                  checked={done}
                  onCheckedChange={() => onToggle(task)}
                  className="mt-0.5"
                  aria-label={task.title}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium leading-tight text-start ${
                      done ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        PRIORITY_COLORS[task.priority]?.color ?? PRIORITY_COLORS.normal.color
                      }`}
                    >
                      {t(`prio.${task.priority}`)}
                    </Badge>
                    {task.dueDate && (
                      <span
                        className={`text-[10px] flex items-center gap-1 ${
                          overdue
                            ? 'text-rose-600 dark:text-rose-400 font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Calendar className="size-2.5" />
                        {formatDate(task.dueDate, lang)}
                        {overdue &&
                          ` (${t('dash.d_overdue', { n: Math.abs(days!) })})`}
                        {!overdue && days! <= 3 &&
                          ` (${t('dash.d_left', { n: days! })})`}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
