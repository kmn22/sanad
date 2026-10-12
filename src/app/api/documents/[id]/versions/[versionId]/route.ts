import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase } from '@/lib/auth/capabilities'
import { checksum, readEncryptedFile } from '@/lib/file-storage'
import { createDocumentSignature, documentSignatureHeaders } from '@/lib/document-signature'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const { id, versionId } = await params
  const version = await db.documentVersion.findFirst({
    where: { id: versionId, documentId: id, workspaceId: auth.workspaceId },
    include: { document: { select: { caseId: true, deletedAt: true } } },
  })
  if (!version || version.document.deletedAt) return notFoundJson()
  if (version.document.caseId && !(await canAccessCase(auth, version.document.caseId))) return notFoundJson()
  const data = await readEncryptedFile(version.fileKey)
  const digest = checksum(data)
  const signature = createDocumentSignature({
    userId: auth.userId,
    workspaceId: auth.workspaceId,
    documentId: version.documentId,
    checksumSha256: digest,
    operation: 'download',
  })
  await db.documentSignature.create({
    data: {
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      documentId: version.documentId,
      operation: 'download',
      checksumSha256: digest,
      signature,
    },
  })
  await db.auditLog.create({
    data: {
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      action: 'document.version.download',
      entityType: 'DocumentVersion',
      entityId: version.id,
      metadata: JSON.stringify({ signatureVersion: 'v1', checksumSha256: digest }),
    },
  })
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': version.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(version.originalName || `version-${version.version}`)}"`,
      'Content-Length': String(data.length),
      'Cache-Control': 'private, no-store',
      ...documentSignatureHeaders(signature),
    },
  })
}
