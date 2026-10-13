import { describe, it, expect } from 'vitest'
import {
  createCaseSchema,
  createClientSchema,
  createTaskSchema,
  createInvoiceSchema,
} from '../src/lib/validations'

describe('Zod Validation Schemas', () => {
  describe('createCaseSchema', () => {
    it('accepts valid case payload and sets defaults', () => {
      const payload = {
        title: 'قضية نزاع تجاري',
        clientName: 'شركة الأفق للاستثمار',
        caseType: 'litigation',
        priority: 'high',
      }
      const parsed = createCaseSchema.parse(payload)
      expect(parsed.title).toBe(payload.title)
      expect(parsed.clientName).toBe(payload.clientName)
      expect(parsed.stage).toBe('drafting') // Default
    })

    it('rejects empty title', () => {
      expect(() => createCaseSchema.parse({ title: '', clientName: 'عميل' })).toThrow()
    })

    it('transforms date strings to Date objects', () => {
      const parsed = createCaseSchema.parse({
        title: 'قضية',
        clientName: 'عميل',
        dueDate: '2026-10-15',
      })
      expect(parsed.dueDate).toBeInstanceOf(Date)
    })

    it('accepts specialized Saudi court types and litigation stages', () => {
      const commercialCase = createCaseSchema.parse({
        title: 'نزاع مقاولات تجاري',
        clientName: 'شركة الإعمار المتحدة',
        caseType: 'commercial',
        stage: 'pleading',
      })
      expect(commercialCase.caseType).toBe('commercial')
      expect(commercialCase.stage).toBe('pleading')

      const laborCase = createCaseSchema.parse({
        title: 'دعوى عمالية - مستحقات نهاية خدمة',
        clientName: 'أحمد المحمود',
        caseType: 'labor',
        stage: 'hearing',
      })
      expect(laborCase.caseType).toBe('labor')
      expect(laborCase.stage).toBe('hearing')
    })
  })

  describe('createClientSchema', () => {
    it('accepts valid individual client', () => {
      const parsed = createClientSchema.parse({
        name: 'عبدالله السعدي',
        phone: '0501234567',
        email: 'abdullah@example.sa',
      })
      expect(parsed.name).toBe('عبدالله السعدي')
      expect(parsed.type).toBe('individual')
    })

    it('rejects invalid email', () => {
      expect(() => createClientSchema.parse({
        name: 'test',
        email: 'not-an-email',
      })).toThrow()
    })
  })

  describe('createTaskSchema', () => {
    it('accepts valid task and transforms dueDate', () => {
      const parsed = createTaskSchema.parse({
        title: 'تقديم مذكرة الدفاع',
        status: 'todo',
        priority: 'urgent',
        dueDate: '2026-09-30T10:00:00Z',
      })
      expect(parsed.title).toBe('تقديم مذكرة الدفاع')
      expect(parsed.dueDate).toBeInstanceOf(Date)
    })
  })

  describe('createInvoiceSchema', () => {
    it('calculates properly and assigns default vatRate', () => {
      const parsed = createInvoiceSchema.parse({
        number: 'INV-2026-100',
        subtotal: 10000,
        vatAmount: 1500,
        total: 11500,
      })
      expect(parsed.vatRate).toBe(15)
      expect(parsed.status).toBe('draft')
    })
  })
})

describe('Academic Schemas', () => {
  it('accepts a valid course and rejects missing title', async () => {
    const { createCourseSchema } = await import('../src/lib/validations')
    const parsed = createCourseSchema.parse({ title: 'القانون التجاري', credits: 3 })
    expect(parsed.title).toBe('القانون التجاري')
    expect(() => createCourseSchema.parse({ code: 'LAW101' })).toThrow()
  })

  it('never carries unknown keys through to the write payload', async () => {
    const { createCourseSchema, updateTermSchema } = await import('../src/lib/validations')
    const parsed = createCourseSchema.parse({ title: 'مقرر', workspaceId: 'evil', role: 'admin' })
    expect(parsed).not.toHaveProperty('workspaceId')
    expect(parsed).not.toHaveProperty('role')
    const term = updateTermSchema.parse({ mastery: 'mastered', id: 'spoof' })
    expect(term).not.toHaveProperty('id')
  })

  it('transforms lecture dates and applies defaults', async () => {
    const { createLectureSchema } = await import('../src/lib/validations')
    const parsed = createLectureSchema.parse({
      courseId: 'c1',
      title: 'محاضرة ١',
      lectureDate: '2026-10-20T09:00:00Z',
    })
    expect(parsed.lectureDate).toBeInstanceOf(Date)
    expect(parsed.status).toBe('draft')
    expect(parsed.notes).toBe('')
  })

  it('rejects invalid dates and out-of-range values', async () => {
    const { createLectureSchema, createDeadlineSchema, createCaseEntrySchema } = await import('../src/lib/validations')
    expect(() =>
      createLectureSchema.parse({ courseId: 'c1', title: 'x', lectureDate: 'not-a-date' }),
    ).toThrow()
    expect(() =>
      createDeadlineSchema.parse({ title: 'x', type: 'exam', dueDate: '2026-01-01', priority: 'critical' }),
    ).toThrow()
    expect(() =>
      createCaseEntrySchema.parse({ caseName: 'قضية', principle: 'مبدأ', subject: 'مدني', rating: 9 }),
    ).toThrow()
  })

  it('update schemas are fully partial but keep field rules', async () => {
    const { updateCourseSchema, updateCaseEntrySchema } = await import('../src/lib/validations')
    expect(updateCourseSchema.parse({})).toEqual({})
    expect(() => updateCaseEntrySchema.parse({ rating: 0 })).toThrow()
    expect(updateCaseEntrySchema.parse({ rating: 5 }).rating).toBe(5)
  })
})

