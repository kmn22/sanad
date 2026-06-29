import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/student/review?source=all|terms|cases|lectures|course:{id}|subject:{value}&mode=flashcards|quiz
// Generates a deck of review cards from the user's library.
export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url)
  const source = searchParams.get('source') || 'all'
  const mode = (searchParams.get('mode') || 'flashcards') as 'flashcards' | 'quiz'

  const [terms, cases, lectures] = await Promise.all([
    db.legalTerm.findMany(),
    db.caseEntry.findMany(),
    db.lecture.findMany({ include: { course: true } }),
  ])

  interface Card {
    id: string
    type: 'term' | 'case' | 'lecture'
    front: string
    back: string
    hint?: string
    source: string
    // For quiz mode
    options?: string[]
    correctIndex?: number
    questionType?: 'mcq' | 'tf'
  }

  const cards: Card[] = []

  // ---- TERM cards ----
  let filteredTerms = terms
  if (source === 'terms' || source === 'all') {
    filteredTerms = source === 'terms' ? terms : terms
  } else if (source.startsWith('subject:')) {
    const subject = source.split(':')[1]
    filteredTerms = terms.filter((t) => t.category === subject)
  }

  const includeTerms = source === 'all' || source === 'terms' || source.startsWith('subject:')
  if (includeTerms) {
    for (const term of filteredTerms) {
      if (mode === 'flashcards') {
        cards.push({
          id: `term-${term.id}`,
          type: 'term',
          front: term.term,
          back: term.definition,
          hint: term.origin || undefined,
          source: 'بنك المصطلحات',
        })
      } else {
        // Quiz mode: MCQ — pick 3 wrong definitions from other terms
        const otherDefs = terms
          .filter((t) => t.id !== term.id)
          .map((t) => t.definition)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        if (otherDefs.length === 3) {
          const options = [term.definition, ...otherDefs]
          options.sort(() => Math.random() - 0.5)
          cards.push({
            id: `term-${term.id}`,
            type: 'term',
            front: `ما تعريف: «${term.term}»؟`,
            back: term.definition,
            options,
            correctIndex: options.indexOf(term.definition),
            questionType: 'mcq',
            source: 'بنك المصطلحات',
          })
        } else if (terms.length < 4) {
          // Not enough for MCQ — use True/False
          const isTrue = Math.random() > 0.5
          const shownDef = isTrue ? term.definition : otherDefs[0] || terms[0]?.definition || ''
          cards.push({
            id: `term-${term.id}`,
            type: 'term',
            front: `هل هذا تعريف صحيح لـ«${term.term}»؟\n\n«${shownDef}»`,
            back: isTrue ? 'صحيح' : 'خطأ',
            options: ['صحيح', 'خطأ'],
            correctIndex: isTrue ? 0 : 1,
            questionType: 'tf',
            source: 'بنك المصطلحات',
          })
        }
      }
    }
  }

  // ---- CASE cards ----
  const includeCases = source === 'all' || source === 'cases' || source.startsWith('subject:')
  let filteredCases = cases
  if (source.startsWith('subject:')) {
    const subject = source.split(':')[1]
    filteredCases = cases.filter((c) => c.subject === subject)
  }

  if (includeCases) {
    for (const c of filteredCases) {
      if (mode === 'flashcards') {
        cards.push({
          id: `case-${c.id}`,
          type: 'case',
          front: c.caseName,
          back: c.principle,
          hint: c.court || undefined,
          source: 'بنك القضايا',
        })
      } else {
        // MCQ: pick the right principle from 4 cases
        const otherPrinciples = cases
          .filter((x) => x.id !== c.id)
          .map((x) => x.principle)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        if (otherPrinciples.length === 3) {
          const options = [c.principle, ...otherPrinciples]
          options.sort(() => Math.random() - 0.5)
          cards.push({
            id: `case-${c.id}`,
            type: 'case',
            front: `ما المبدأ القانوني المستخلص من:\n\n«${c.caseName}»؟`,
            back: c.principle,
            options,
            correctIndex: options.indexOf(c.principle),
            questionType: 'mcq',
            source: 'بنك القضايا',
          })
        } else {
          // T/F if not enough cases
          const isTrue = Math.random() > 0.5
          const shownPrinciple = isTrue ? c.principle : otherPrinciples[0] || c.principle
          cards.push({
            id: `case-${c.id}`,
            type: 'case',
            front: `هل هذا هو المبدأ في قضية «${c.caseName}»؟\n\n«${shownPrinciple}»`,
            back: isTrue ? 'صحيح' : 'خطأ',
            options: ['صحيح', 'خطأ'],
            correctIndex: isTrue ? 0 : 1,
            questionType: 'tf',
            source: 'بنك القضايا',
          })
        }
      }
    }
  }

  // ---- LECTURE cards (only when source is course:{id} or lectures) ----
  const includeLectures = source === 'all' || source === 'lectures' || source.startsWith('course:')
  let filteredLectures = lectures
  if (source.startsWith('course:')) {
    const courseId = source.split(':')[1]
    filteredLectures = lectures.filter((l) => l.courseId === courseId)
  }

  if (includeLectures && filteredLectures.length > 0) {
    for (const l of filteredLectures) {
      if (!l.topic) continue
      if (mode === 'flashcards') {
        cards.push({
          id: `lecture-${l.id}`,
          type: 'lecture',
          front: l.title,
          back: l.topic,
          hint: l.course?.title || undefined,
          source: 'المحاضرات',
        })
      } else {
        // T/F on lecture topics
        const otherTopics = filteredLectures
          .filter((x) => x.id !== l.id && x.topic)
          .map((x) => x.topic!) as string[]
        const isTrue = Math.random() > 0.5
        const shownTopic = isTrue ? l.topic : otherTopics[Math.floor(Math.random() * Math.max(otherTopics.length, 1))] || l.topic
        cards.push({
          id: `lecture-${l.id}`,
          type: 'lecture',
          front: `هل هذا موضوع محاضرة «${l.title}»؟\n\n«${shownTopic}»`,
          back: isTrue ? 'صحيح' : 'خطأ',
          options: ['صحيح', 'خطأ'],
          correctIndex: isTrue ? 0 : 1,
          questionType: 'tf',
          source: 'المحاضرات',
        })
      }
    }
  }

  // Shuffle for variety
  cards.sort(() => Math.random() - 0.5)

  // Resolve a human-readable label for the source
  let sourceLabel = 'الكل'
  if (source === 'terms') sourceLabel = 'بنك المصطلحات'
  else if (source === 'cases') sourceLabel = 'بنك القضايا'
  else if (source === 'lectures') sourceLabel = 'المحاضرات'
  else if (source.startsWith('course:')) {
    const courseId = source.split(':')[1]
    const course = await db.course.findUnique({ where: { id: courseId } })
    sourceLabel = course?.title || 'مادة محددة'
  } else if (source.startsWith('subject:')) {
    const subject = source.split(':')[1]
    const subjectLabels: Record<string, string> = {
      civil: 'مدني', criminal: 'جنائي', commercial: 'تجاري',
      administrative: 'إداري', constitutional: 'دستوري',
      procedural: 'إجرائي', family: 'أحوال شخصية', general: 'عام',
    }
    sourceLabel = subjectLabels[subject] || subject
  }

  return NextResponse.json({
    cards,
    source,
    sourceLabel,
    mode,
    total: cards.length,
  })
  } catch (error) {
    console.error('GET /api/student/review failed:', error)
    return NextResponse.json({ error: 'Failed to generate review deck' }, { status: 500 })
  }
}
