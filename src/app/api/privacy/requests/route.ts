import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requestDeadline } from '@/lib/compliance'
import { rateLimit } from '@/lib/rate-limit'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'

const REQUEST_TYPES = new Set(['access', 'copy', 'correction', 'destruction', 'consent_withdrawal', 'complaint'])

export async function POST(req: Request) {
  try {
    const body = await readJsonLimited<{ email?: unknown; requestType?: unknown; details?: unknown }>(req, 16 * 1024)
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
    const requestType = typeof body.requestType === 'string' ? body.requestType : ''
    if (!email.includes('@') || !REQUEST_TYPES.has(requestType)) {
      return NextResponse.json({ error: 'Invalid email or request type' }, { status: 400 })
    }
    if (!(await rateLimit(`privacy-request:${email}`, 5, 24 * 60 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const user = await db.user.findUnique({ where: { email }, select: { id: true, workspaceId: true } })
    const receivedAt = new Date()
    const request = await db.dataSubjectRequest.create({
      data: {
        workspaceId: user?.workspaceId,
        userId: user?.id,
        requesterEmail: email,
        requestType,
        receivedAt,
        dueAt: requestDeadline(receivedAt),
        // The requester's own message. Kept separate from `responseNotes`,
        // which belongs to the case handler on the admin side.
        details: typeof body.details === 'string' ? body.details.slice(0, 4000) : null,
      },
      select: { id: true, receivedAt: true, dueAt: true, status: true },
    })
    return NextResponse.json({ success: true, request }, { status: 201 })
  } catch (error) {
    return safeErrorResponse(error)
  }
}
