import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Webhook endpoint for receiving updates from a Najiz RPA bot.
// Gated by a shared secret when NAJIZ_WEBHOOK_SECRET is configured; open in
// demo mode (no secret set) so the sandbox keeps working out of the box.
export async function POST(req: Request) {
  try {
    const expectedSecret = process.env.NAJIZ_WEBHOOK_SECRET
    if (expectedSecret) {
      const provided = req.headers.get('x-najiz-webhook-secret')
      if (provided !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { caseNumber, hearingDate, status } = await req.json()

    if (!caseNumber) {
      return NextResponse.json({ error: 'caseNumber is required' }, { status: 400 })
    }

    const result = await db.legalCase.updateMany({
      where: { caseNumber },
      data: {
        hearingDate: hearingDate ? new Date(hearingDate) : undefined,
        stage: status || undefined
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
