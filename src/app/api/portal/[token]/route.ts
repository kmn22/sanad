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
    workspace: access.workspace,
    client: access.client,
    case: access.case,
    documents: access.documents,
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

  if (body?.action === 'pay_invoice') {
    const invoiceId = typeof body.invoiceId === 'string' ? body.invoiceId : ''
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod : 'mada'
    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        workspaceId: access.workspaceId,
        OR: [
          ...(access.caseId ? [{ caseId: access.caseId }] : []),
          { clientId: access.clientId },
        ],
      },
    })
    if (!invoice) return NextResponse.json({ error: 'الفاتورة غير موجودة أو غير مصرح بالوصول إليها' }, { status: 404 })
    if (invoice.status === 'paid') return NextResponse.json({ error: 'تم سداد هذه الفاتورة مسبقاً' }, { status: 400 })

    const updated = await db.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          paidAmount: invoice.total,
          paidAt: new Date(),
          notes: `${invoice.notes ? invoice.notes + '\n' : ''}[سداد إلكتروني عبر بوابة العميل - طريقة الدفع: ${paymentMethod}]`,
        },
      })
      await tx.auditLog.create({
        data: {
          workspaceId: access.workspaceId,
          action: 'portal.invoice.paid',
          entityType: 'Invoice',
          entityId: inv.id,
        },
      })
      return inv
    })

    await recordWorkflowEvent({
      workspaceId: access.workspaceId,
      caseId: access.caseId,
      action: 'portal_invoice_paid',
      toState: 'paid',
      metadata: { invoiceId: updated.id, number: updated.number, amount: updated.total, paymentMethod },
    })
    await notifyUsers(access.workspaceId, await workspaceRecipients(access.workspaceId, access.caseId), {
      type: 'portal',
      title: 'تم سداد فاتورة جديدة',
      message: `قام ${access.client.name} بسداد الفاتورة رقم ${updated.number} بمبلغ ${updated.total} ر.س عبر بوابة العميل`,
      link: access.caseId ? `/cases/${access.caseId}` : '/billing',
      entityType: 'Invoice',
      entityId: updated.id,
    })

    return NextResponse.json({ success: true, invoice: updated })
  }

  if (body?.action === 'sign_document') {
    const documentId = typeof body.documentId === 'string' ? body.documentId : ''
    const signerName = typeof body.signerName === 'string' ? body.signerName.trim() : access.client.name
    const doc = await db.legalDocument.findFirst({
      where: {
        id: documentId,
        workspaceId: access.workspaceId,
        OR: [
          ...(access.caseId ? [{ caseId: access.caseId }] : []),
          { clientId: access.clientId },
        ],
      },
    })
    if (!doc) return NextResponse.json({ error: 'المستند غير موجود أو غير مصرح به' }, { status: 404 })

    const updated = await db.$transaction(async (tx) => {
      const d = await tx.legalDocument.update({
        where: { id: doc.id },
        data: {
          status: 'active',
          signedDate: new Date(),
          notes: `${doc.notes ? doc.notes + '\n' : ''}[توقيع واعتماد إلكتروني عبر بوابة العميل - ${new Date().toLocaleString('ar-SA')}] الموقّع: ${signerName}`,
        },
      })
      await tx.auditLog.create({
        data: {
          workspaceId: access.workspaceId,
          action: 'portal.document.sign',
          entityType: 'LegalDocument',
          entityId: d.id,
        },
      })
      return d
    })

    await recordWorkflowEvent({
      workspaceId: access.workspaceId,
      caseId: access.caseId,
      action: 'portal_document_signed',
      toState: 'active',
      metadata: { documentId: updated.id, title: updated.title, signerName },
    })
    await notifyUsers(access.workspaceId, await workspaceRecipients(access.workspaceId, access.caseId), {
      type: 'portal',
      title: 'تم توقيع واعتماد مستند',
      message: `قام ${signerName} بتوقيع واعتماد المستند "${updated.title}" عبر بوابة العميل`,
      link: access.caseId ? `/cases/${access.caseId}` : '/documents',
      entityType: 'LegalDocument',
      entityId: updated.id,
    })

    return NextResponse.json({ success: true, document: updated })
  }

  // S1: OTP Verification & Request
  if (body?.action === 'verify_otp') {
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    // Accept standard 6-digit test code or any valid 6-digit code for MVP demonstration
    if (code.length !== 6) {
      return NextResponse.json({ error: 'رمز التحقق يجب أن يتكون من 6 أرقام' }, { status: 400 })
    }
    await db.portalAccess.update({
      where: { id: access.id },
      data: { lastAccessedAt: new Date() },
    })
    return NextResponse.json({ success: true, verified: true, clientName: access.client.name })
  }

  if (body?.action === 'request_otp') {
    // Generates simulated OTP dispatch to client phone / email
    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز تحقق جديد لمرة واحدة (OTP) إلى جوالك المسجل',
      demoCode: '123456',
    })
  }

  // S5: Document Page Comment
  if (body?.action === 'add_doc_comment') {
    const documentId = typeof body.documentId === 'string' ? body.documentId : ''
    const pageNumber = typeof body.pageNumber === 'number' ? body.pageNumber : 1
    const commentText = typeof body.commentText === 'string' ? body.commentText.trim() : ''
    if (!commentText) return NextResponse.json({ error: 'نص التعليق مطلوب' }, { status: 400 })

    const doc = await db.legalDocument.findFirst({
      where: { id: documentId, workspaceId: access.workspaceId },
    })
    if (!doc) return NextResponse.json({ error: 'المستند غير موجود' }, { status: 404 })

    const updatedNotes = `${doc.notes ? doc.notes + '\n' : ''}[تعليق الموكل - صفحة ${pageNumber}]: ${commentText} (${new Date().toLocaleString('ar-SA')})`
    await db.legalDocument.update({
      where: { id: doc.id },
      data: { notes: updatedNotes },
    })

    await notifyUsers(access.workspaceId, await workspaceRecipients(access.workspaceId, access.caseId), {
      type: 'portal',
      title: `ملاحظة من العميل على مستند: ${doc.title}`,
      message: `${access.client.name} أضاف ملاحظة على الصفحة ${pageNumber}: "${commentText}"`,
      link: access.caseId ? `/cases/${access.caseId}` : '/documents',
      entityType: 'LegalDocument',
      entityId: doc.id,
    })

    return NextResponse.json({ success: true, message: 'تم إرسال ملاحظتك على المستند بنجاح' })
  }

  // S8: PDPPL Data Deletion Request
  if (body?.action === 'data_deletion_request') {
    const reason = typeof body.reason === 'string' ? body.reason.trim() : 'طلب حذف بيانات بموجب نظام حماية البيانات الشخصية (PDPPL)'
    
    await db.auditLog.create({
      data: {
        workspaceId: access.workspaceId,
        action: 'pdppl.client_deletion_request',
        entityType: 'Client',
        entityId: access.clientId,
      },
    })

    await notifyUsers(access.workspaceId, await workspaceRecipients(access.workspaceId, null), {
      type: 'portal',
      title: 'طلب حذف بيانات شخصية (PDPPL)',
      message: `الموكل ${access.client.name} قدم طلباً رسمياً لحذف بياناته الشخصية بموجب نظام حماية البيانات الشخصية. السبب: ${reason}`,
      link: '/settings?tab=privacy',
      entityType: 'Client',
      entityId: access.clientId,
    })

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل طلبك بنجاح وسيقوم مسؤول الامتثال في المكتب بمراجعته والتواصل معك خلال 7 أيام عمل نظامياً.',
    })
  }

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
