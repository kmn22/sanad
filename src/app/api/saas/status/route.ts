import { NextResponse } from 'next/server'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { getWorkspacePlan, getWorkspaceUsageSummary } from '@/lib/saas/entitlements'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const [status, usage] = await Promise.all([
    getWorkspacePlan(auth.workspaceId),
    getWorkspaceUsageSummary(auth.workspaceId),
  ])
  if (!status) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  return NextResponse.json({ ...status, usage }, { headers: { 'Cache-Control': 'private, no-store' } })
}
