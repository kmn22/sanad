export interface GoldenClauseTemplate {
  id: string
  title: { ar: string; en: string }
  category: 'COMMERCIAL' | 'LABOR' | 'DATA_PRIVACY' | 'DISPUTE_RESOLUTION' | 'LIABILITY_CAP'
  statuteReference: { ar: string; en: string }
  riskRating: 'LOW'
  clauseBody: { ar: string; en: string }
  tags: string[]
}

export const GOLDEN_CLAUSE_REPOSITORY: GoldenClauseTemplate[] = [
  {
    id: 'GC-CTL-179',
    title: {
      ar: 'بند الشرط الجزائي المتوازن وسقف غرامات التأخير',
      en: 'Balanced Liquidated Damages & Delay Penalty Cap',
    },
    category: 'COMMERCIAL',
    statuteReference: {
      ar: 'المادة (179) من نظام المعاملات المدنية',
      en: 'Civil Transactions Law — Art. 179',
    },
    riskRating: 'LOW',
    clauseBody: {
      ar: 'في حال تأخر الطرف الثاني في تسليم المخرجات الأساسية عن الجدول الزمني المعتمد لسبب يرجع إليه وحده، يستحق الطرف الأول تعويضاً اتفاقياً بنسبة (1%) من قيمة المرحلة المتأخرة عن كل أسبوع تأخير كامل، وبحد أقصى لا يتجاوز (10%) من إجمالي قيمة العقد، وذلك مع مراعاة أحكام المادة (179) من نظام المعاملات المدنية.',
      en: 'Should the Second Party delay delivery of core milestones due solely to its fault, the First Party shall be entitled to liquidated damages equal to 1% of the delayed milestone value per full week of delay, capped at 10% of the aggregate Contract Value, subject to Article 179 of the Civil Transactions Law.',
    },
    tags: ['شرط جزائي', 'تأخير', 'م/179', 'Liquidated Damages'],
  },
  {
    id: 'GC-CTL-138',
    title: {
      ar: 'تحديد سقف المسؤولية التعاقدية واستبعاد الأضرار غير المباشرة',
      en: 'Limitation of Liability & Exclusion of Consequential Damages',
    },
    category: 'LIABILITY_CAP',
    statuteReference: {
      ar: 'المواد (136–139) من نظام المعاملات المدنية',
      en: 'Civil Transactions Law — Arts. 136–139',
    },
    riskRating: 'LOW',
    clauseBody: {
      ar: 'باستثناء حالات الغش أو الخطأ الجسيم، لا يسأل أي من الطرفين تجاه الطرف الآخر عن أي أضرار غير مباشرة أو تبعية أو فوات ربح، وفي جميع الأحوال لا تتجاوز المسؤولية التعاقدية القصوى لأي طرف إجمالي الأتعاب المدفوعة فعلياً خلال الاثني عشر (12) شهراً السابقة لوقوع المطالبة.',
      en: 'Save for fraud or gross negligence, neither Party shall be liable for any indirect, incidental, or consequential damages or loss of profit. Aggregate liability under this Contract shall not exceed 100% of fees paid in the preceding twelve (12) months.',
    },
    tags: ['سقف المسؤولية', 'تعويض', 'Liability Cap', 'Indemnity'],
  },
  {
    id: 'GC-LAB-83',
    title: {
      ar: 'شرط عدم المنافسة وحماية الأسرار التجارية',
      en: 'Statutory Non-Compete & Trade Secret Protection',
    },
    category: 'LABOR',
    statuteReference: {
      ar: 'المادة (83) من نظام العمل السعودي',
      en: 'Saudi Labor Law — Art. 83',
    },
    riskRating: 'LOW',
    clauseBody: {
      ar: 'نظراً لاطلاع الطرف الثاني بحكم عمله على أسرار العمل وبيانات العملاء، يلتزم بعد انتهاء العقد بعدم منافسة الطرف الأول أو العمل لدى منشأة منافسة في ذات النشاط المحدد داخل مدينة (الرياض) لمدة (سنة ميلادية واحدة) من تاريخ انتهاء العلاقة العمالية وفقاً للمادة (83) من نظام العمل.',
      en: 'Given the Employee’s access to confidential client and trade secrets, the Employee covenants not to compete with the Employer within the specified business sector in the city of Riyadh for one (1) calendar year post-termination pursuant to Article 83 of the Saudi Labor Law.',
    },
    tags: ['عدم المنافسة', 'نظام العمل', 'م/83', 'Non-Compete'],
  },
  {
    id: 'GC-PDPL-29',
    title: {
      ar: 'السيادة الوطنية للبيانات وحظر النقل العابر للحدود دون ضمانات',
      en: 'Data Residency & PDPL Cross-Border Transfer Safeguards',
    },
    category: 'DATA_PRIVACY',
    statuteReference: {
      ar: 'المادة (29) من نظام حماية البيانات الشخصية (سدايا)',
      en: 'SDAIA PDPL — Art. 29',
    },
    riskRating: 'LOW',
    clauseBody: {
      ar: 'يلتزم المعالج باستضافة ومعالجة جميع البيانات الشخصية داخل النطاق الجغرافي للمملكة العربية السعودية، ويحظر نقلها أو إتاحتها لأي طرف خارج المملكة إلا بعد الحصول على موافقة كتابية مسبقة من المراقب واستيفاء متطلبات المادة (29) من نظام حماية البيانات الشخصية.',
      en: 'The Processor shall host and process all Personal Data exclusively within the Kingdom of Saudi Arabia and shall not transfer data outside the Kingdom without prior written authorization from the Controller and full compliance with PDPL Article 29.',
    },
    tags: ['سدايا', 'PDPL', 'بيانات شخصية', 'سيادة البيانات'],
  },
  {
    id: 'GC-SCCA-01',
    title: {
      ar: 'شرط تسوية المنازعات والتحكيم المؤسسي (المركز السعودي للتحكيم التجاري)',
      en: 'SCCA Institutional Arbitration & Governing Law Clause',
    },
    category: 'DISPUTE_RESOLUTION',
    statuteReference: {
      ar: 'نظام التحكيم السعودي (م/34) وقواعد SCCA',
      en: 'Saudi Arbitration Law & SCCA Rules',
    },
    riskRating: 'LOW',
    clauseBody: {
      ar: 'كل نزاع أو خلاف ينشأ عن هذا العقد أو يتعلق به أو بتفسيره أو بطلانه ولم يتسنَّ حله ودياً خلال (15) يوماً، يُحسم نهائياً بطريق التحكيم لدى المركز السعودي للتحكيم التجاري (SCCA) وفقاً لقواعده، ويكون مقر التحكيم مدينة الرياض ولغته العربية، ويخضع العقد لأنظمة المملكة العربية السعودية.',
      en: 'Any dispute arising out of or relating to this Contract not amicably resolved within 15 days shall be finally settled by arbitration administered by the Saudi Center for Commercial Arbitration (SCCA) in Riyadh, in Arabic, governed by the laws of the Kingdom of Saudi Arabia.',
    },
    tags: ['تحكيم', 'SCCA', 'تسوية المنازعات', 'Arbitration'],
  },
]

