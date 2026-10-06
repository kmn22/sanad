import { db } from '@/lib/db'

export const KNOWN_FLAGS = new Set([
  'ai_drafting',
  'client_portal',
  'workflow_approvals',
  'document_versions',
  'email_notifications',
])

export async function isFeatureEnabled(workspaceId: string, key: string) {
  const flag = await db.featureFlag.findUnique({ where: { workspaceId_key: { workspaceId, key } }, select: { enabled: true } })
  return flag?.enabled ?? true
}
