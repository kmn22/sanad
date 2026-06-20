import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard — single tiny JSON payload for the morning view
export async function GET() {
  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [complianceItems, cases, documents, tasks, briefs, timeEntries] = await Promise.all([
    db.complianceItem.findMany({ orderBy: { expiryDate: 'asc' } }),
    db.legalCase.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.legalDocument.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.task.findMany({ orderBy: { dueDate: 'asc' } }),
    db.dailyBrief.findMany({ orderBy: { publishedAt: 'desc' }, take: 6 }),
    db.timeEntry.findMany({ orderBy: { date: 'desc' }, take: 30, include: { case: true } }),
  ])

  // Computed stats for the morning dashboard
  const expiringSoon = complianceItems.filter(
    (c) => c.expiryDate <= in30 && c.expiryDate >= now && c.status !== 'expired'
  )
  const expired = complianceItems.filter((c) => c.expiryDate < now)

  const activeDocs = documents.filter((d) => d.status === 'active' || d.status === 'sent')
  const expiringDocs = documents.filter(
    (d) => d.expiryDate && d.expiryDate <= in30 && d.expiryDate >= now
  )

  const openTasks = tasks.filter((t) => t.status !== 'done')
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < now)
  const todayTasks = openTasks.filter(
    (t) => t.dueDate && t.dueDate.toDateString() === now.toDateString()
  )

  const activeCases = cases.filter((c) => c.stage !== 'closed')
  const urgentCases = cases.filter((c) => c.priority === 'urgent' && c.stage !== 'closed')

  // Billable today
  const today = now.toDateString()
  const todaysEntries = timeEntries.filter((t) => t.date.toDateString() === today)
  const billableTodaySec = todaysEntries
    .filter((t) => t.billable)
    .reduce((sum, t) => sum + t.durationSec, 0)
  const focusTodaySec = todaysEntries
    .filter((t) => !t.billable && t.sessionType === 'focus')
    .reduce((sum, t) => sum + t.durationSec, 0)
  const billableTodaySAR = todaysEntries
    .filter((t) => t.billable)
    .reduce((sum, t) => sum + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)

  return NextResponse.json({
    stats: {
      expiringCompliance: expiringSoon.length,
      expiredCompliance: expired.length,
      activeDocs: activeDocs.length,
      expiringDocs: expiringDocs.length,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      todayTasks: todayTasks.length,
      activeCases: activeCases.length,
      urgentCases: urgentCases.length,
      billableTodaySec,
      focusTodaySec,
      billableTodaySAR,
    },
    compliance: { expiringSoon, expired, all: complianceItems },
    cases: { active: activeCases, urgent: urgentCases, all: cases },
    documents: { active: activeDocs, expiring: expiringDocs, all: documents },
    tasks: { open: openTasks, overdue: overdueTasks, today: todayTasks, all: tasks },
    briefs,
    timeEntries,
  })
}
