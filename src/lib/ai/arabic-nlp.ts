/**
 * Arabic Natural Language Processing Utilities for Saudi Legal Text
 * Handles diacritics removal, letter normalization, stop-word filtering,
 * and n-gram similarity scoring tailored to Arabic legal phrasing.
 */

// Common Arabic stop words (excluding prepositions that have legal significance when combined)
const ARABIC_STOP_WORDS = new Set([
  'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك', 'التي',
  'الذي', 'الذين', 'اللواتي', 'هو', 'هي', 'هم', 'هن', 'أن', 'إن', 'كان',
  'كانت', 'يكون', 'يكونون', 'قد', 'لقد', 'ثم', 'أو', 'أم', 'بل', 'لكن',
  'حتى', 'إذا', 'كل', 'بعض', 'غير', 'سوف', 'لن', 'لم', 'ما', 'ماذا', 'كيف',
  'متى', 'أين', 'كم', 'يا', 'هل', 'بين', 'عند', 'بعد', 'قبل', 'حيث'
])

/**
 * Remove Arabic diacritics (tashkeel), tanween, and tatweel (kashida).
 */
export function stripTashkeel(text: string): string {
  return text
    // Remove tatweel (ـ)
    .replace(/\u0640/g, '')
    // Remove diacritical marks & tanween (range: \u064B to \u065F, \u0670)
    .replace(/[\u064B-\u065F\u0670]/g, '')
}

/**
 * Normalize Arabic orthographic variants:
 * - Unifies Hamza variants: [أ, إ, آ, ء] -> ا / standard
 * - Unifies Teh Marbuta (ة) -> ه
 * - Unifies Alef Maksura (ى) -> ي
 */
export function normalizeArabic(text: string): string {
  if (!text) return ''

  return stripTashkeel(text)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase()
    .trim()
}

/**
 * Tokenize Arabic text into meaningful keywords, stripping punctuation and stop words.
 */
export function tokenizeArabic(text: string, removeStopWords: boolean = true): string[] {
  const normalized = normalizeArabic(text)
  // Split on whitespace and non-alphanumeric punctuation
  const rawTokens = normalized.split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 1)

  if (!removeStopWords) {
    return rawTokens
  }

  return rawTokens.filter((token) => !ARABIC_STOP_WORDS.has(token))
}

/**
 * Generate character n-grams (default 3-grams) for fuzzy matching.
 */
export function getCharNgrams(text: string, n: number = 3): Set<string> {
  const normalized = normalizeArabic(text).replace(/\s+/g, '')
  const ngrams = new Set<string>()
  if (normalized.length < n) {
    if (normalized.length > 0) ngrams.add(normalized)
    return ngrams
  }
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.add(normalized.substring(i, i + n))
  }
  return ngrams
}

/**
 * Calculate Jaccard similarity score between two texts using character n-grams.
 * Returns a score between 0.0 and 1.0.
 */
export function calculateNgramSimilarity(textA: string, textB: string): number {
  const ngramsA = getCharNgrams(textA)
  const ngramsB = getCharNgrams(textB)

  if (ngramsA.size === 0 || ngramsB.size === 0) return 0

  let intersection = 0
  for (const gram of ngramsA) {
    if (ngramsB.has(gram)) {
      intersection++
    }
  }

  const union = ngramsA.size + ngramsB.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Extract potential legal references (e.g. "المادة 53", "م/191", "المرسوم الملكي") from query.
 */
export function extractLegalCitations(text: string): {
  articleNumbers: number[]
  decreeNumbers: string[]
} {
  const articleMatches = text.match(/(?:المادة|مادة|المواد)\s*([0-9]+)/gi) || []
  const articleNumbers = articleMatches
    .map((m) => {
      const match = m.match(/[0-9]+/)
      return match ? parseInt(match[0], 10) : null
    })
    .filter((n): n is number => n !== null)

  const decreeMatches = text.match(/(?:م\/|مرسوم\s+ملكي\s+(?:رقم\s+)?|قرار\s+وزاري\s+(?:رقم\s+)?)([0-9]+(?:\/[0-9]+)?)/gi) || []
  const decreeNumbers = decreeMatches.map((m) => m.trim())

  return { articleNumbers, decreeNumbers }
}
