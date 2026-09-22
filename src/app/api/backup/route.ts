import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

async function handleBackup() {
  try {
    const { stdout } = await execPromise('bash scripts/backup.sh')
    return NextResponse.json({ success: true, message: 'Backup completed successfully', log: stdout.trim() })
  } catch (error: any) {
    return NextResponse.json({ error: 'Backup failed', details: error.message }, { status: 500 })
  }
}

export async function POST() {
  return handleBackup()
}

export async function GET() {
  return handleBackup()
}
