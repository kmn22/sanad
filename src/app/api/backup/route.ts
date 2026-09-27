import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { exec } from 'child_process'
import util from 'util'
import { authOptions } from '@/lib/auth/options'

const execPromise = util.promisify(exec)

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // TODO: gate this further once an explicit admin role exists in the schema.
  // Until then, any authenticated user can trigger an on-demand backup.

  try {
    const { stdout, stderr } = await execPromise('bash scripts/backup.sh')
    if (stderr) {
      console.error('[backup] stderr:', stderr)
    }
    return NextResponse.json({ success: true, message: 'Backup completed successfully', log: stdout.trim() })
  } catch (error: any) {
    console.error('[backup] failed:', error)
    return NextResponse.json({ error: 'Backup failed', details: error.message }, { status: 500 })
  }
}
