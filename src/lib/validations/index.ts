import { z } from 'zod'

// ===== Auth Schema =====
export const loginSchema = z.object({
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

// ===== Legal Case Schemas =====
export const createCaseSchema = z.object({
  title: z.string().min(1, 'عنوان القضية مطلوب').max(200),
  clientName: z.string().min(1, 'اسم العميل مطلوب').max(100),
  clientId: z.string().optional().nullable(),
  caseType: z.enum([
    'litigation',
    'contract',
    'consultation',
    'ip',
    'corporate',
    'commercial',
    'labor',
    'administrative',
    'enforcement',
    'family',
  ]).default('commercial'),
  stage: z.enum([
    'drafting',
    'client_review',
    'filed',
    'closed',
    'intake',
    'pleading',
    'hearing',
    'appeal',
    'enforcement',
  ]).default('drafting'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  dueDate: z.string().optional().nullable().transform(v => v ? new Date(v) : null),
  hearingDate: z.string().optional().nullable().transform(v => v ? new Date(v) : null),
  value: z.number().optional().nullable(),
  caseNumber: z.string().optional().nullable(),
  court: z.string().optional().nullable(),
  opposingParty: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  portalToken: z.string().optional().nullable(),
})

export const updateCaseSchema = createCaseSchema.partial()

// ===== Client Schemas =====
export const createClientSchema = z.object({
  name: z.string().min(1, 'اسم العميل مطلوب').max(100),
  type: z.enum(['individual', 'corporate']).default('individual'),
  phone: z.string().optional().nullable(),
  email: z.string().email('صيغة البريد غير صحيحة').optional().nullable().or(z.literal('')),
  nationalId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateClientSchema = createClientSchema.partial()

// ===== Task Schemas =====
export const createTaskSchema = z.object({
  title: z.string().min(1, 'عنوان المهمة مطلوب').max(200),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  dueDate: z.string().optional().nullable().transform(v => v ? new Date(v) : null),
  caseId: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  relatedDoc: z.string().optional().nullable(),
})

export const updateTaskSchema = createTaskSchema.partial()

// ===== Document Schemas =====
export const createDocumentSchema = z.object({
  title: z.string().min(1, 'عنوان المستند مطلوب').max(200),
  docType: z.string().min(1, 'نوع المستند مطلوب'),
  status: z.enum(['draft', 'sent', 'received', 'active', 'expiring', 'expired']).default('draft'),
  parties: z.string().default(''),
  signedDate: z.string().optional().nullable().transform(v => v ? new Date(v) : null),
  expiryDate: z.string().optional().nullable().transform(v => v ? new Date(v) : null),
  caseId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateDocumentSchema = createDocumentSchema.partial()

// ===== Invoice Schemas =====
export const createInvoiceSchema = z.object({
  number: z.string().min(1, 'رقم الفاتورة مطلوب'),
  clientId: z.string().optional().nullable(),
  caseId: z.string().optional().nullable(),
  issueDate: z.string().optional().nullable().transform(v => v ? new Date(v) : new Date()),
  dueDate: z.string().optional().nullable().transform(v => v ? new Date(v) : null),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  subtotal: z.number().min(0).default(0),
  vatRate: z.number().min(0).default(15),
  vatAmount: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  paidAt: z.union([z.string(), z.date()]).optional().nullable().transform(v => v ? new Date(v) : null),
  notes: z.string().optional().nullable(),
})

export const updateInvoiceSchema = createInvoiceSchema.partial()
