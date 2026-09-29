'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db'

function emptyStudentDashboard() {
  return {
    stats: {
      courses: 0,
      upcomingDeadlines: 0,
      overdueDeadlines: 0,
      dueThisWeek: 0,
      dueThisMonth: 0,
      recentLectures: 0,
      draftLectures: 0,
      terms: 0,
      masteredTerms: 0,
      learningTerms: 0,
      familiarTerms: 0,
      cases: 0,
      totalWeight: 0,
    },
    courses: [],
    lectures: [],
    deadlines: { upcoming: [], overdue: [], dueThisWeek: [], dueThisMonth: [], all: [] },
    terms: [],
    cases: [],
    briefs: [],
  }
}

export async function getStudentDashboard() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; workspaceId?: string } | undefined
  if (!user?.id || !user.workspaceId) {
    return emptyStudentDashboard()
  }

  const workspaceId = user.workspaceId
  const where = { workspaceId }

  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [courses, lectures, deadlines, terms, cases, briefs] = await Promise.all([
    db.course.findMany({ where, include: { lectures: { orderBy: { lectureDate: 'desc' }, take: 3 }, deadlines: true }, orderBy: { createdAt: 'asc' } }),
    db.lecture.findMany({ where, orderBy: { lectureDate: 'desc' }, take: 20, include: { course: true } }),
    db.academicDeadline.findMany({ where, orderBy: { dueDate: 'asc' }, include: { course: true } }),
    db.legalTerm.findMany({ where, orderBy: { createdAt: 'desc' } }),
    db.caseEntry.findMany({ where, orderBy: { rating: 'desc' } }),
    // DailyBrief is a global table (no workspaceId / no relations) — a shared news feed by design.
    db.dailyBrief.findMany({ orderBy: { publishedAt: 'desc' }, take: 5 }),
  ])

  const upcomingDeadlines = deadlines.filter((d) => new Date(d.dueDate) >= now && d.status !== 'done')
  const overdueDeadlines = deadlines.filter((d) => new Date(d.dueDate) < now && d.status !== 'done')
  const dueThisWeek = upcomingDeadlines.filter((d) => new Date(d.dueDate) <= in7)
  const dueThisMonth = upcomingDeadlines.filter((d) => new Date(d.dueDate) <= in30)

  const recentLectures = lectures.slice(0, 8)
  const draftLectures = lectures.filter((l) => l.status === 'draft')
  const masteredTerms = terms.filter((t) => t.mastery === 'mastered').length
  const learningTerms = terms.filter((t) => t.mastery === 'learning').length
  const familiarTerms = terms.filter((t) => t.mastery === 'familiar').length

  const totalWeight = deadlines
    .filter((d) => d.weight)
    .reduce((sum, d) => sum + (d.weight || 0), 0)

  return {
    stats: {
      courses: courses.length,
      upcomingDeadlines: upcomingDeadlines.length,
      overdueDeadlines: overdueDeadlines.length,
      dueThisWeek: dueThisWeek.length,
      dueThisMonth: dueThisMonth.length,
      recentLectures: recentLectures.length,
      draftLectures: draftLectures.length,
      terms: terms.length,
      masteredTerms,
      learningTerms,
      familiarTerms,
      cases: cases.length,
      totalWeight: Math.round(totalWeight),
    },
    courses,
    lectures: recentLectures,
    deadlines: { upcoming: upcomingDeadlines, overdue: overdueDeadlines, dueThisWeek, dueThisMonth, all: deadlines },
    terms,
    cases,
    briefs,
  }
}
