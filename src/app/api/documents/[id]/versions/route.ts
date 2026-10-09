import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWrite, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { MAX_UPLOAD_BYTES, checksum, sanitizeFilename, storeEncryptedFile, validateUpload } from '@/lib/file-storage'
import { checkStorageUsage } from '@/lib/saas/entitlements'
import { recordWorkflowEvent } from '@/lib/workflow'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const { id } = await params
  const document = await db.legalDocument.findFirst({ where: { id, workspaceId: auth.workspaceId, deletedAt: null }, select: { id: true, caseId: true } })
  if (!document) return notFoundJson()
  if (document.caseId && !(await canAccessCase(auth, document.caseId))) return notFoundJson()
  const versions = await db.documentVersion.findMany({
    where: { documentId: id, workspaceId: auth.workspaceId },
    orderBy: { version: 'desc' },
    include: { uploadedBy: { select: { id: true, name: true } } },
  })
  return NextResponse.json(versions)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWrite(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  if (!(await isFeatureEnabled(auth.workspaceId, 'document_versions'))) return NextResponse.json({ error: 'Document versioning is disabled for this workspace', code: 'FLAG_DISABLED' }, { status: 403 })
  const { id } = await params
  const document = await db.legalDocument.findFirst({ where: { id, workspaceId: auth.workspaceId, deletedAt: null }, select: { id: true, title: true, caseId: true } })
  if (!document) return notFoundJson()
  if (document.caseId && !(await canAccessCase(auth, document.caseId))) return notFoundJson()

  const form = await req.formData()
  const file = form.get('file')
  const note = typeof form.get('note') === 'string' ? String(form.get('note')).slice(0, 500) : null
  if (!(file instanceof File)) return NextResponse.json({ error: 'File is required' }, { status: 400 })
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'File exceeds the 10 MB limit' }, { status: 400 })
  const bytes = Buffer.from(await file.arrayBuffer())
  const originalName = sanitizeFilename(file.name)
  const validationError = validateUpload(originalName, file.type, bytes)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  const quota = await checkStorageUsage(auth.workspaceId, bytes.length)
  if (!quota.allowed) return NextResponse.json({ error: 'Workspace storage limit reached', code: quota.code }, { status: 403 })

  const versionId = `dv_${randomBytes(12).toString('hex')}`
  const nextVersion = ((await db.documentVersion.aggregate({ where: { documentId: id }, _max: { version: true } }))._max.version ?? 0) + 1
  const fileKey = `${auth.workspaceId}/documents/${id}/${versionId}.enc`
  await storeEncryptedFile(fileKey, bytes)
  const digest = checksum(bytes)

  const version = await db.$transaction(async (tx) => {
    const created = await tx.documentVersion.create({
      data: {
        id: versionId,
        workspaceId: auth.workspaceId,
        documentId: id,
        version: nextVersion,
        fileKey,
        originalName,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: bytes.length,
        checksumSha256: digest,
        uploadedById: auth.userId,
        note,
      },
    })
    await tx.legalDocument.update({
      where: { id },
      data: { fileKey, mimeType: file.type || 'application/octet-stream', sizeBytes: bytes.length, checksumSha256: digest, uploadedBy: 'user' },
    })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'document.version.upload', entityType: 'DocumentVersion', entityId: created.id } })
    return created
  })
  if (document.caseId) {
    await recordWorkflowEvent({ workspaceId: auth.workspaceId, caseId: document.caseId, actorId: auth.userId, action: 'document_version', toState: `v${nextVersion}`, metadata: { documentId: id, versionId } })
  }
  return NextResponse.json(version, { status: 201 })
}
