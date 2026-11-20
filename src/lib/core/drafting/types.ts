export type DocumentCategory = 'contract' | 'pleading'

export type ContractType = 'employment' | 'nda' | 'services' | 'settlement'
export type PleadingType = 'claim' | 'defense' | 'appeal'

export type TemplateId = ContractType | PleadingType

export interface RegulatorySafeguard {
  id: string
  law: string // e.g. "نظام المعاملات المدنية (م/179)"
  type: 'warning' | 'info' | 'tip'
  messageAr: string
  messageEn: string
  applicableFields: string[]
}

export interface TemplateField {
  id: string
  labelAr: string
  labelEn: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'select'
  placeholderAr?: string
  placeholderEn?: string
  options?: { value: string; labelAr: string; labelEn: string }[]
  defaultValue?: string | number
  required?: boolean
  helpTextAr?: string
  helpTextEn?: string
}

export interface DocumentTemplate {
  id: TemplateId
  category: DocumentCategory
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  defaultDocType: string // maps to LegalDocument docType
  fields: TemplateField[]
  safeguards: RegulatorySafeguard[]
  generateFallback: (answers: Record<string, any>) => string
}
