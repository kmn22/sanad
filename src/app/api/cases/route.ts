import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCaseSchema } from '@/lib/validations'

export async function GET() {
  const cases = await db.legalCase.findMany({ orderBy: { updatedAt: 'desc' }, include: { timeEntries: true } })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const parsed = createCaseSchema.parse(rawBody)
    const c = await db.legalCase.create({ data: parsed })
    return NextResponse.json(c)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create case' }, { status: 500 })
  }
}
