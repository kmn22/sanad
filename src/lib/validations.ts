import { z } from "zod"

// Max lengths to prevent abuse
const SHORT_TEXT = 500
const LONG_TEXT = 5000

export const clientSchema = z.object({
  name: z.string().min(1).max(SHORT_TEXT),
  type: z.enum(["individual", "corporate"]).default("individual"),
  phone: z.string().max(30).nullable().optional(),
  email: z.string().email().max(SHORT_TEXT).nullable().optional(),
  nationalId: z.string().max(30).nullable().optional(),
  address: z.string().max(SHORT_TEXT).nullable().optional(),
  company: z.string().max(SHORT_TEXT).nullable().optional(),
  notes: z.string().max(LONG_TEXT).nullable().optional(),
})

export const caseSchema = z.object({
  title: z.string().min(1).max(SHORT_TEXT),
  clientId: z.string().max(100).nullable().optional(),
  clientName: z.string().min(1).max(SHORT_TEXT),
  caseType: z.enum(["litigation", "contract", "consultation", "ip", "corporate"]),
  stage: z.enum(["drafting", "client_review", "filed", "closed"]).default("drafting"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  dueDate: z.string().datetime().nullable().optional(),
  hearingDate: z.string().datetime().nullable().optional(),
  value: z.number().nullable().optional(),
  caseNumber: z.string().max(100).nullable().optional(),
  court: z.string().max(SHORT_TEXT).nullable().optional(),
  opposingParty: z.string().max(SHORT_TEXT).nullable().optional(),
  notes: z.string().max(LONG_TEXT).nullable().optional(),
})

export const casePatchSchema = z.object({
  title: z.string().min(1).max(SHORT_TEXT).optional(),
  clientId: z.string().max(100).nullable().optional(),
  clientName: z.string().min(1).max(SHORT_TEXT).optional(),
  caseType: z.enum(["litigation", "contract", "consultation", "ip", "corporate"]).optional(),
  stage: z.enum(["drafting", "client_review", "filed", "closed"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  hearingDate: z.string().datetime().nullable().optional(),
  value: z.number().nullable().optional(),
  caseNumber: z.string().max(100).nullable().optional(),
  court: z.string().max(SHORT_TEXT).nullable().optional(),
  opposingParty: z.string().max(SHORT_TEXT).nullable().optional(),
  notes: z.string().max(LONG_TEXT).nullable().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1).max(SHORT_TEXT),
  description: z.string().max(LONG_TEXT).nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  dueDate: z.string().datetime().nullable().optional(),
  relatedDoc: z.string().max(SHORT_TEXT).nullable().optional(),
  caseId: z.string().max(100).nullable().optional(),
  autoGen: z.boolean().default(false),
})

export const taskPatchSchema = z.object({
  title: z.string().min(1).max(SHORT_TEXT).optional(),
  description: z.string().max(LONG_TEXT).nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  relatedDoc: z.string().max(SHORT_TEXT).nullable().optional(),
  caseId: z.string().max(100).nullable().optional(),
})

export const complianceSchema = z.object({
  title: z.string().min(1).max(SHORT_TEXT),
  category: z.enum(["iqama", "cr", "contract", "license", "tax", "gosi", "ikama"]),
  entityName: z.string().min(1).max(SHORT_TEXT),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  status: z.enum(["active", "expiring", "expired", "renewed"]).default("active"),
  notes: z.string().max(LONG_TEXT).nullable().optional(),
  notifyDays: z.number().int().min(1).max(365).default(30),
})

export const documentSchema = z.object({
  title: z.string().min(1).max(SHORT_TEXT),
  docType: z.enum(["nda", "employment", "non_compete", "msa", "subcontract", "policy", "pleading", "contract_draft", "court_filing"]),
  status: z.enum(["draft", "sent", "active", "expiring", "expired"]).default("draft"),
  parties: z.string().min(1).max(SHORT_TEXT),
  signedDate: z.string().datetime().nullable().optional(),
  expiryDate: z.string().datetime().nullable().optional(),
  caseId: z.string().max(100).nullable().optional(),
  clientId: z.string().max(100).nullable().optional(),
  notes: z.string().max(LONG_TEXT).nullable().optional(),
})

export const communicationSchema = z.object({
  clientId: z.string().max(100).nullable().optional(),
  caseId: z.string().max(100).nullable().optional(),
  type: z.enum(["call", "email", "meeting", "sms", "note"]),
  direction: z.enum(["incoming", "outgoing"]).default("outgoing"),
  subject: z.string().min(1).max(SHORT_TEXT),
  body: z.string().min(1).max(LONG_TEXT),
  durationMin: z.number().int().min(0).max(1440).nullable().optional(),
  date: z.string().datetime().optional(),
})

export const timeEntrySchema = z.object({
  caseId: z.string().max(100).nullable().optional(),
  description: z.string().min(1).max(SHORT_TEXT),
  durationSec: z.number().int().min(0).max(86400),
  billable: z.boolean().default(false),
  hourlyRate: z.number().min(0).nullable().optional(),
  sessionType: z.enum(["focus", "billable", "meeting", "break"]).default("focus"),
  date: z.string().datetime().optional(),
})

export const termSchema = z.object({
  term: z.string().min(1).max(SHORT_TEXT),
  definition: z.string().min(1).max(LONG_TEXT),
  category: z.enum(["civil", "criminal", "commercial", "administrative", "constitutional", "procedural", "family", "general"]).default("general"),
  origin: z.string().max(SHORT_TEXT).nullable().optional(),
  example: z.string().max(LONG_TEXT).nullable().optional(),
  mastery: z.enum(["learning", "reviewing", "mastered"]).default("learning"),
})

export const invoiceCreateSchema = z.object({
  timeEntryIds: z.array(z.string().max(100)).min(1).max(100),
  clientId: z.string().max(100).nullable().optional(),
  caseId: z.string().max(100).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(LONG_TEXT).nullable().optional(),
})

export const invoicePatchSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  paidAt: z.string().datetime().nullable().optional(),
  paidAmount: z.number().min(0).nullable().optional(),
  notes: z.string().max(LONG_TEXT).nullable().optional(),
})

export const aiAnalyzeSchema = z.object({
  text: z.string().min(1).max(10000),
  type: z.enum(["document", "contract"]).default("document"),
})

export const aiDraftSchema = z.object({
  prompt: z.string().min(1).max(5000),
})

export const aiGenerateCardsSchema = z.object({
  notes: z.string().min(1).max(10000),
  category: z.enum(["civil", "criminal", "commercial", "administrative", "constitutional", "procedural", "family", "general"]).default("general"),
})
