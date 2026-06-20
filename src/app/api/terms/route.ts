import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const where = q ? { term: { contains: q } } : {}
  const terms = await db.legalTerm.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(terms)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const t = await db.legalTerm.create({ data: body })
  return NextResponse.json(t)
}
