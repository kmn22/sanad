import type { RegulatorySafeguard } from './types'

export const GLOBAL_SAFEGUARDS: RegulatorySafeguard[] = [
  {
    id: 'labor-probation-max',
    law: 'نظام العمل السعودي (م/53)',
    type: 'warning',
    messageAr: 'الحد الأقصى لفترة التجربة 90 يوماً، ولا يجوز تمديدها لتصل إلى 180 يوماً إلا باتفاق كتابي صريح بين الطرفين وبعد بدء سريان العقد.',
    messageEn: 'Probation period cannot exceed 90 days, extendable up to 180 days only with explicit written agreement.',
    applicableFields: ['probationPeriod'],
  },
  {
    id: 'labor-non-compete',
    law: 'نظام العمل السعودي (م/83)',
    type: 'info',
    messageAr: 'يشترط لصحة شرط عدم المنافسة: أن يكون العامل مطلعاً على أسرار العمل، وأن يُحدد بوضوح من حيث الزمان (بحد أقصى سنتين)، والمكان، ونوع العمل.',
    messageEn: 'Non-compete covenants require specificity in duration (max 2 years), geographic scope, and nature of work.',
    applicableFields: ['nonCompeteScope', 'nonCompeteDuration'],
  },
  {
    id: 'civil-penalty-clause',
    law: 'نظام المعاملات المدنية (م/179)',
    type: 'tip',
    messageAr: 'الشرط الجزائي محكوم بالضرر الفعلي؛ يجوز للمحكمة أو هيئة التحكيم بناءً على طلب المدين تخفيض التعويض المتفق عليه إذا ثبت أنه كان مبالغاً فيه أو أن الالتزام نُفذ جزئياً.',
    messageEn: 'Liquidated damages can be adjusted by the court to reflect actual damage if proven excessive.',
    applicableFields: ['penaltyClause', 'delayCompensation'],
  },
  {
    id: 'civil-hardship-unforeseen',
    law: 'نظام المعاملات المدنية (م/174)',
    type: 'tip',
    messageAr: 'القوة القاهرة والظروف الطارئة: إذا طرأت حوادث استثنائية عامة لا يمكن توقعها جعلت تنفيذ الالتزام مرهقاً، يجوز للقاضي رد الالتزام المرهق إلى الحد المعقول.',
    messageEn: 'Force Majeure and Hardship provisions under Article 174 permit judicial contract adjustment.',
    applicableFields: ['forceMajeure', 'governingLaw'],
  },
  {
    id: 'pleading-formal-defenses-order',
    law: 'نظام المرافعات الشرعية (م/75) واللائحة التنفيذية لنظام المحاكم التجارية',
    type: 'warning',
    messageAr: 'ترتيب الدفوع: يجب إبداء الدفوع الشكلية (مثل عدم الاختصاص المحلي، الدفع بالإحالة، وبطلان صحف الدعاوى) قبل الدخول في أي دفع موضوعي، وإلا سقط الحق فيها.',
    messageEn: 'Formal/jurisdictional defenses must be raised prior to any substantive defense, otherwise rights are forfeited.',
    applicableFields: ['formalDefenses', 'jurisdictionDefense'],
  },
  {
    id: 'pleading-appeal-deadlines',
    law: 'نظام المرافعات الشرعية (م/177)',
    type: 'info',
    messageAr: 'المهلة النظامية للاستئناف: 30 يوماً من تاريخ استلام صك الحكم في الدعاوى الموضوعية، و10 أيام في الأحكام المستعجلة والقرارات الوقتية.',
    messageEn: 'Statutory appeal window is 30 days for substantive judgments, and 10 days for urgent/preliminary orders.',
    applicableFields: ['appealDate', 'judgmentDate'],
  },
  {
    id: 'pdpl-data-confidentiality',
    law: 'نظام حماية البيانات الشخصية ولائحته التنفيذية',
    type: 'info',
    messageAr: 'اتفاقيات السرية وتبادل البيانات تستوجب تحديد الغرض من المعالجة بدقة، وعدم نقل البيانات خارج المملكة إلا وفق ضوابط المادة 29 من النظام.',
    messageEn: 'Confidentiality & NDA terms involving personal data must specify processing purposes and comply with cross-border transfer rules.',
    applicableFields: ['dataProtection', 'confidentialDataScope'],
  },
]

export function evaluateSafeguards(
  templateId: string,
  answers: Record<string, any>
): RegulatorySafeguard[] {
  const active: RegulatorySafeguard[] = []

  for (const s of GLOBAL_SAFEGUARDS) {
    const hasField = s.applicableFields.some((field) => answers[field] !== undefined && answers[field] !== '')
    if (!hasField) continue

    // Specific logic checks
    if (s.id === 'labor-probation-max') {
      const days = Number(answers.probationPeriod)
      if (days > 90) {
        active.push(s)
      }
    } else if (s.id === 'labor-non-compete') {
      if (answers.hasNonCompete === 'yes' || answers.nonCompeteScope) {
        active.push(s)
      }
    } else if (s.id === 'civil-penalty-clause') {
      if (answers.penaltyClause && answers.penaltyClause.trim() !== '') {
        active.push(s)
      }
    } else if (s.id === 'pleading-formal-defenses-order') {
      if (answers.formalDefenses && answers.formalDefenses.trim() !== '') {
        active.push(s)
      }
    } else {
      active.push(s)
    }
  }

  return active
}
