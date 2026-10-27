'use client'

import { usePortalView } from './_lib/use-portal-view'
import type { PortalViewProps } from './_lib/types'
import { HomeTab } from './_components/HomeTab'
import { CaseTimelineTab } from './_components/CaseTimelineTab'
import { SessionsTab } from './_components/SessionsTab'
import { DocumentsTab } from './_components/DocumentsTab'
import { InvoicesTab } from './_components/InvoicesTab'
import { MessagesTab } from './_components/MessagesTab'
import { SettingsTab } from './_components/SettingsTab'
import { MoreTab } from './_components/MoreTab'
import { DocumentReviewModal } from './_components/DocumentReviewModal'
import { SignatureModal } from './_components/SignatureModal'
import { PaymentModal } from './_components/PaymentModal'
import { ZatcaStatusModal } from './_components/ZatcaStatusModal'
import { ReceiptModal } from './_components/ReceiptModal'
import { DataDeletionModal } from './_components/DataDeletionModal'
import { GlossaryModal } from './_components/GlossaryModal'
import { BottomNav } from './_components/BottomNav'
import { PortalHeader } from './_components/PortalHeader'
import { ExpiredScreen } from './_components/ExpiredScreen'
import { ActivationScreen } from './_components/ActivationScreen'
import { SessionCheckScreen } from './_components/SessionCheckScreen'

export type { PortalInvoice, PortalDocument, PortalRequestItem, PortalFileItem } from './_lib/types'
export { GLOSSARY_ITEMS, type GlossaryEntry } from '@/lib/portal-glossary'

export default function ClientPortalUnifiedView(props: PortalViewProps) {
  const v = usePortalView(props)

  if (v.checkingSession) return <SessionCheckScreen />
  if (v.isExpired) return <ExpiredScreen v={v} />
  if (!v.isActivated) return <ActivationScreen v={v} />

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-20 md:pb-6" dir="rtl">
      <PortalHeader v={v} />

      <main className="max-w-md md:max-w-2xl mx-auto w-full p-4 space-y-4 flex-1">
        <HomeTab v={v} />
        <CaseTimelineTab v={v} />
        <SessionsTab v={v} />
        <DocumentsTab v={v} />
        <InvoicesTab v={v} />
        <MessagesTab v={v} />
        <SettingsTab v={v} />
        <MoreTab v={v} />
      </main>

      <BottomNav v={v} />

      <DocumentReviewModal v={v} />
      <SignatureModal v={v} />
      <PaymentModal v={v} />
      <ZatcaStatusModal v={v} />
      <ReceiptModal v={v} />
      <DataDeletionModal v={v} />
      <GlossaryModal v={v} />
    </div>
  )
}
