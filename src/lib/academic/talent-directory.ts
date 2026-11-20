export interface VerifiedStudentMemo {
  id: string
  title: { ar: string; en: string }
  domain: 'COMMERCIAL_LAW' | 'CIVIL_TRANSACTIONS' | 'LABOR_LAW' | 'DATA_PRIVACY_GRC'
  precisionScore: number
  verifiedByProfessor: string
  publishedDate: string
}

export interface StudentTalentProfile {
  id: string
  fullName: { ar: string; en: string }
  university: { ar: string; en: string }
  academicStanding: { ar: string; en: string }
  gpa: string
  graduationYear: number
  draftingSimulatorAvgScore: number
  mootCourtHonors: { ar: string; en: string }
  availability: 'IMMEDIATE_COOP' | 'SUMMER_INTERNSHIP' | 'TRAINEE_LAWYER_TRACK'
  verifiedMemos: VerifiedStudentMemo[]
  partnerFirmEndorsements: string[]
}

export const MENTORSHIP_TALENT_PROFILES: StudentTalentProfile[] = [
  {
    id: 'STU-TALENT-01',
    fullName: { ar: 'سارة بنت عبدالمجيد التميمي', en: 'Sara Al-Tamimi' },
    university: {
      ar: 'جامعة الملك سعود — كلية الحقوق والعلوم السياسية',
      en: 'King Saud University — College of Law & Political Science',
    },
    academicStanding: {
      ar: 'مرتبة الشرف الأولى (قائمة العميد الشرفية)',
      en: 'First Class Honors (Dean’s List)',
    },
    gpa: '4.94 / 5.00',
    graduationYear: 2027,
    draftingSimulatorAvgScore: 96,
    mootCourtHonors: {
      ar: 'المركز الأول — مسابقة التحكيم التجاري الصورية (SCCA Moot)',
      en: '1st Place — SCCA Arabic Commercial Arbitration Moot',
    },
    availability: 'IMMEDIATE_COOP',
    verifiedMemos: [
      {
        id: 'MEMO-901',
        title: {
          ar: 'النظام العام التعاقدي وسلطة القاضي في تعديل الشرط الجزائي وفق المادة (179) من نظام المعاملات المدنية',
          en: 'Contractual Public Order & Judicial Modification of Liquidated Damages under Art. 179',
        },
        domain: 'CIVIL_TRANSACTIONS',
        precisionScore: 98,
        verifiedByProfessor: 'أ.د. عبدالله الفوزان (أستاذ القانون المدني)',
        publishedDate: '2026-09-18',
      },
      {
        id: 'MEMO-902',
        title: {
          ar: 'الضوابط النظامية لنقل البيانات الشخصية عبر الحدود في العقود السحابية (المادة 29 من نظام سدايا)',
          en: 'Cross-Border Personal Data Transfer Safeguards in Cloud MSAs (SDAIA Art. 29)',
        },
        domain: 'DATA_PRIVACY_GRC',
        precisionScore: 95,
        verifiedByProfessor: 'د. نورة القحطاني (أستاذ قانون التقنية والحوكمة)',
        publishedDate: '2026-10-04',
      },
    ],
    partnerFirmEndorsements: [
      'الفيصل وشركاه للمحاماة والاستشارات',
      'الإدارة القانونية — مجموعة المدار القابضة',
    ],
  },
  {
    id: 'STU-TALENT-02',
    fullName: { ar: 'خالد بن سلطان الدوسري', en: 'Khaled Al-Dossary' },
    university: {
      ar: 'جامعة الإمام محمد بن سعود الإسلامية — المعهد العالي للقضاء / الشريعة والقانون',
      en: 'Imam Mohammad Ibn Saud Islamic University — Sharia & Law',
    },
    academicStanding: {
      ar: 'مرتبة الشرف الأولى',
      en: 'First Class Honors',
    },
    gpa: '4.88 / 5.00',
    graduationYear: 2026,
    draftingSimulatorAvgScore: 93,
    mootCourtHonors: {
      ar: 'أفضل مذكرة ترافعية — العيادة القانونية والمحاكمات الصورية',
      en: 'Best Pleading Brief Award — Judicial Legal Clinic',
    },
    availability: 'TRAINEE_LAWYER_TRACK',
    verifiedMemos: [
      {
        id: 'MEMO-905',
        title: {
          ar: 'حجية الأدلة الرقمية والمراسلات الإلكترونية في المنازعات التجارية وفق نظام الإثبات (م/43)',
          en: 'Evidentiary Weight of Digital Forensics & Electronic Records under the Law of Evidence',
        },
        domain: 'COMMERCIAL_LAW',
        precisionScore: 94,
        verifiedByProfessor: 'فضيلة د. سعد العتيبي',
        publishedDate: '2026-10-12',
      },
    ],
    partnerFirmEndorsements: ['مكتب الراشد للمحاماة والتحكيم التجاري'],
  },
  {
    id: 'STU-TALENT-03',
    fullName: { ar: 'ليان بنت فهد الحربي', en: 'Layan Al-Harbi' },
    university: {
      ar: 'جامعة الأمير سلطان — كلية القانون',
      en: 'Prince Sultan University — College of Law',
    },
    academicStanding: {
      ar: 'مرتبة الشرف الثانية — مسار قانون الشركات والحوكمة',
      en: 'Second Class Honors — Corporate Governance Track',
    },
    gpa: '3.82 / 4.00',
    graduationYear: 2027,
    draftingSimulatorAvgScore: 91,
    mootCourtHonors: {
      ar: 'زمالة البحث القانوني في حوكمة الشركات المساهمة',
      en: 'Corporate Governance Legal Research Fellowship',
    },
    availability: 'SUMMER_INTERNSHIP',
    verifiedMemos: [
      {
        id: 'MEMO-908',
        title: {
          ar: 'المسؤولية التضامنية لأعضاء مجلس الإدارة في الشركات المساهمة وفق المادة (182) من نظام الشركات',
          en: 'Joint & Several Liability of Board Directors under Companies Law Art. 182',
        },
        domain: 'COMMERCIAL_LAW',
        precisionScore: 92,
        verifiedByProfessor: 'د. طارق الشهري',
        publishedDate: '2026-08-29',
      },
    ],
    partnerFirmEndorsements: ['مجموعة المدار القابضة — قطاع الحوكمة'],
  },
]

