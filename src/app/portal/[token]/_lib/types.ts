export interface PortalInvoice {
  id: string
  number: string
  issueDate: string | Date
  dueDate: string | Date | null
  status: string
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  paidAmount: number
  paidAt: string | Date | null
}

export interface PortalDocument {
  id: string
  title: string
  docType: string
  status: string
  parties: string
  signedDate: string | Date | null
  updatedAt: string | Date
  notes: string | null
}

export interface PortalRequestItem {
  id: string
  title: string
  message: string
  status: string
  priority: string
  dueDate: string | Date | null
  createdAt: string | Date
}

export interface PortalFileItem {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  status?: string
  createdAt: string | Date
}


export interface PortalViewProps {
  token: string
  workspace: { id: string; name: string } | null
  client: { id: string; name: string; type: string; phone?: string | null; email?: string | null }
  caseData: {
    id: string
    title: string
    caseType: string
    stage: string
    priority: string
    dueDate: string | Date | null
    hearingDate: string | Date | null
    caseNumber: string | null
    court: string | null
    opposingParty?: string | null
    notes?: string | null
    invoices?: PortalInvoice[]
  } | null
  documents: PortalDocument[]
  requests: PortalRequestItem[]
  files: PortalFileItem[]
  allowUpload: boolean
  expiresAt: string | Date
}
