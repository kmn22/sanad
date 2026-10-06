/**
 * Portal Glossary — Section 05 of Client-Portal-UX-Spec.pdf
 * Maps formal internal legal terminology into plain, reassuring spoken Arabic
 * for clients without legal backgrounds.
 */

export interface GlossaryEntry {
  term: string
  clientWording: string
  why: string
}

export const GLOSSARY_ITEMS: readonly GlossaryEntry[] = [
  {
    term: 'الجلسة',
    clientWording: 'موعدك أمام القاضي',
    why: 'يحدد الحدث الفعلي وما سيحصل مباشرة بدلاً من المسمى الإجرائي الرسمي.',
  },
  {
    term: 'المدة النظامية',
    clientWording: 'موعد نهائي قانوني لا يمكن تجاوزه',
    why: 'يوصل أهمية الموعد وخطورته دون الحاجة لمصطلحات نظامية معقدة.',
  },
  {
    term: 'المذكرة',
    clientWording: 'وثيقة قانونية أعدّها محاميك',
    why: 'يوضح مصدر الوثيقة ودورها في نصرة دعواك بدلاً من تصنيف نوع المحرر.',
  },
  {
    term: 'حكم ابتدائي',
    clientWording: 'قرار المحكمة الأول في قضيتك',
    why: 'صيغة تسلسلية واضحة ومطمئنة أفضل من الأوصاف الفقهية المعقدة.',
  },
  {
    term: 'اعتراض',
    clientWording: 'طلب إعادة النظر في القرار',
    why: 'فعل يومي مألوف يحافظ على وضوح النموذج الذهني للموكل.',
  },
  {
    term: 'إحالة',
    clientWording: 'تحويل قضيتك إلى الجهة المختصة',
    why: 'يركز على حركة المعاملة واختصاص الجهة بدلاً من رقم القيد.',
  },
  {
    term: 'أتعاب المحامي',
    clientWording: 'رسوم الخدمة القانونية',
    why: 'يتطابق مع ما يدرك الموكل أنه يدفعه لقاء خدمة مهنية.',
  },
  {
    term: 'قيد الإجراء',
    clientWording: 'قضيتك مستمرة — لا يوجد مطلوب منك حالياً',
    why: 'الحالة الأكثر تكراراً وتستحق التعبير الأكثر طمأنينة ووضوحاً.',
  },
] as const

const glossaryMap = new Map<string, GlossaryEntry>(
  GLOSSARY_ITEMS.map((item) => [item.term, item])
)

/**
 * Translates an internal legal status or term into client-friendly plain Arabic wording.
 * Returns the plain Arabic equivalent if found, or the original term if not mapped.
 */
export function translateToClientWording(legalTerm: string): string {
  const match = glossaryMap.get(legalTerm.trim())
  return match ? match.clientWording : legalTerm
}

/**
 * Returns the UX rationale or explanation for a given legal term.
 */
export function getGlossaryExplanation(legalTerm: string): string | undefined {
  return glossaryMap.get(legalTerm.trim())?.why
}
