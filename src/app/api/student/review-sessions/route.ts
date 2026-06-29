import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/student/review-sessions — list past sessions for stats
export async function GET() {
  try {
    const sessions = await db.reviewSession.findMany({ orderBy: { date: 'desc' }, take: 30 })

    // Aggregate stats
    const total = sessions.length
    const totalCards = sessions.reduce((s, x) => s + x.reviewedCount, 0)
    const totalCorrect = sessions.reduce((s, x) => s + x.correctCount, 0)
    const avgScore = total > 0 ? sessions.reduce((s, x) => s + (x.score || 0), 0) / total : 0
    const totalDurationSec = sessions.reduce((s, x) => s + x.durationSec, 0)

    // Last 7 sessions for trend
    const recent = sessions.slice(0, 7).reverse()

    return NextResponse.json({
      sessions,
      stats: {
        total,
        totalCards,
        totalCorrect,
        avgScore: Math.round(avgScore),
        totalDurationSec,
        accuracy: totalCards > 0 ? Math.round((totalCorrect / totalCards) * 100) : 0,
      },
      recent,
    })
  } catch (error) {
    console.error('GET /api/student/review-sessions failed:', error)
    return NextResponse.json({ error: 'Failed to fetch review sessions' }, { status: 500 })
  }
}

// POST /api/student/review-sessions — save a completed session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const session = await db.reviewSession.create({
      data: {
        mode: body.mode,
        sourceType: body.sourceType,
        sourceLabel: body.sourceLabel,
        cardCount: body.cardCount,
        correctCount: body.correctCount || 0,
        reviewedCount: body.reviewedCount || 0,
        durationSec: body.durationSec || 0,
        score: body.reviewedCount > 0 ? Math.round((body.correctCount / body.reviewedCount) * 100) : null,
      },
    })
    return NextResponse.json(session)
  } catch (error) {
    console.error('POST /api/student/review-sessions failed:', error)
    return NextResponse.json({ error: 'Failed to save review session' }, { status: 500 })
  }
}
