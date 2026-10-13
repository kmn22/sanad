import {
  type Client,
  type Task,
  type TimeEntry,
  type Communication,
  type Invoice,
  type LegalDocument,
} from '@/lib/sanad/types'

/** Full case detail payload returned by GET /api/cases/[id]/detail */
export interface CaseDetail {
  id: string
  title: string
  clientId: string | null
  clientName: string
  caseType: string
  stage: string
  priority: string
  dueDate: string | null
  hearingDate: string | null
  value: number | null
  caseNumber: string | null
  court: string | null
  opposingParty: string | null
  notes: string | null
  client: Client | null
  timeEntries: (TimeEntry & { invoice?: { id: string; number: string } | null })[]
  communications: (Communication & { client?: { name: string } | null })[]
  invoices: Invoice[]
  tasks: Task[]
  documents: LegalDocument[]
  stats: {
    billableSec: number
    billableSAR: number
    uninvoicedSAR: number
    invoicedSAR: number
    totalCommunications: number
    totalInvoices: number
    openTasks: number
  }
}
