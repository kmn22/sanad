import { createHash } from 'crypto'
import { db } from '@/lib/db'

export function hashPortalToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function getPortalAccess(token: string) {
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_PORTAL === 'true' && (token === 'demo-token' || token === 'demo')) {
    return {
      id: 'demo-access-id',
      tokenHash: 'demo',
      workspaceId: 'demo-workspace-id',
      clientId: 'demo-client-id',
      caseId: 'demo-case-id',
      allowUpload: true,
      expiresAt: new Date(Date.now() + 30 * 86400000),
      lastAccessedAt: new Date(),
      revokedAt: null,
      workspace: { id: 'demo-workspace-id', name: 'مكتب العاصم للمحاماة والاستشارات القانونية' },
      client: { id: 'demo-client-id', name: 'سارة عبد الله', type: 'individual', phone: '+966 50 123 4567', email: 'sara@example.com' },
      case: {
        id: 'demo-case-id',
        title: 'قضية عقد العمل — شركة الريف للتجارة',
        caseType: 'منازعات عمالية',
        stage: 'جلسة أولى',
        priority: 'high',
        dueDate: new Date(Date.now() + 14 * 86400000),
        hearingDate: new Date('2026-10-15T09:00:00Z'),
        caseNumber: 'CR-2026/894',
        court: 'المحكمة العامة بجدة — الدائرة العمالية الرابعة',
        opposingParty: 'شركة الريف للتجارة والاستثمار',
        notes: 'متابعة مستحقات نهاية الخدمة والبدلات النظامية',
        workspaceId: 'demo-workspace-id',
        invoices: [
          {
            id: 'inv-demo-1',
            number: 'INV-2026-0042',
            issueDate: new Date('2026-10-01'),
            dueDate: new Date(Date.now() + 5 * 86400000),
            status: 'sent',
            subtotal: 2500,
            vatRate: 15,
            vatAmount: 375,
            total: 2875,
            paidAmount: 0,
            paidAt: null,
            zatcaStatus: 'reported',
            zatcaHash: '3b89f81a7029...',
          },
          {
            id: 'inv-demo-2',
            number: 'INV-2026-0031',
            issueDate: new Date('2026-09-15'),
            dueDate: new Date('2026-09-28'),
            status: 'paid',
            subtotal: 1000,
            vatRate: 15,
            vatAmount: 150,
            total: 1150,
            paidAmount: 1150,
            paidAt: new Date('2026-09-28'),
            zatcaStatus: 'cleared',
            zatcaHash: '1a98e72b4012...',
          },
        ],
      },
      requests: [
        {
          id: 'req-demo-1',
          title: 'تأكيد الحضور في الجلسة الأولى',
          message: 'نرجو مراجعة مذكرة الدفاع وتأكيد الاطلاع.',
          status: 'pending',
          priority: 'urgent',
          dueDate: new Date(Date.now() + 3 * 86400000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      files: [],
      documents: [
        {
          id: 'doc-demo-1',
          title: 'عقد عمل محدد المدة — شركة الريف',
          docType: 'contract',
          status: 'pending_review',
          parties: 'سارة عبد الله / شركة الريف',
          signedDate: null,
          updatedAt: new Date(),
          notes: 'مطلوب مراجعة البند الرابع والمتعلق بساعات العمل الإضافية',
        },
        {
          id: 'doc-demo-2',
          title: 'توكيل رسمي وقضائي',
          docType: 'power_of_attorney',
          status: 'signed',
          parties: 'سارة عبد الله',
          signedDate: new Date('2026-09-10'),
          updatedAt: new Date('2026-09-10'),
          notes: 'معتمد لدى وزارة العدل برقم 44102941',
        },
        {
          id: 'doc-demo-3',
          title: 'مذكرة دفاع أولى — الرد على الدعوى',
          docType: 'legal_memo',
          status: 'sent',
          parties: 'الدائرة العمالية الرابعة',
          signedDate: null,
          updatedAt: new Date('2026-09-20'),
          notes: 'تم تقديمها لدى المحكمة ومشاركتها للاطلاع',
        },
      ],
    }
  }

  if (!/^[a-f0-9]{64}$/i.test(token)) return null
  const access = await db.portalAccess.findUnique({
    where: { tokenHash: hashPortalToken(token) },
    include: {
      workspace: { select: { id: true, name: true } },
      client: { select: { id: true, name: true, type: true, phone: true, email: true } },
      case: {
        select: {
          id: true,
          title: true,
          caseType: true,
          stage: true,
          priority: true,
          dueDate: true,
          hearingDate: true,
          caseNumber: true,
          court: true,
          opposingParty: true,
          notes: true,
          workspaceId: true,
          invoices: {
            where: { status: { in: ['sent', 'paid', 'overdue'] }, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              number: true,
              issueDate: true,
              dueDate: true,
              status: true,
              subtotal: true,
              vatRate: true,
              vatAmount: true,
              total: true,
              paidAmount: true,
              paidAt: true,
            },
          },
        },
      },
      requests: {
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: { id: true, title: true, message: true, status: true, priority: true, dueDate: true, createdAt: true, updatedAt: true },
      },
      files: {
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: { id: true, originalName: true, mimeType: true, sizeBytes: true, status: true, createdAt: true, requestId: true },
      },
    },
  })
  if (!access || access.revokedAt || access.expiresAt <= new Date()) return null
  await db.portalAccess.update({ where: { id: access.id }, data: { lastAccessedAt: new Date() } })

  const documents = await db.legalDocument.findMany({
    where: {
      workspaceId: access.workspaceId,
      deletedAt: null,
      visibility: 'client',
      status: { notIn: ['draft', 'received'] },
      OR: [
        ...(access.caseId ? [{ caseId: access.caseId }] : []),
        { clientId: access.clientId },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      docType: true,
      status: true,
      parties: true,
      signedDate: true,
      updatedAt: true,
      notes: true,
    },
    take: 15,
  })

  return { ...access, documents }
}
