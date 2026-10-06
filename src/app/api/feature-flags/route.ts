import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { KNOWN_FLAGS } from '@/lib/feature-flags'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const flags = await db.featureFlag.findMany({ where: { workspaceId: auth.workspaceId } })
  const map = Object.fromEntries(flags.map((flag) => [flag.key, flag.enabled]))
  return NextResponse.json(Object.fromEntries([...KNOWN_FLAGS].map((key) => [key, map[key] ?? true])))
}
