import { db } from '@/lib/db'

export type AuditEvent = {
  workspaceId?: string | null
  userId?: string | null
  action: string
  entityType?: string
  entityId?: string
  ipAddress?: string
  metadata?: Record<string, unknown>
}

export async function writeAudit(event: AuditEvent) {
  await db.auditLog.create({
    data: {
      workspaceId: event.workspaceId || null,
      userId: event.userId || null,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      ipAddress: event.ipAddress,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    },
  })
}

export async function writeDataAccess(event: {
  workspaceId: string
  userId: string
  action: string
  entityType: string
  entityId: string
  ipAddress?: string
}) {
  await db.dataAccessEvent.create({ data: event })
}

export function requestIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip')?.trim() || undefined
}
