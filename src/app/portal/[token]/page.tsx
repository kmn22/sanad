import { notFound } from 'next/navigation'
import { getPortalAccess } from '@/lib/portal'
import ClientPortalUnifiedView from './client-portal-unified-view'

export default async function ClientPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const access = await getPortalAccess(token)
  if (!access) return notFound()

  return (
    <ClientPortalUnifiedView
      token={token}
      workspace={access.workspace}
      client={access.client}
      caseData={access.case ? {
        ...access.case,
        invoices: access.case.invoices.map((invoice) => ({
          ...invoice,
          subtotal: Number(invoice.subtotal),
          vatRate: Number(invoice.vatRate),
          vatAmount: Number(invoice.vatAmount),
          total: Number(invoice.total),
          paidAmount: Number(invoice.paidAmount),
        })),
      } : null}
      documents={access.documents.map((document) => ({
        ...document,
        signedDate: document.signedDate?.toISOString() || null,
        updatedAt: document.updatedAt.toISOString(),
      }))}
      requests={access.requests.map((request) => ({
        ...request,
        dueDate: request.dueDate?.toISOString() || null,
        createdAt: request.createdAt.toISOString(),
      }))}
      files={access.files.map((file) => ({
        ...file,
        createdAt: file.createdAt.toISOString(),
      }))}
      allowUpload={access.allowUpload}
      expiresAt={access.expiresAt.toISOString()}
    />
  )
}
