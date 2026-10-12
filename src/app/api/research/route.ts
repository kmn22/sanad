import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { INITIAL_RESEARCH_ITEMS } from '@/lib/sanad/research/seedData'
import { getAuthContext, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { requireEducation } from '@/lib/saas/entitlements'
import { logError } from '@/lib/observability'

// GET /api/research?q=...&category=...&type=...
export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getSessionWorkspaceId()
    if (!workspaceId) return unauthorizedJson()
    const eduGate = await requireEducation(workspaceId)
    if (eduGate) return eduGate
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') || ''

    // Seed a starter research set the first time a workspace opens the hub.
    // createMany is a single round-trip; skipDuplicates keeps concurrent GETs
    // from racing into duplicate rows.
    const count = await db.researchItem.count({ where: { workspaceId } })
    if (count === 0) {
      await db.researchItem.createMany({
        data: INITIAL_RESEARCH_ITEMS.map((item) => ({
          workspaceId,
          title: item.title,
          content: item.content,
          type: item.type,
          category: item.category,
          source: item.source,
          tags: item.tags,
          notes: item.notes || null,
          isPinned: item.isPinned || false,
        })),
        skipDuplicates: true,
      })
    }

    const where: Prisma.ResearchItemWhereInput = { workspaceId }
    if (category && category !== 'all') {
      where.category = category
    }
    if (type && type !== 'all') {
      where.type = type
    }

    let items = await db.researchItem.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    })

    if (q.trim()) {
      const lower = q.toLowerCase()
      items = items.filter(
        (it) =>
          it.title.toLowerCase().includes(lower) ||
          it.content.toLowerCase().includes(lower) ||
          (it.source && it.source.toLowerCase().includes(lower)) ||
          (it.tags && it.tags.toLowerCase().includes(lower)) ||
          (it.notes && it.notes.toLowerCase().includes(lower))
      )
    }

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
    })
  } catch (err) {
    logError(err, { req, msg: 'Error fetching research items', route: 'GET /api/research' })
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/research - Save a new research item or bookmark
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const eduGate = await requireEducation(auth.workspaceId)
    if (eduGate) return eduGate
    const denied = denyUnless(auth, canWriteAcademic(auth))
    if (denied) return denied
    const budgeted = await enforceMutationBudget(auth)
    if (budgeted) return budgeted
    const workspaceId = auth.workspaceId
    const body = await req.json()
    const { title, content, type = 'note', category = 'general', source, tags, notes, caseId, url, isPinned = false } = body
    if (caseId) {
      const legalCase = await db.legalCase.findFirst({ where: { id: caseId, workspaceId }, select: { id: true } })
      if (!legalCase) return notFoundJson()
    }

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'العنوان والمحتوى مطلوبان' }, { status: 400 })
    }

    const item = await db.researchItem.create({
      data: {
        workspaceId,
        title: title.trim(),
        content: content.trim(),
        type,
        category,
        source: source ? source.trim() : null,
        tags: tags ? tags.trim() : null,
        notes: notes ? notes.trim() : null,
        caseId: caseId || null,
        url: url || null,
        isPinned: Boolean(isPinned),
      },
    })

    return NextResponse.json({ success: true, item })
  } catch (err) {
    logError(err, { req, msg: 'Error creating research item', route: 'POST /api/research' })
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
