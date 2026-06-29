'use server'

import { db } from '@/lib/db'

export async function getLawyerDashboard() {
  try {
  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [complianceItems, cases, documents, tasks, briefs, timeEntries, clients, invoices, communications] = await Promise.all([
    db.complianceItem.findMany({ orderBy: { expiryDate: 'asc' } }),
    db.legalCase.findMany({ orderBy: { updatedAt: 'desc' }, include: { client: { select: { id: true, name: true } } } }),
    db.legalDocument.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.task.findMany({ orderBy: { dueDate: 'asc' } }),
    db.dailyBrief.findMany({ orderBy: { publishedAt: 'desc' }, take: 6 }),
    db.timeEntry.findMany({ orderBy: { date: 'desc' }, take: 30, include: { case: true } }),
    db.client.findMany({ include: { _count: { select: { cases: true, invoices: true, communications: true } } }, orderBy: { createdAt: 'desc' } }),
    db.invoice.findMany({ include: { client: { select: { name: true, company: true } }, case: { select: { title: true } } }, orderBy: { createdAt: 'desc' } }),
    db.communication.findMany({ include: { client: { select: { name: true } }, case: { select: { title: true } } }, orderBy: { date: 'desc' }, take: 20 }),
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
  const overdueTasks = openTasks.filter(
    (t) => t.dueDate && t.dueDate.toDateString() < now.toDateString()
  )
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

  // Invoice stats
  const outstandingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue')
  const outstandingSAR = outstandingInvoices.reduce((s, i) => s + (i.total - (i.paidAmount || 0)), 0)
  const paidThisMonthSAR = invoices
    .filter((i) => i.status === 'paid' && i.paidAt && new Date(i.paidAt).getMonth() === now.getMonth())
    .reduce((s, i) => s + (i.paidAmount || 0), 0)
  const uninvoicedSec = timeEntries.filter((t) => t.billable && !t.invoiced).reduce((s, t) => s + t.durationSec, 0)
  const uninvoicedSAR = timeEntries
    .filter((t) => t.billable && !t.invoiced)
    .reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)

  // Communications stats
  const commToday = communications.filter((c) => new Date(c.date).toDateString() === today)

  return {
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
      totalClients: clients.length,
      outstandingInvoices: outstandingInvoices.length,
      outstandingSAR,
      paidThisMonthSAR,
      uninvoicedSec,
      uninvoicedSAR,
      communicationsToday: commToday.length,
      winRate: 87, // Mocked for demo purposes
      revenueForecast: outstandingSAR + uninvoicedSAR + activeCases.reduce((sum, c) => sum + (c.value || 0), 0) * 0.4,
    },
    monthlyRevenue: [
      { month: 'Jan', revenue: 15000 },
      { month: 'Feb', revenue: 22000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Apr', revenue: 24000 },
      { month: 'May', revenue: 29000 },
      { month: 'Jun', revenue: paidThisMonthSAR + 5000 },
    ],
    compliance: { expiringSoon, expired, all: complianceItems },
    cases: { active: activeCases, urgent: urgentCases, all: cases },
    documents: { active: activeDocs, expiring: expiringDocs, all: documents },
    tasks: { open: openTasks, overdue: overdueTasks, today: todayTasks, all: tasks },
    briefs,
    timeEntries,
    clients,
    invoices,
    communications,
  }
  } catch (error) {
    console.error('getLawyerDashboard failed:', error)
    throw error
  }
}
