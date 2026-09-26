import { describe, it, expect } from 'vitest'
import { INITIAL_RESEARCH_ITEMS } from '../src/lib/sanad/research/seedData'

describe('Legal Research Hub Seed Data & Statutes', () => {
  it('contains foundational Saudi statutes and Supreme Court precedents', () => {
    expect(INITIAL_RESEARCH_ITEMS.length).toBeGreaterThanOrEqual(8)

    const types = new Set(INITIAL_RESEARCH_ITEMS.map((i) => i.type))
    expect(types.has('statute')).toBe(true)
    expect(types.has('precedent')).toBe(true)
    expect(types.has('regulation')).toBe(true)

    const categories = new Set(INITIAL_RESEARCH_ITEMS.map((i) => i.category))
    expect(categories.has('civil')).toBe(true)
    expect(categories.has('commercial')).toBe(true)
    expect(categories.has('labor')).toBe(true)
    expect(categories.has('corporate')).toBe(true)
    expect(categories.has('procedural')).toBe(true)
  })

  it('ensures each research item has content, formal source, and tags', () => {
    for (const item of INITIAL_RESEARCH_ITEMS) {
      expect(item.title).toBeTruthy()
      expect(item.content.length).toBeGreaterThan(20)
      expect(item.source).toBeTruthy()
      expect(item.tags).toBeTruthy()
    }
  })
})