describe('operations schemas', () => {
  it('accepts a real deep-work time entry payload', async () => {
    const { createTimeEntrySchema } = await import('../src/lib/validations')
    const parsed = createTimeEntrySchema.parse({
      caseId: null,
      description: 'بحث',
      durationSec: 1500,
      billable: false,
      hourlyRate: null,
      sessionType: 'focus',
      date: '2026-10-20T09:00:00.000Z',
    })
    expect(parsed.durationSec).toBe(1500)
    expect(parsed.date).toBeInstanceOf(Date)
    expect(parsed.sessionType).toBe('focus')
  })

  it('rejects malformed time entries (type confusion / out-of-range)', async () => {
    const { createTimeEntrySchema } = await import('../src/lib/validations')
    expect(() => createTimeEntrySchema.parse({ durationSec: 'abc' })).toThrow()
    expect(() => createTimeEntrySchema.parse({ durationSec: 999999 })).toThrow()
    expect(() => createTimeEntrySchema.parse({ sessionType: 'archived' })).toThrow()
    expect(() => createTimeEntrySchema.parse({ date: 'not-a-date' })).toThrow()
  })

  it('treats empty-string dates as absent (frontend clears datetime inputs)', async () => {
    const { createCommunicationSchema, createInvoiceFromTimeEntriesSchema } = await import('../src/lib/validations')
    const comm = createCommunicationSchema.parse({ subject: 'مكالمة', date: '' })
    expect(comm.date).toBeInstanceOf(Date)
    const inv = createInvoiceFromTimeEntriesSchema.parse({ dueDate: '', timeEntryIds: [] })
    expect(inv.dueDate).toBeNull()
  })

  it('enforces communication enums and bounds', async () => {
    const { createCommunicationSchema } = await import('../src/lib/validations')
    expect(() => createCommunicationSchema.parse({ type: 'pigeon' })).toThrow()
    expect(() => createCommunicationSchema.parse({ direction: 'sideways' })).toThrow()
    expect(() => createCommunicationSchema.parse({ durationMin: '30' })).toThrow()
    const ok = createCommunicationSchema.parse({ type: 'call', direction: 'incoming' })
    expect(ok.direction).toBe('incoming')
  })

  it('update communication omits relation re-linking and skips null date', async () => {
    const { updateCommunicationSchema } = await import('../src/lib/validations')
    const parsed = updateCommunicationSchema.parse({ subject: 'م', date: null })
    expect(parsed.date).toBeUndefined()
    expect('clientId' in parsed).toBe(false)
    expect(() => updateCommunicationSchema.parse({ clientId: 'x' })).not.toThrow()
  })

  it('research schema rejects non-http urls and trims required fields', async () => {
    const { createResearchItemSchema } = await import('../src/lib/validations')
    expect(() =>
      createResearchItemSchema.parse({ title: 't', content: 'c', url: 'javascript:alert(1)' }),
    ).toThrow()
    expect(() => createResearchItemSchema.parse({ title: '   ', content: 'c' })).toThrow()
    const ok = createResearchItemSchema.parse({ title: '  نص  ', content: '  محتوى  ' })
    expect(ok.title).toBe('نص')
    expect(ok.type).toBe('note')
  })

  it('invoice-from-entries requires string ids', async () => {
    const { createInvoiceFromTimeEntriesSchema } = await import('../src/lib/validations')
    expect(() => createInvoiceFromTimeEntriesSchema.parse({ timeEntryIds: [{ id: 'x' }] })).toThrow()
    expect(() => createInvoiceFromTimeEntriesSchema.parse({ timeEntryIds: 'not-array' })).toThrow()
    const ok = createInvoiceFromTimeEntriesSchema.parse({ timeEntryIds: ['a', 'b'], dueDate: '2026-12-01' })
    expect(ok.dueDate).toBeInstanceOf(Date)
  })
})
