import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { canManage } from '@/lib/auth/capabilities'
import { CASE_STAGES } from '@/lib/workflow'

function secretsMatch(provided: string, expected: string) {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// Webhook endpoint for receiving updates from a Najiz RPA bot.
// Requires an authenticated workspace admin/owner session and, when
// configured, the shared webhook secret.
export async function POST(req: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const denied = forbiddenJson()
    if (!canManage(auth)) return denied
    const workspaceId = auth.workspaceId
    const expectedSecret = process.env.NAJIZ_WEBHOOK_SECRET
    if (expectedSecret) {
      const provided = req.headers.get('x-najiz-webhook-secret') || ''
      if (!secretsMatch(provided, expectedSecret)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await req.json().catch(() => null)
    const caseNumber = typeof body?.caseNumber === 'string' ? body.caseNumber.trim() : ''
    const hearingDate = typeof body?.hearingDate === 'string' ? body.hearingDate : null
    const status = typeof body?.status === 'string' ? body.status : null

    if (!caseNumber) {
      return NextResponse.json({ error: 'caseNumber is required' }, { status: 400 })
    }
    // Only known workflow stages may be written — an external bot must never
    // set arbitrary stage strings.
    if (status !== null && !CASE_STAGES.has(status)) {
      return NextResponse.json({ error: 'status must be a known case stage' }, { status: 400 })
    }
    const parsedHearing = hearingDate ? new Date(hearingDate) : null
    if (parsedHearing && Number.isNaN(parsedHearing.getTime())) {
      return NextResponse.json({ error: 'hearingDate is invalid' }, { status: 400 })
    }

    const result = await db.legalCase.updateMany({
      where: { caseNumber, workspaceId },
      data: {
        hearingDate: parsedHearing ?? undefined,
        stage: status ?? undefined
      }
    })

    if (result.count === 0) {
      return NextResponse.json({ error: `No case found with caseNumber ${caseNumber}` }, { status: 404 })
    }

    return NextResponse.json({ success: true, updatedCount: result.count })
  } catch (error) {
    console.error('Najiz sync failed:', error)
    return NextResponse.json({ error: 'Failed to sync with Najiz' }, { status: 500 })
  }
}
