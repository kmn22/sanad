import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPortalAccess } from '@/lib/portal'
import { readEncryptedFile } from '@/lib/file-storage'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string; fileId: string }> }) {
  const { token, fileId } = await params
  const access = await getPortalAccess(token)
  if (!access) return NextResponse.json({ error: 'Portal link is invalid or expired' }, { status: 404 })
  const file = await db.portalFile.findFirst({ where: { id: fileId, portalAccessId: access.id, workspaceId: access.workspaceId, status: { not: 'deleted' } } })
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
  const data = await readEncryptedFile(file.fileKey)
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(file.sizeBytes),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
