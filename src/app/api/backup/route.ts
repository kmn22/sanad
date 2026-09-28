import { exec } from 'child_process'
import util from 'util'
import { NextResponse } from 'next/server'
import { requestIp, writeAudit } from '@/lib/audit'
import { canManageUsers, forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

const execPromise = util.promisify(exec)

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  if (!process.env.BACKUP_ENCRYPTION_KEY) {
    return NextResponse.json({ error: 'Backup encryption is not configured' }, { status: 503 })
  }

  const filename = `sanad-on-demand-${new Date().toISOString().replace(/[:.]/g, '-')}.dump.enc`
  try {
    await execPromise(
      `mkdir -p /app/backups/postgres && pg_dump "$DATABASE_URL" -Fc | openssl enc -aes-256-cbc -pbkdf2 -salt -out "/app/backups/postgres/${filename}" -pass env:BACKUP_ENCRYPTION_KEY`,
      { timeout: 120_000, env: process.env }
    )
    await writeAudit({
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      action: 'backup.create',
      entityType: 'Database',
      ipAddress: requestIp(req),
      metadata: { filename },
    })
    return NextResponse.json({ success: true, message: 'Encrypted backup completed successfully' })
  } catch (error) {
    console.error('[backup] failed:', error)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}
