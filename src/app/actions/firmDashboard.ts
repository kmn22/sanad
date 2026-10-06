'use server'

import { db } from '@/lib/db'
import { getAuthContext } from '@/lib/auth/workspace'

const ACTIVE_STAGES_EXCLUDED = ['closed']

export type FirmMember = {
  id: string
  name: string | null
  email: string
  role: string
  mfaEnabled: boolean
  createdAt: Date
  activeCases: number
  leadCases: number
  openTasks: number
  overdueTasks: number
}

export type FirmCaseRow = {
  id: string
  title: string
  stage: string
  priority: string
  clientName: string
  hearingDate: Date | null
  dueDate: Date | null
  assignees: { userId: string; name: string | null; role: string }[]
}

export type FirmDashboard = {
  workspace: { id: string; name: string; type: string; domain: string | null }
  kpis: {
    activeCases: number
    urgentCases: number
    unassignedCases: number
    totalClients: number
    clientsWithPortal: number
    teamSize: number
    pendingInvites: number
    revenueThisMonth: number
    revenueLastMonth: number
    outstanding: number
    overdueInvoices: number
    billableHoursMonth: number
    uninvoicedValue: number
    openPortalRequests: number
    upcomingHearings: number
  }
  monthlyRevenue: { month: string; revenue: number; invoiced: number }[]
  pipeline: { stage: string; count: number }[]
  members: FirmMember[]
  cases: FirmCaseRow[]
  invitations: { id: string; email: string; role: string; expiresAt: Date; createdAt: Date }[]
  activity: { id: string; action: string; entityType: string | null; createdAt: Date; actor: string | null }[]
}

