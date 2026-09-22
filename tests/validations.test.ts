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
