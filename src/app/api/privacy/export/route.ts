import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requestIp, writeAudit } from '@/lib/audit'
import { canManageUsers, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, name: true, role: true, workspaceId: true, emailVerified: true, createdAt: true, updatedAt: true },
  })
  const exportData: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    controller: 'Sanad',
    user,
    privacyAcceptances: await db.privacyAcceptance.findMany({ where: { userId: auth.userId } }),
    consents: await db.consentRecord.findMany({ where: { userId: auth.userId } }),
    notifications: await db.notification.findMany({ where: { userId: auth.userId } }),
  }
  if (canManageUsers(auth)) {
    exportData.workspace = await db.workspace.findUnique({ where: { id: auth.workspaceId } })
    exportData.clients = await db.client.findMany({ where: { workspaceId: auth.workspaceId } })
    exportData.cases = await db.legalCase.findMany({ where: { workspaceId: auth.workspaceId } })
    exportData.documents = await db.legalDocument.findMany({ where: { workspaceId: auth.workspaceId } })
    exportData.tasks = await db.task.findMany({ where: { workspaceId: auth.workspaceId } })
    exportData.invoices = await db.invoice.findMany({ where: { workspaceId: auth.workspaceId } })
  }
  await writeAudit({ workspaceId: auth.workspaceId, userId: auth.userId, action: 'privacy.export', entityType: 'Workspace', entityId: auth.workspaceId, ipAddress: requestIp(req) })
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="sanad-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
