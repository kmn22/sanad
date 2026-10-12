import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checksum } from '@/lib/file-storage'
import { createDocumentSignature, documentSignatureHeaders, signatureVerificationResult } from '@/lib/document-signature'
import { writeAudit } from '@/lib/audit'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const body = await req.json().catch(() => null) as { documentId?: unknown; content?: unknown; operation?: unknown } | null
  const content = typeof body?.content === 'string' ? body.content : ''
  const operation = body?.operation === 'print' || body?.operation === 'export' ? body.operation : null
  const documentId = typeof body?.documentId === 'string' && body.documentId.trim() ? body.documentId : null
  if (!content || !operation || !documentId) {
    return NextResponse.json({ error: 'documentId, content, and a valid operation are required' }, { status: 400 })
  }
  const digest = checksum(Buffer.from(content, 'utf8'))
  const signature = createDocumentSignature({
    userId: auth.userId,
    workspaceId: auth.workspaceId,
    documentId,
    checksumSha256: digest,
    operation,
  })
  await db.documentSignature.create({
    data: {
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      documentId,
      operation,
      checksumSha256: digest,
      signature,
    },
  })
  await writeAudit({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: `document.${operation}`,
    entityType: 'Document',
    entityId: documentId,
    metadata: { signatureVersion: 'v1', checksumSha256: digest },
  })
  return NextResponse.json({ signature, checksumSha256: digest }, { headers: documentSignatureHeaders(signature) })
}

export async function GET(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const signature = new URL(req.url).searchParams.get('signature')
  if (!signature) return NextResponse.json({ error: 'signature is required' }, { status: 400 })
  const record = await db.documentSignature.findFirst({
    where: { signature, workspaceId: auth.workspaceId },
    select: { id: true, documentId: true, operation: true, checksumSha256: true, issuedAt: true, userId: true },
  })
  if (!record) return NextResponse.json({ valid: false, reason: 'SIGNATURE_NOT_FOUND' }, { status: 404 })
  const verified = signatureVerificationResult(signature, record.checksumSha256)
  if (!verified.valid) return NextResponse.json({ valid: false, reason: verified.reason }, { status: 422 })
  return NextResponse.json({ valid: true, signature: record })
}
