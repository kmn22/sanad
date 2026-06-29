import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string }> }

type PrismaDelegate = {
  findMany: (args?: any) => Promise<any[]>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
}

function getDelegate(model: string): PrismaDelegate {
  return (db as any)[model]
}

export function createListHandler(
  model: string,
  options?: { orderBy?: any; include?: any; take?: number }
) {
  return async function GET() {
    const items = await getDelegate(model).findMany({
      ...(options?.orderBy && { orderBy: options.orderBy }),
      ...(options?.include && { include: options.include }),
      ...(options?.take && { take: options.take }),
    })
    return NextResponse.json(items)
  }
}

export function createCreateHandler(model: string) {
  return async function POST(req: NextRequest) {
    const body = await req.json()
    const item = await getDelegate(model).create({ data: body })
    return NextResponse.json(item)
  }
}

export function createPatchHandler(model: string) {
  return async function PATCH(
    req: NextRequest,
    { params }: RouteContext
  ) {
    const { id } = await params
    const body = await req.json()
    const updated = await getDelegate(model).update({
      where: { id },
      data: body,
    })
    return NextResponse.json(updated)
  }
}

export function createDeleteHandler(model: string) {
  return async function DELETE(
    _req: NextRequest,
    { params }: RouteContext
  ) {
    const { id } = await params
    await getDelegate(model).delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }
}
