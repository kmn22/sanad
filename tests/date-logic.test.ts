import { describe, it, expect } from 'vitest'

interface MockTask {
  id: string
  title: string
  status: string
  dueDate: Date | null
}

function filterTaskStats(tasks: MockTask[], now: Date) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  const openTasks = tasks.filter((t) => t.status !== 'done')
  const overdueTasks = openTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < startOfToday
  )
  const todayTasks = openTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= endOfToday
  )

  return { openTasks, overdueTasks, todayTasks }
}

describe('Dashboard Task Date Logic', () => {
  it('correctly categorizes overdue, today, and future tasks regardless of weekday name', () => {
    // Wednesday, Sep 23, 2026
    const wednesday = new Date(2026, 8, 23, 14, 0, 0)

    const tasks: MockTask[] = [
      {
        id: '1',
        title: 'Task due yesterday (Tuesday)',
        status: 'todo',
        dueDate: new Date(2026, 8, 22, 10, 0, 0), // Tue Sep 22
      },
      {
        id: '2',
        title: 'Task due today (Wednesday morning)',
        status: 'todo',
        dueDate: new Date(2026, 8, 23, 9, 0, 0), // Wed Sep 23
      },
      {
        id: '3',
        title: 'Task due next Monday (Alphabetically "Mon" < "Wed")',
        status: 'todo',
        dueDate: new Date(2026, 8, 28, 12, 0, 0), // Mon Sep 28
      },
      {
        id: '4',
        title: 'Completed task that was due yesterday',
        status: 'done',
        dueDate: new Date(2026, 8, 22, 8, 0, 0),
      },
    ]

    const result = filterTaskStats(tasks, wednesday)

    // Open tasks should exclude completed ones
    expect(result.openTasks.length).toBe(3)

    // Only task 1 should be overdue
    expect(result.overdueTasks.length).toBe(1)
    expect(result.overdueTasks[0].id).toBe('1')

    // Only task 2 should be today
    expect(result.todayTasks.length).toBe(1)
    expect(result.todayTasks[0].id).toBe('2')

    // Task 3 (next Monday) MUST NOT be in overdue or today!
    expect(result.overdueTasks.some(t => t.id === '3')).toBe(false)
    expect(result.todayTasks.some(t => t.id === '3')).toBe(false)
  })
})
