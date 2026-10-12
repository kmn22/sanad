import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { checksum, readEncryptedFile } from '@/lib/file-storage'
import { createDocumentSignature, documentSignatureHeaders } from '@/lib/document-signature'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const { id } = await params
  const file = await db.portalFile.findFirst({ where: { id, workspaceId: auth.workspaceId, status: { not: 'deleted' } } })
  if (!file) return notFoundJson()
  const data = await readEncryptedFile(file.fileKey)
  const digest = checksum(data)
  const signature = createDocumentSignature({
    userId: auth.userId,
    workspaceId: auth.workspaceId,
    documentId: file.documentId || file.id,
    checksumSha256: digest,
    operation: 'download',
  })
  await db.documentSignature.create({
    data: {
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      documentId: file.documentId || file.id,
      operation: 'download',
      checksumSha256: digest,
      signature,
    },
  })
  await db.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'portal.file.download', entityType: 'PortalFile', entityId: file.id } })
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(file.sizeBytes),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      ...documentSignatureHeaders(signature),
    },
  })
}
