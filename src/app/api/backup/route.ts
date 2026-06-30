import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

export async function POST(req: Request) {
  try {
    // Run the backup script
    const { stdout, stderr } = await execPromise('bash scripts/backup.sh')
    
    return NextResponse.json({ success: true, message: 'Backup triggered', log: stdout })
  } catch (error: any) {
    return NextResponse.json({ error: 'Backup failed', details: error.message }, { status: 500 })
  }
}
