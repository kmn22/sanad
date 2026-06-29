import { vi } from 'vitest'

function createMockModel() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'mock-id', ...data })),
    update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'mock-id', ...data })),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    delete: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    count: vi.fn().mockResolvedValue(0),
  }
}

export const db = {
  complianceItem: createMockModel(),
  legalCase: createMockModel(),
  legalDocument: createMockModel(),
  task: createMockModel(),
  dailyBrief: createMockModel(),
  timeEntry: createMockModel(),
  client: createMockModel(),
  invoice: createMockModel(),
  communication: createMockModel(),
  course: createMockModel(),
  lecture: createMockModel(),
  academicDeadline: createMockModel(),
  legalTerm: createMockModel(),
  caseEntry: createMockModel(),
}
