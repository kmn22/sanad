import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/calendar — unified calendar view of all dated events
export async function GET() {
  try {
    const now = new Date()
    const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [cases, deadlines, complianceItems, communications] = await Promise.all([
      db.legalCase.findMany({
        where: {
          OR: [
            { dueDate: { gte: ago30, lte: in60 } },
            { hearingDate: { gte: ago30, lte: in60 } },
          ],
        },
        include: { client: { select: { name: true } } },
      }),
      db.task.findMany({
        where: { dueDate: { gte: ago30, lte: in60 } },
      }),
      db.complianceItem.findMany({
        where: { expiryDate: { gte: ago30, lte: in60 } },
      }),
      db.communication.findMany({
        where: { date: { gte: ago30, lte: in60 } },
        include: { client: { select: { name: true } } },
        take: 50,
      }),
    ])

    type Event = {
      id: string
      date: string
      title: string
      type: 'case_deadline' | 'hearing' | 'task' | 'compliance' | 'communication'
      label: string
      color: string
      refId?: string
      sub?: string
    }

    const events: Event[] = []

    for (const c of cases) {
      if (c.dueDate) {
        events.push({
          id: `case-due-${c.id}`,
          date: c.dueDate.toISOString(),
          title: c.title,
          type: 'case_deadline',
          label: 'موعد قضية',
          color: 'amber',
          refId: c.id,
          sub: c.client?.name,
        })
      }
      if (c.hearingDate) {
        events.push({
          id: `hearing-${c.id}`,
          date: c.hearingDate.toISOString(),
          title: c.title,
          type: 'hearing',
          label: 'جلسة محكمة',
          color: 'purple',
          refId: c.id,
          sub: c.court || undefined,
        })
      }
    }

    for (const t of deadlines) {
      events.push({
        id: `task-${t.id}`,
        date: t.dueDate!.toISOString(),
        title: t.title,
        type: 'task',
        label: 'مهمة',
        color: t.priority === 'urgent' ? 'rose' : t.priority === 'high' ? 'amber' : 'slate',
        refId: t.id,
      })
    }

    for (const c of complianceItems) {
      events.push({
        id: `comp-${c.id}`,
        date: c.expiryDate.toISOString(),
        title: `${c.title} — ${c.entityName}`,
        type: 'compliance',
        label: 'انتهاء امتثال',
        color: 'rose',
        refId: c.id,
      })
    }

    for (const c of communications) {
      events.push({
        id: `comm-${c.id}`,
        date: c.date.toISOString(),
        title: c.subject,
        type: 'communication',
        label: c.type === 'call' ? 'مكالمة' : c.type === 'email' ? 'بريد' : c.type === 'meeting' ? 'اجتماع' : c.type === 'sms' ? 'رسالة' : 'ملاحظة',
        color: 'cyan',
        refId: c.id,
        sub: c.client?.name,
      })
    }

    // Sort by date ascending
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ events, total: events.length })
  } catch (error) {
    console.error('GET /api/calendar failed:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}
