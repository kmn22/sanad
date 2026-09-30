import { createHash } from 'crypto'
import { db } from '@/lib/db'

export function hashPortalToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function getPortalAccess(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null
  const access = await db.portalAccess.findUnique({
    where: { tokenHash: hashPortalToken(token) },
    include: {
      client: { select: { id: true, name: true, type: true } },
      case: {
        select: {
          id: true,
          title: true,
          caseType: true,
          stage: true,
          priority: true,
          dueDate: true,
          hearingDate: true,
          caseNumber: true,
          court: true,
          workspaceId: true,
        },
      },
      requests: {
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: { id: true, title: true, message: true, status: true, priority: true, dueDate: true, createdAt: true, updatedAt: true },
      },
      files: {
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: { id: true, originalName: true, mimeType: true, sizeBytes: true, status: true, createdAt: true, requestId: true },
      },
    },
  })
  if (!access || access.revokedAt || access.expiresAt <= new Date()) return null
  await db.portalAccess.update({ where: { id: access.id }, data: { lastAccessedAt: new Date() } })
  return access
}
