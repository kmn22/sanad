import type { LegalDocument, LegalCase } from '@/lib/sanad/types'

export interface DocumentsViewProps {
  documents: LegalDocument[]
  cases: LegalCase[]
  onChange: () => void
}

export const STATUSES = ['draft', 'sent', 'active', 'expiring', 'expired'] as const
export const DOC_TYPES = ['nda', 'employment', 'non_compete', 'msa', 'subcontract', 'policy'] as const
