import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simulated webhook endpoint for receiving updates from a Najiz RPA bot
export async function POST(req: Request) {
  try {
    const { caseNumber, hearingDate, status } = await req.json()

    if (!caseNumber) {
      return NextResponse.json({ error: 'caseNumber is required' }, { status: 400 })
    }

    const updatedCase = await prisma.legalCase.updateMany({
      where: { caseNumber },
      data: {
        hearingDate: hearingDate ? new Date(hearingDate) : undefined,
        stage: status || undefined
      }
    })

    return NextResponse.json({ success: true, updatedCase })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync with Najiz' }, { status: 500 })
  }
}
