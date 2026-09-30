import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPortalAccess } from '@/lib/portal'
import { rateLimit } from '@/lib/rate-limit'
import { MAX_UPLOAD_BYTES, checksum, sanitizeFilename, storeEncryptedFile, validateUpload } from '@/lib/file-storage'
import { activeCaseUserIds, notifyUsers, recordWorkflowEvent } from '@/lib/workflow'

export const runtime = 'nodejs'

function ip(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

async function workspaceRecipients(workspaceId: string, caseId?: string | null) {
  const [owners, assigned] = await Promise.all([
    db.user.findMany({ where: { workspaceId, role: 'workspace_owner', disabledAt: null }, select: { id: true } }),
    caseId ? activeCaseUserIds(workspaceId, caseId) : Promise.resolve([]),
  ])
  return [...owners.map((user) => user.id), ...assigned]
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const limited = await rateLimit(`portal:get:${token.slice(0, 12)}:${ip(req)}`, 120, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const access = await getPortalAccess(token)
  if (!access) return NextResponse.json({ error: 'Portal link is invalid or expired' }, { status: 404 })
  return NextResponse.json({
    client: access.client,
    case: access.case,
    expiresAt: access.expiresAt,
    allowUpload: access.allowUpload,
    requests: access.requests,
    files: access.files,
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const limited = await rateLimit(`portal:post:${token.slice(0, 12)}:${ip(req)}`, 30, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  const access = await getPortalAccess(token)
  if (!access) return NextResponse.json({ error: 'Portal link is invalid or expired' }, { status: 404 })

  const contentType = req.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    if (!access.allowUpload) return NextResponse.json({ error: 'Uploads are disabled for this portal' }, { status: 403 })
    const form = await req.formData()
    const file = form.get('file')
    const requestId = typeof form.get('requestId') === 'string' ? String(form.get('requestId')) : null
    if (!(file instanceof File)) return NextResponse.json({ error: 'File is required' }, { status: 400 })
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'File exceeds the 10 MB limit' }, { status: 400 })
    const bytes = Buffer.from(await file.arrayBuffer())
    const originalName = sanitizeFilename(file.name)
    const validationError = validateUpload(originalName, file.type, bytes)
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
    if (requestId) {
      const request = await db.portalRequest.findFirst({ where: { id: requestId, portalAccessId: access.id, workspaceId: access.workspaceId }, select: { id: true } })
      if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const fileId = `pf_${randomBytes(12).toString('hex')}`
    const documentId = `doc_${randomBytes(12).toString('hex')}`
    const fileKey = `${access.workspaceId}/${access.id}/${fileId}.enc`
    await storeEncryptedFile(fileKey, bytes)
    const digest = checksum(bytes)

    const stored = await db.$transaction(async (tx) => {
      const document = await tx.legalDocument.create({
        data: {
          id: documentId,
          title: originalName,
          docType: 'client_upload',
          status: 'received',
          parties: access.client.name,
          caseId: access.caseId,
          clientId: access.clientId,
          notes: 'Uploaded through secure client portal',
          fileKey,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: bytes.length,
          checksumSha256: digest,
          uploadedBy: 'client_portal',
          workspaceId: access.workspaceId,
        },
      })
      const portalFile = await tx.portalFile.create({
        data: {
          id: fileId,
          workspaceId: access.workspaceId,
          portalAccessId: access.id,
          requestId,
          documentId: document.id,
          clientId: access.clientId,
          caseId: access.caseId,
          fileKey,
          originalName,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: bytes.length,
          checksumSha256: digest,
        },
      })
      if (requestId) {
        await tx.portalRequest.update({ where: { id: requestId }, data: { status: 'answered' } })
      }
      await tx.auditLog.create({
        data: { workspaceId: access.workspaceId, action: 'portal.file.upload', entityType: 'PortalFile', entityId: portalFile.id },
      })
      return portalFile
    })

    await recordWorkflowEvent({
      workspaceId: access.workspaceId,
      caseId: access.caseId,
      action: 'client_upload',
      toState: 'received',
      metadata: { portalFileId: stored.id, originalName, sizeBytes: stored.sizeBytes },
    })
    await notifyUsers(access.workspaceId, await workspaceRecipients(access.workspaceId, access.caseId), {
      type: 'portal',
      title: 'ملف جديد من العميل',
      message: `قام ${access.client.name} برفع ${originalName}`,
      link: access.caseId ? `/cases/${access.caseId}` : '/documents',
      entityType: 'PortalFile',
      entityId: stored.id,
    })
    return NextResponse.json({ file: { id: stored.id, originalName: stored.originalName, sizeBytes: stored.sizeBytes, createdAt: stored.createdAt } }, { status: 201 })
  }

  const body = await req.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 160) : ''
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 4000) : ''
  if (!title || !message) return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })

  const request = await db.$transaction(async (tx) => {
    const created = await tx.portalRequest.create({
      data: {
        workspaceId: access.workspaceId,
        portalAccessId: access.id,
        clientId: access.clientId,
        caseId: access.caseId,
        createdBy: 'portal',
        title,
        message,
      },
    })
    await tx.auditLog.create({
      data: { workspaceId: access.workspaceId, action: 'portal.request.create', entityType: 'PortalRequest', entityId: created.id },
    })
    return created
  })
  await recordWorkflowEvent({ workspaceId: access.workspaceId, caseId: access.caseId, action: 'portal_request', toState: 'open', metadata: { requestId: request.id } })
  await notifyUsers(access.workspaceId, await workspaceRecipients(access.workspaceId, access.caseId), {
    type: 'portal',
    title: 'طلب جديد من العميل',
    message: `${access.client.name}: ${title}`,
    link: access.caseId ? `/cases/${access.caseId}` : '/dashboard',
    entityType: 'PortalRequest',
    entityId: request.id,
  })
  return NextResponse.json({ request: { id: request.id, title: request.title, status: request.status, createdAt: request.createdAt } }, { status: 201 })
}
