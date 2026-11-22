/**
 * Dual Hijri (Umm al-Qura) & Gregorian date utilities in Asia/Riyadh timezone.
 */

const RIYADH_TZ = 'Asia/Riyadh'

export interface DualDateFormat {
  gregorian: string
  hijri: string
  combined: string
}

export function formatDualHijriGregorian(
  input: Date | string | null | undefined,
  lang: 'ar' | 'en' = 'ar'
): DualDateFormat {
  if (!input) {
    const empty = lang === 'ar' ? '—' : '—'
    return { gregorian: empty, hijri: '', combined: empty }
  }
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) {
    return { gregorian: '—', hijri: '', combined: '—' }
  }

  try {
    const gregLocale = lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB-u-ca-gregory'
    const hijriLocale = lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-SA-u-ca-islamic-umalqura'

    const gregorian = new Intl.DateTimeFormat(gregLocale, {
      timeZone: RIYADH_TZ,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)

    const hijri = new Intl.DateTimeFormat(hijriLocale, {
      timeZone: RIYADH_TZ,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)

    return {
      gregorian,
      hijri,
      combined: hijri ? `${gregorian} (${hijri})` : gregorian,
    }
  } catch {
    const fallback = date.toISOString().slice(0, 10)
    return { gregorian: fallback, hijri: '', combined: fallback }
  }
}
