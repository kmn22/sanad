import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, getTenantDb } from '@/lib/db'
import { canManageUsers, forbiddenJson, getAuthContext, isPlatformSuperAdmin, unauthorizedJson } from '@/lib/auth/workspace'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'

const patchSchema = z.object({
  status: z.enum(['open', 'triaged', 'resolved', 'dismissed']).optional(),
  adminNote: z.string().trim().max(2000).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    if (!canManageUsers(auth)) return forbiddenJson()
    const { id } = await params
    const parsed = patchSchema.safeParse(await readJsonLimited(req, 8 * 1024))
    if (!parsed.success) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })

    const superAdmin = isPlatformSuperAdmin(auth)
    const scope = superAdmin ? { id } : { id, workspaceId: auth.workspaceId }
    const existing = await db.feedback.findFirst({ where: scope, select: { id: true } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { status, adminNote } = parsed.data
    const updateArgs = {
      where: { id },
      data: {
        ...(status ? { status, resolvedAt: status === 'resolved' || status === 'dismissed' ? new Date() : null } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
      select: { id: true, status: true, adminNote: true, resolvedAt: true },
    }
    const item = superAdmin
      ? await db.feedback.update(updateArgs)
      : await getTenantDb(auth).feedback.update(updateArgs)
    return NextResponse.json({ success: true, item })
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'PATCH /api/admin/feedback/[id]' })
  }
}
