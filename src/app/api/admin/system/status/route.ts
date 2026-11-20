import { readdir, stat } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailConfigured } from '@/lib/email'
import { canManageUsers, forbiddenJson, getAuthContext, isPlatformSuperAdmin, unauthorizedJson } from '@/lib/auth/workspace'

const startedAt = Date.now()

async function lastBackupAt() {
  const dir = process.env.NODE_ENV === 'production' ? '/app/backups/postgres' : path.join(process.cwd(), 'backups', 'postgres')
  try {
    const files = await readdir(dir)
    let newest: number | null = null
    for (const file of files.filter((name) => name.endsWith('.dump.enc'))) {
      const info = await stat(path.join(dir, file))
      if (!newest || info.mtimeMs > newest) newest = info.mtimeMs
    }
    return newest ? new Date(newest).toISOString() : null
  } catch {
    return null
  }
}

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const superAdmin = isPlatformSuperAdmin(auth)
  const jobScope = superAdmin ? {} : { workspaceId: auth.workspaceId }
  const [overduePrivacyRequests, openIncidents, queuedJobs, failedJobs, backup] = await Promise.all([
    db.dataSubjectRequest.count({ where: { workspaceId: auth.workspaceId, status: { notIn: ['completed', 'rejected'] }, dueAt: { lt: new Date() } } }),
    db.privacyIncident.count({ where: { workspaceId: auth.workspaceId, status: { not: 'closed' } } }),
    db.backgroundJob.count({ where: { ...jobScope, status: 'queued' } }),
    db.backgroundJob.count({ where: { ...jobScope, status: 'failed' } }),
    superAdmin ? lastBackupAt() : Promise.resolve(null),
  ])
  return NextResponse.json({
    emailConfigured: emailConfigured(),
    billingConfigured: false,
    backupEncryptionConfigured: Boolean(process.env.BACKUP_ENCRYPTION_KEY),
    mfaEnabled: auth.mfaEnabled,
    overduePrivacyRequests,
    openIncidents,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    queuedJobs,
    failedJobs,
    lastBackupAt: backup,
  })
}
