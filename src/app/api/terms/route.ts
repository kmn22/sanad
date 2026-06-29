import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCreateHandler } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const where = q ? { term: { contains: q } } : {}
  const terms = await db.legalTerm.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(terms)
}

export const POST = createCreateHandler('legalTerm')
