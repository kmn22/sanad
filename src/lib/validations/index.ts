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
  confidential: z.boolean().optional(),
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
  visibility: z.enum(['internal', 'client']).optional(),
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

// ===== Compliance Schemas =====
export const createComplianceSchema = z.object({
  title: z.string().min(1, 'عنوان البند مطلوب').max(200),
  category: z.string().min(1, 'التصنيف مطلوب').max(50),
  entityName: z.string().min(1, 'اسم الكيان أو الشخص مطلوب').max(200),
  issueDate: z.union([z.string(), z.date()]).optional().nullable().transform(v => v ? new Date(v) : new Date()),
  expiryDate: z.union([z.string(), z.date()]).transform(v => new Date(v)),
  status: z.enum(['active', 'expiring', 'expired', 'renewed']).default('active'),
  notes: z.string().optional().nullable(),
  notifyDays: z.number().int().min(1).default(30),
})

export const updateComplianceSchema = createComplianceSchema.partial()

// ===== Academic / Education Schemas =====
// The education module is entitlement-gated; these schemas replace the prior
// unbounded `{ ...body }` mass-assignment on the academic routes.
const requiredDate = z
  .union([z.string(), z.date()])
  .refine((v) => !isNaN(new Date(v).getTime()), 'تاريخ غير صالح')
  .transform((v) => new Date(v))

export const createCourseSchema = z.object({
  title: z.string().min(1, 'اسم المقرر مطلوب').max(200),
  code: z.string().max(50).optional().nullable(),
  instructor: z.string().max(120).optional().nullable(),
  semester: z.string().max(60).optional().nullable(),
  credits: z.number().int().min(0).max(100).optional().nullable(),
  color: z.string().max(20).optional(),
  notes: z.string().max(5000).optional().nullable(),
})
export const updateCourseSchema = createCourseSchema.partial()

export const createLectureSchema = z.object({
  courseId: z.string().min(1, 'المقرر مطلوب'),
  title: z.string().min(1, 'عنوان المحاضرة مطلوب').max(200),
  lectureDate: requiredDate,
  topic: z.string().max(200).optional().nullable(),
  notes: z.string().max(20000).default(''),
  attachments: z.string().max(5000).optional().nullable(),
  status: z.enum(['draft', 'reviewed', 'mastered']).default('draft'),
})
export const updateLectureSchema = createLectureSchema.partial()

export const createDeadlineSchema = z.object({
  courseId: z.string().optional().nullable(),
  title: z.string().min(1, 'عنوان الاستحقاق مطلوب').max(200),
  type: z.string().min(1).max(60),
  dueDate: requiredDate,
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  weight: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
})
export const updateDeadlineSchema = createDeadlineSchema.partial()

export const createTermSchema = z.object({
  term: z.string().min(1, 'المصطلح مطلوب').max(200),
  definition: z.string().min(1, 'التعريف مطلوب').max(10000),
  category: z.string().max(60).default('general'),
  origin: z.string().max(200).optional().nullable(),
  example: z.string().max(5000).optional().nullable(),
  mastery: z.enum(['learning', 'familiar', 'mastered']).default('learning'),
})
export const updateTermSchema = createTermSchema.partial()

export const createCaseEntrySchema = z.object({
  caseName: z.string().min(1, 'اسم القضية مطلوب').max(200),
  citation: z.string().max(200).optional().nullable(),
  court: z.string().max(200).optional().nullable(),
  principle: z.string().min(1, 'المبدأ القانوني مطلوب').max(10000),
  subject: z.string().min(1, 'الموضوع مطلوب').max(120),
  summary: z.string().max(20000).optional().nullable(),
  significance: z.string().max(10000).optional().nullable(),
  rating: z.number().int().min(1).max(5).default(3),
})
export const updateCaseEntrySchema = createCaseEntrySchema.partial()
