import { NextResponse } from 'next/server'
import { getLawyerDashboard } from '@/app/actions/dashboard'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const data = await getLawyerDashboard()
  return NextResponse.json(data)
}
