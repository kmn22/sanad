import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // In production this would write to an analytics store / warehouse.
    // For now we log and return 204 so clients can keep firing events.
    console.log('[analytics] event received', JSON.stringify(body))
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[analytics] invalid event payload', error)
    return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 })
  }
}
