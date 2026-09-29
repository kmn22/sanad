// Pure task bucketing shared by the dashboard action and its tests.
// Kept dependency-free so it can be imported from both server and test code.

export interface TaskLike {
  id: string
  status: string
  dueDate: Date | null
}

export function filterTaskStats<T extends TaskLike>(tasks: T[], now: Date) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  const openTasks = tasks.filter((t) => t.status !== 'done')
  const overdueTasks = openTasks.filter(
    (t) => t.dueDate && t.dueDate < startOfToday
  )
  const todayTasks = openTasks.filter(
    (t) => t.dueDate && t.dueDate >= startOfToday && t.dueDate <= endOfToday
  )

  return { openTasks, overdueTasks, todayTasks }
}
