import { describe, it, expect } from 'vitest'
import { SBA_EXAM_QUESTIONS } from '../src/lib/sanad/student/sbaQuestionBank'

describe('Saudi Bar Association (SBA) Question Bank', () => {
  it('contains questions covering core Saudi statutes', () => {
    expect(SBA_EXAM_QUESTIONS.length).toBeGreaterThanOrEqual(10)

    const subjects = new Set(SBA_EXAM_QUESTIONS.map(q => q.subject))
    expect(subjects.has('civil')).toBe(true)
    expect(subjects.has('evidence')).toBe(true)
    expect(subjects.has('procedural')).toBe(true)
    expect(subjects.has('commercial')).toBe(true)
    expect(subjects.has('labor')).toBe(true)
    expect(subjects.has('ethics')).toBe(true)
  })

  it('ensures each question has unique ID and valid options with correctIndex', () => {
    const ids = new Set<string>()
    for (const q of SBA_EXAM_QUESTIONS) {
      expect(ids.has(q.id)).toBe(false)
      ids.add(q.id)

      expect(q.options.length).toBeGreaterThanOrEqual(2)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(q.options.length)
      expect(q.options[q.correctIndex]).toBeTruthy()
      expect(q.lawReference.length).toBeGreaterThan(5)
      expect(q.explanationAr.length).toBeGreaterThan(10)
    }
  })
})
