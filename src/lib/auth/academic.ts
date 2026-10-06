/**
 * Academic Verification & Domain Helpers
 * Implements F-13: Verified Student Tier from Sanad-Product-Roadmap.pdf
 */

export const SAUDI_ACADEMIC_DOMAINS = [
  'ksu.edu.sa', // King Saud University
  'kau.edu.sa', // King Abdulaziz University
  'imamu.edu.sa', // Imam Mohammad Ibn Saud Islamic University
  'pnu.edu.sa', // Princess Nourah bint Abdulrahman University
  'kfupm.edu.sa', // King Fahd University of Petroleum and Minerals
  'uj.edu.sa', // University of Jeddah
  'uqu.edu.sa', // Umm Al-Qura University
  'kku.edu.sa', // King Khalid University
  'taibahu.edu.sa', // Taibah University
  'qu.edu.sa', // Qassim University
  'kfu.edu.sa', // King Faisal University
  'jazanu.edu.sa', // Jazan University
  'iu.edu.sa', // Islamic University of Madinah
  'psau.edu.sa', // Prince Sattam Bin Abdulaziz University
  'nu.edu.sa', // Najran University
  'ut.edu.sa', // University of Tabuk
  'tu.edu.sa', // Taif University
  'seu.edu.sa', // Saudi Electronic University
  'uhb.edu.sa', // University of Hafr Al Batin
  'uob.edu.sa', // University of Bisha
] as const

const INSTITUTION_NAMES: Record<string, string> = {
  'ksu.edu.sa': 'جامعة الملك سعود',
  'kau.edu.sa': 'جامعة الملك عبد العزيز',
  'imamu.edu.sa': 'جامعة الإمام محمد بن سعود الإسلامية',
  'pnu.edu.sa': 'جامعة الأميرة نورة بنت عبد الرحمن',
  'uqu.edu.sa': 'جامعة أم القرى',
  'uj.edu.sa': 'جامعة جدة',
  'seu.edu.sa': 'الجامعة السعودية الإلكترونية',
  'taibahu.edu.sa': 'جامعة طيبة',
  'kfupm.edu.sa': 'جامعة الملك فهد للبترول والمعادن',
  'qu.edu.sa': 'جامعة القصيم',
}

/**
 * Checks whether an email address belongs to a recognized academic institution.
 */
export function isAcademicEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || !email.includes('@')) return false
  const domain = email.toLowerCase().split('@')[1]?.trim() || ''
  if (domain.endsWith('.edu.sa') || domain.endsWith('.edu')) return true
  return SAUDI_ACADEMIC_DOMAINS.includes(domain as any)
}

/**
 * Returns the Arabic name of the institution if recognized, or a generic descriptor.
 */
export function getAcademicInstitutionName(email: string): string | null {
  if (!email || typeof email !== 'string' || !email.includes('@')) return null
  const domain = email.toLowerCase().split('@')[1]?.trim() || ''
  if (INSTITUTION_NAMES[domain]) return INSTITUTION_NAMES[domain]
  if (domain.endsWith('.edu.sa')) return 'جامعة سعودية معتمدة'
  if (domain.endsWith('.edu')) return 'مؤسسة أكاديمية معتمدة'
  return null
}
