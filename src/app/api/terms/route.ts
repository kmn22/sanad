import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const where = q ? { term: { contains: q } } : {}
    const terms = await db.legalTerm.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(terms)
  } catch (error) {
    console.error('GET /api/terms failed:', error)
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const t = await db.legalTerm.create({ data: body })
    return NextResponse.json(t)
  } catch (error) {
    console.error('POST /api/terms failed:', error)
    return NextResponse.json({ error: 'Failed to create term' }, { status: 500 })
  }
}
