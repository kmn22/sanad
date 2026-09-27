import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/options'

export async function getSessionWorkspaceId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  const workspaceId = (session?.user as { workspaceId?: string } | undefined)?.workspaceId
  return workspaceId || null
}

export function unauthorizedJson() {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
}

export function communicationWorkspaceWhere(workspaceId: string) {
  return {
    OR: [
      { client: { is: { workspaceId } } },
      { case: { is: { workspaceId } } },
    ],
  }
}
