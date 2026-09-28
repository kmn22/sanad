import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailConfigured } from '@/lib/email'
import { canManageUsers, forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const [overduePrivacyRequests, openIncidents] = await Promise.all([
    db.dataSubjectRequest.count({ where: { workspaceId: auth.workspaceId, status: { notIn: ['completed', 'rejected'] }, dueAt: { lt: new Date() } } }),
    db.privacyIncident.count({ where: { workspaceId: auth.workspaceId, status: { not: 'closed' } } }),
  ])
  return NextResponse.json({ emailConfigured: emailConfigured(), billingConfigured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET), backupEncryptionConfigured: Boolean(process.env.BACKUP_ENCRYPTION_KEY), mfaEnabled: auth.mfaEnabled, overduePrivacyRequests, openIncidents })
}
