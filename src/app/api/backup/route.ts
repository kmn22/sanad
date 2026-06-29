import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [clients, cases, tasks, invoices, docs, compliance, comms] = await Promise.all([
      db.client.findMany(),
      db.legalCase.findMany(),
      db.task.findMany(),
      db.invoice.findMany(),
      db.legalDocument.findMany(),
      db.complianceItem.findMany(),
      db.communication.findMany(),
    ])

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        clients,
        cases,
        tasks,
        invoices,
        docs,
        compliance,
        comms
      }
    }

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="sanad_backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 })
  }
}
