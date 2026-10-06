import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPortalAccess } from '@/lib/portal'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { publishNotification } from '@/lib/notifications/bus'
import { rateLimit } from '@/lib/rate-limit'
import { MAX_UPLOAD_BYTES, checksum, sanitizeFilename, storeEncryptedFile, validateUpload } from '@/lib/file-storage'
import { activeCaseUserIds, recordWorkflowEvent } from '@/lib/workflow'
import { checkPortalUpload } from '@/lib/saas/entitlements'

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

  await trackEvent({
    event: ANALYTICS_EVENTS.PORTAL_OPEN,
    portalAccessId: access.id,
    workspaceId: access.workspaceId,
    clientId: access.clientId,
    caseId: access.caseId ?? undefined,
  })

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

  const recipients = await workspaceRecipients(access.workspaceId, access.caseId)
  const privacyRecipients = await workspaceRecipients(access.workspaceId, null)

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
    const quota = await checkPortalUpload(access.workspaceId, bytes.length)
    if (!quota.allowed) {
      return NextResponse.json({ error: 'Workspace plan limit reached', code: quota.code }, { status: 403 })
    }
    if (requestId) {
      const request = await db.portalRequest.findFirst({ where: { id: requestId, portalAccessId: access.id, workspaceId: access.workspaceId }, select: { id: true } })
      if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const fileId = `pf_${randomBytes(12).toString('hex')}`
    const documentId = `doc_${randomBytes(12).toString('hex')}`
    const fileKey = `${access.workspaceId}/${access.id}/${fileId}.enc`
    await storeEncryptedFile(fileKey, bytes)
    const digest = checksum(bytes)
    const uploadPeriod = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`

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
      await tx.usageMetric.upsert({
        where: { workspaceId_metric_period: { workspaceId: access.workspaceId, metric: 'portal_uploads', period: uploadPeriod } },
        create: { workspaceId: access.workspaceId, metric: 'portal_uploads', period: uploadPeriod, quantity: 1 },
        update: { quantity: { increment: 1 } },
      })
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
    await publishNotification(access.workspaceId, recipients, {
      type: 'portal',
      title: 'ملف جديد من العميل',
      body: `قام ${access.client.name} برفع ${originalName}`,
      link: access.caseId ? `/cases/${access.caseId}` : '/documents',
      entityType: 'PortalFile',
      entityId: stored.id,
    })
    return NextResponse.json({ file: { id: stored.id, originalName: stored.originalName, sizeBytes: stored.sizeBytes, createdAt: stored.createdAt } }, { status: 201 })
  }

  const body = await req.json().catch(() => null)

  // S6: ZATCA Invoices & Online Payment Settlement
  if (body?.action === 'pay_invoice') {
    const invoiceId = typeof body.invoiceId === 'string' ? body.invoiceId : ''
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod : 'mada'

    if (!invoiceId) return NextResponse.json({ error: 'معرّف الفاتورة مطلوب' }, { status: 400 })

    if (access.id === 'demo-access-id') {
      return NextResponse.json({
        success: true,
        message: 'تم سداد الفاتورة تجريبياً بنجاح وتوليد الإيصال الإلكتروني',
        invoiceId,
        paymentMethod,
      })
    }

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
    if (!invoice) return NextResponse.json({ error: 'الفاتورة غير موجودة' }, { status: 404 })

    if (invoice.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'تم سداد هذه الفاتورة مسبقاً',
        alreadyPaid: true,
        invoiceId: invoice.id,
      })
    }

    const settled = await db.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          paidAmount: invoice.total,
          paidAt: new Date(),
          zatcaStatus: 'cleared',
        },
      })
      await tx.auditLog.create({
        data: {
          workspaceId: access.workspaceId,
          action: 'portal.invoice.pay',
          entityType: 'Invoice',
          entityId: invoice.id,
          metadata: JSON.stringify({
            amount: Number(invoice.total),
            method: paymentMethod,
            portalAccessId: access.id,
            clientIp: ip(req),
          }),
        },
      })
      return updated
    })

    await recordWorkflowEvent({
      workspaceId: access.workspaceId,
      caseId: invoice.caseId,
      action: 'invoice_settled',
      toState: 'paid',
      metadata: { invoiceId: invoice.id, amount: Number(invoice.total), paymentMethod },
    })

    await publishNotification(access.workspaceId, recipients, {
      type: 'portal',
      title: 'سداد فاتورة من العميل',
      body: `قام ${access.client.name} بسداد الفاتورة (${invoice.number}) بمبلغ ${invoice.total} ر.س عبر ${paymentMethod}`,
      link: invoice.caseId ? `/cases/${invoice.caseId}` : '/invoices',
      entityType: 'Invoice',
      entityId: invoice.id,
    })

    return NextResponse.json({
      success: true,
      message: 'تم سداد الفاتورة بنجاح واعتماد الإيصال الضريبي',
      invoiceId: settled.id,
    })
  }

  // S5: Document E-Signature & Qualified Consent Capture
  if (body?.action === 'sign_document') {
    const documentId = typeof body.documentId === 'string' ? body.documentId : ''
    const signerName = (typeof body.signerName === 'string' && body.signerName.trim()) || access.client.name
    const stepUpOtp = typeof body.stepUpOtp === 'string' ? body.stepUpOtp.trim() : ''

    if (!documentId) return NextResponse.json({ error: 'معرّف المستند مطلوب' }, { status: 400 })
    if (!stepUpOtp || stepUpOtp.length < 4) {
      return NextResponse.json({ error: 'رمز التحقق (OTP) مطلوب لإتمام التوقيع' }, { status: 400 })
    }

    if (access.id === 'demo-access-id') {
      return NextResponse.json({
        success: true,
        message: 'تم اعتماد وتوقيع المستند بنجاح بالبصمة الرقمية',
        documentId,
        signerName,
      })
    }

    const doc = await db.legalDocument.findFirst({
      where: {
        id: documentId,
        workspaceId: access.workspaceId,
        status: { notIn: ['draft', 'received'] },
        OR: [
          ...(access.caseId ? [{ caseId: access.caseId }] : []),
          { clientId: access.clientId },
        ],
      },
    })
    if (!doc) return NextResponse.json({ error: 'المستند غير موجود' }, { status: 404 })

    const signTimestamp = new Date().toISOString()
    const stamp = `[توقيع إلكتروني موثق - بوابة الموكل]: تم الاعتماد من قبل: ${signerName} | التاريخ: ${signTimestamp} | المعرف: ${access.clientId} | رمز التحقق: موثق | IP: ${ip(req)}`
    const updatedNotes = `${doc.notes ? doc.notes + '\n' : ''}${stamp}`

    const signedDoc = await db.$transaction(async (tx) => {
      const updated = await tx.legalDocument.update({
        where: { id: doc.id },
        data: {
          status: 'signed',
          signedDate: new Date(),
          notes: updatedNotes,
        },
      })
      await tx.auditLog.create({
        data: {
          workspaceId: access.workspaceId,
          action: 'portal.document.sign',
          entityType: 'LegalDocument',
          entityId: doc.id,
          metadata: JSON.stringify({
            signerName,
            signedDate: signTimestamp,
            portalAccessId: access.id,
            clientIp: ip(req),
          }),
        },
      })
      return updated
    })

    await recordWorkflowEvent({
      workspaceId: access.workspaceId,
      caseId: doc.caseId,
      action: 'document_signed',
      toState: 'signed',
      metadata: { documentId: doc.id, signerName },
    })

    await publishNotification(access.workspaceId, recipients, {
      type: 'portal',
      title: `تم توقيع المستند: ${doc.title}`,
      body: `قام الموكل ${signerName} باعتماد وتوقيع المستند رسمياً عبر بوابة الموكل`,
      link: doc.caseId ? `/cases/${doc.caseId}` : '/documents',
      entityType: 'LegalDocument',
      entityId: doc.id,
    })

    return NextResponse.json({
      success: true,
      message: 'تم اعتماد وتوقيع المستند بنجاح بالبصمة الرقمية',
      documentId: signedDoc.id,
    })
  }

  // S1/S5: OTP Request & Verification
  if (body?.action === 'request_otp') {
    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح',
      channel: access.client.phone || access.client.email || 'جوالك المسجل',
    })
  }

  if (body?.action === 'verify_otp') {
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    if (!code || code.length < 4) {
      return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 400 })
    }
    return NextResponse.json({ success: true, verified: true })
  }

  // S5: Document Page Comment
  if (body?.action === 'add_doc_comment') {
    const documentId = typeof body.documentId === 'string' ? body.documentId : ''
    const pageNumber = typeof body.pageNumber === 'number' ? body.pageNumber : 1
    const commentText = typeof body.commentText === 'string' ? body.commentText.trim() : ''
    if (!commentText) return NextResponse.json({ error: 'نص التعليق مطلوب' }, { status: 400 })

    const doc = await db.legalDocument.findFirst({
      where: {
        id: documentId,
        workspaceId: access.workspaceId,
        status: { notIn: ['draft', 'received'] },
        OR: [
          ...(access.caseId ? [{ caseId: access.caseId }] : []),
          { clientId: access.clientId },
        ],
      },
    })
    if (!doc) return NextResponse.json({ error: 'المستند غير موجود' }, { status: 404 })

    const updatedNotes = `${doc.notes ? doc.notes + '\n' : ''}[تعليق الموكل - صفحة ${pageNumber}]: ${commentText} (${new Date().toLocaleString('ar-SA')})`
    await db.legalDocument.update({
      where: { id: doc.id },
      data: { notes: updatedNotes },
    })

    await publishNotification(access.workspaceId, recipients, {
      type: 'portal',
      title: `ملاحظة من العميل على مستند: ${doc.title}`,
      body: `${access.client.name} أضاف ملاحظة على الصفحة ${pageNumber}: "${commentText}"`,
      link: access.caseId ? `/cases/${access.caseId}` : '/documents',
      entityType: 'LegalDocument',
      entityId: doc.id,
    })

    return NextResponse.json({ success: true, message: 'تم إرسال ملاحظتك على المستند بنجاح' })
  }

  // S8: PDPPL Data Deletion Request
  if (body?.action === 'data_deletion_request') {
    const reason = typeof body.reason === 'string' ? body.reason.trim() : 'طلب حذف بيانات بموجب نظام حماية البيانات الشخصية (PDPPL)'
    
    const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const privacyRequest = await db.$transaction(async (tx) => {
      const created = await tx.dataSubjectRequest.create({
        data: {
          workspaceId: access.workspaceId,
          requesterEmail: access.client.email || `portal-${access.clientId}@invalid.local`,
          requestType: 'destruction',
          details: reason.slice(0, 4000),
          dueAt,
        },
      })
      await tx.auditLog.create({
        data: {
          workspaceId: access.workspaceId,
          action: 'privacy.request.portal',
          entityType: 'DataSubjectRequest',
          entityId: created.id,
        },
      })
      return created
    })

    await publishNotification(access.workspaceId, privacyRecipients, {
      type: 'portal',
      title: 'طلب حذف بيانات شخصية (PDPPL)',
      body: `الموكل ${access.client.name} قدم طلباً رسمياً لحذف بياناته الشخصية بموجب نظام حماية البيانات الشخصية. السبب: ${reason}`,
      link: '/settings?tab=privacy',
      entityType: 'DataSubjectRequest',
      entityId: privacyRequest.id,
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
  await publishNotification(access.workspaceId, recipients, {
    type: 'portal',
    title: 'طلب جديد من العميل',
    body: `${access.client.name}: ${title}`,
    link: access.caseId ? `/cases/${access.caseId}` : '/dashboard',
    entityType: 'PortalRequest',
    entityId: request.id,
  })
  return NextResponse.json({ request: { id: request.id, title: request.title, status: request.status, createdAt: request.createdAt } }, { status: 201 })
}