/** Firm-wide console data. Restricted to firm owners and admins. */
export async function getFirmDashboard(): Promise<FirmDashboard | null> {
  const auth = await getAuthContext()
  if (!auth || !['workspace_owner', 'admin'].includes(auth.role)) return null
  const workspaceId = auth.workspaceId
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const in14 = new Date(now.getTime() + 14 * 86400000)

  const [workspace, users, cases, tasks, invoices, timeEntries, clients, clientLogins, invitations, openRequests, audit] = await Promise.all([
    db.workspace.findUnique({ where: { id: workspaceId }, select: { id: true, name: true, type: true, domain: true } }),
    db.user.findMany({
      where: { workspaceId, disabledAt: null, role: { not: 'client' } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, email: true, role: true, mfaEnabled: true, createdAt: true },
    }),
    db.legalCase.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        stage: true,
        priority: true,
        clientName: true,
        hearingDate: true,
        dueDate: true,
        assignments: { where: { active: true }, select: { userId: true, role: true, user: { select: { name: true } } } },
      },
    }),
    db.task.findMany({ where: { workspaceId, status: { not: 'done' } }, select: { assignedToId: true, dueDate: true } }),
    db.invoice.findMany({
      where: { workspaceId, OR: [{ issueDate: { gte: sixMonthsAgo } }, { status: { in: ['sent', 'overdue'] } }] },
      select: { status: true, total: true, paidAmount: true, paidAt: true, issueDate: true, dueDate: true },
    }),
    db.timeEntry.findMany({ where: { workspaceId, billable: true, date: { gte: lastMonthStart } }, select: { durationSec: true, hourlyRate: true, invoiced: true, date: true } }),
    db.client.count({ where: { workspaceId } }),
    db.user.findMany({ where: { workspaceId, role: 'client', disabledAt: null, clientId: { not: null } }, select: { clientId: true }, distinct: ['clientId'] }),
    db.invitation.findMany({
      where: { workspaceId, acceptedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    }),
    db.portalRequest.count({ where: { workspaceId, status: 'open' } }),
    db.auditLog.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, action: true, entityType: true, createdAt: true, userId: true } }),
  ])
  if (!workspace) return null

  const activeCases = cases.filter((c) => !ACTIVE_STAGES_EXCLUDED.includes(c.stage))
  const nameById = new Map(users.map((u) => [u.id, u.name || u.email]))

  const members: FirmMember[] = users.map((u) => {
    const mine = activeCases.filter((c) => c.assignments.some((a) => a.userId === u.id))
    const myTasks = tasks.filter((t) => t.assignedToId === u.id)
    return {
      ...u,
      activeCases: mine.length,
      leadCases: mine.filter((c) => c.assignments.some((a) => a.userId === u.id && a.role === 'lead')).length,
      openTasks: myTasks.length,
      overdueTasks: myTasks.filter((t) => t.dueDate && t.dueDate < now).length,
    }
  })

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const months: { month: string; revenue: number; invoiced: number }[] = []
  for (let i = 5; i >= 0; i--) months.push({ month: monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)), revenue: 0, invoiced: 0 })
  const byMonth = new Map(months.map((m) => [m.month, m]))
  let revenueThisMonth = 0
  let revenueLastMonth = 0
  let outstanding = 0
  let overdueInvoices = 0
  for (const inv of invoices) {
    if (inv.status !== 'cancelled' && inv.status !== 'draft') {
      const m = byMonth.get(monthKey(inv.issueDate))
      if (m) m.invoiced += inv.total
    }
    if (inv.status === 'paid' && inv.paidAt) {
      const m = byMonth.get(monthKey(inv.paidAt))
      if (m) m.revenue += inv.paidAmount || inv.total
      if (inv.paidAt >= monthStart) revenueThisMonth += inv.paidAmount || inv.total
      else if (inv.paidAt >= lastMonthStart) revenueLastMonth += inv.paidAmount || inv.total
    }
    if (inv.status === 'sent' || inv.status === 'overdue') {
      outstanding += Math.max(0, inv.total - (inv.paidAmount || 0))
      if (inv.status === 'overdue' || (inv.dueDate && inv.dueDate < now)) overdueInvoices++
    }
  }

  const monthEntries = timeEntries.filter((te) => te.date >= monthStart)
  const billableHoursMonth = Math.round((monthEntries.reduce((s, te) => s + te.durationSec, 0) / 3600) * 10) / 10
  const uninvoicedValue = Math.round(timeEntries.filter((te) => !te.invoiced).reduce((s, te) => s + (te.durationSec / 3600) * (te.hourlyRate || 0), 0))

  const stageCounts = new Map<string, number>()
  for (const c of cases) stageCounts.set(c.stage, (stageCounts.get(c.stage) || 0) + 1)

  return {
    workspace,
    kpis: {
      activeCases: activeCases.length,
      urgentCases: activeCases.filter((c) => c.priority === 'urgent' || c.priority === 'high').length,
      unassignedCases: activeCases.filter((c) => c.assignments.length === 0).length,
      totalClients: clients,
      clientsWithPortal: clientLogins.length,
      teamSize: users.length,
      pendingInvites: invitations.length,
      revenueThisMonth: Math.round(revenueThisMonth),
      revenueLastMonth: Math.round(revenueLastMonth),
      outstanding: Math.round(outstanding),
      overdueInvoices,
      billableHoursMonth,
      uninvoicedValue,
      openPortalRequests: openRequests,
      upcomingHearings: activeCases.filter((c) => c.hearingDate && c.hearingDate >= now && c.hearingDate <= in14).length,
    },
    monthlyRevenue: months.map((m) => ({ ...m, revenue: Math.round(m.revenue), invoiced: Math.round(m.invoiced) })),
    pipeline: Array.from(stageCounts, ([stage, count]) => ({ stage, count })),
    members,
    cases: activeCases.map((c) => ({
      id: c.id,
      title: c.title,
      stage: c.stage,
      priority: c.priority,
      clientName: c.clientName,
      hearingDate: c.hearingDate,
      dueDate: c.dueDate,
      assignees: c.assignments.map((a) => ({ userId: a.userId, name: a.user.name, role: a.role })),
    })),
    invitations,
    activity: audit.map((a) => ({ id: a.id, action: a.action, entityType: a.entityType, createdAt: a.createdAt, actor: a.userId ? nameById.get(a.userId) || null : null })),
  }
}
