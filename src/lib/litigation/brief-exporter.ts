import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'

export interface StructuredLegalBrief {
  title: string
  caseNumber: string
  courtName: string
  circuitName: string
  hearingDate?: string
  plaintiffName: string
  defendantName: string
  submittedByRole: 'PLAINTIFF' | 'DEFENDANT' | 'APPELLANT' | 'APPELLEE'
  counselName?: string
  licenseNumber?: string
  sections: {
    /** Section 1: صفة الخصوم والوقائع (Parties & Procedural Facts) */
    partiesAndFacts: string
    /** Section 2: الدفوع الشكلية والموضوعية (Formal & Substantive Defenses) */
    formalAndSubstantiveDefenses: string
    /** Section 3: الأسانيد النظامية والشرعية (Statutory Bases & Precedents) */
    statutoryAndShariaBases: string
    /** Section 4: الطلبات الختامية (Final Remedies/Demands) */
    finalRemedies: string
  }
}

export const BRIEF_SECTION_DEFINITIONS = [
  {
    key: 'partiesAndFacts' as const,
    number: 'أولاً',
    titleAr: 'صفة الخصوم والوقائع الإجرائية',
    titleEn: 'Section 1: Parties & Procedural Facts',
    placeholderAr:
      'بيان صفة الموكل والخصم، وتلخيص وقائع النزاع، وتاريخ إبرام العقد أو نشوء الالتزام، والإجراءات القضائية السابقة...',
  },
  {
    key: 'formalAndSubstantiveDefenses' as const,
    number: 'ثانياً',
    titleAr: 'الدفوع الشكلية والموضوعية',
    titleEn: 'Section 2: Formal & Substantive Defenses',
    placeholderAr:
      'أولاً: الدفوع الشكلية (الاختصاص الولائي/النوعي/المكاني، الصفة، المواعيد النظامية).\nثانياً: الدفوع الموضوعية والرد على مزاعم الخصم تفصيلاً...',
  },
  {
    key: 'statutoryAndShariaBases' as const,
    number: 'ثالثاً',
    titleAr: 'الأسانيد النظامية والشرعية والسوابق القضائية',
    titleEn: 'Section 3: Statutory Bases & Precedents',
    placeholderAr:
      'الاستناد إلى مواد نظام المعاملات المدنية، نظام المحاكم التجارية، نظام الإثبات، والقواعد الفقهية والمبادئ القضائية الصادرة عن المحكمة العليا...',
  },
  {
    key: 'finalRemedies' as const,
    number: 'رابعاً',
    titleAr: 'الطلبات الختامية (الطلبات الأصلية والاحتياطية)',
    titleEn: 'Section 4: Final Remedies & Demands',
    placeholderAr:
      'بناءً على ما تقدم، نلتمس من فضيلتكم الحكم بالآتي:\n1. أصلياً: ...\n2. احتياطياً: ...\n3. إلزام المدعى عليه بأتعاب المحاماة ومصاريف التقاضي.',
  },
] as const

export const DEFAULT_SAMPLE_BRIEF: StructuredLegalBrief = {
  title: 'مذكرة جوابية ودفوع موضوعية أمام الدائرة التجارية',
  caseNumber: '447091882',
  courtName: 'المحكمة التجارية بالرياض',
  circuitName: 'الدائرة التجارية الرابعة',
  hearingDate: '2026-11-14',
  plaintiffName: 'شركة الآفاق المتقدمة للتجارة والمقاولات (س.ت: 1010445512)',
  defendantName: 'شركة المدار للأنظمة التقنية المحدودة (س.ت: 1010998123)',
  submittedByRole: 'DEFENDANT',
  counselName: 'المحامي د. فيصل بن عبدالعزيز آل سعود',
  licenseNumber: '410982',
  sections: {
    partiesAndFacts:
      '1. تتحصل وقائع هذه الدعوى في أن المدعية أقامت دعواها المقيدة برقم (447091882) طالبةً إلزام موكلتي (المدعى عليها) بتعويض قدره (1,850,000) ريال سعودي بزعم التأخر في توريد وتشغيل الأنظمة محل العقد المؤرخ في 14/03/2026م.\n2. وحيث إن موكلتي قد أوفت بكافة التزاماتها التعاقدية وسلمت المخرجات الفنية في مواعيدها بموجب محاضر استلام موقعة ومختومة من ممثل المدعية، فإن دعوى المدعية تكون قائمة على غير سند صحيح من الواقع أو النظام.',
    formalAndSubstantiveDefenses:
      'أولاً — من الناحية الشكلية:\nندفع بعدم قبول الطلب العارض المقدم من المدعية لعدم ارتباطه بالطلب الأصلي وفق المادة (83) من نظام المرافعات الشرعية.\n\nثانياً — من الناحية الموضوعية:\n1. انتفاء الخطأ العقدي في جانب موكلتي لثبوت التسليم الفعلي بموجب محضر الاستلام النهائي المؤرخ في 01/08/2026م.\n2. أن فترة التوقف الجزئي البالغة (12) يوماً كانت بسبب تأخر المدعية نفسها في توفير بيئة الخوادم المحلية وتصاريح الدخول، ولا يضار الملتزم بتأخر تسبب فيه الدائن.',
    statutoryAndShariaBases:
      '1. المادة (94) من نظام المعاملات المدنية: "يجب تنفيذ العقد طبقاً لما اشتمل عليه وبطريقة تتفق مع ما يوجبه حسن النية".\n2. المادة (178) والمادة (179) من نظام المعاملات المدنية: "لا يكون التعويض الاتفاقي مستحقاً إذا أثبت المدين أن الدائن لم يلحقه أي ضرر، وللمحكمة تخفيض التعويض إذا ثبت أنه مبالغ فيه أو أن الالتزام الأصلي قد نُفذ في جزء منه".\n3. المادة (29) من نظام الإثبات: حجية المحررات العادية والرسائل الرقمية الموقعة في إثبات استلام الأعمال.\n4. القاعدة الشرعية الكلية: "لا ضرر ولا ضرار"، وقاعدة: "من سعى في نقض ما تم من جهته فسعيه مردود عليه".',
    finalRemedies:
      'بناءً على ما تقدم من وقائع ودفوع وأسانيد نظامية وشرعية، نلتمس من مقام الدائرة الموقرة الحكم بالآتي:\n1. أصلياً: رد دعوى المدعية لإقامتها على غير سند مشروع وبراءة ذمة موكلتي من المطالبة.\n2. احتياطياً: إعمال سلطة الدائرة المقررة بالمادة (179) من نظام المعاملات المدنية باستبعاد الشرط الجزائي لعدم تحقق الضرر وتنفيذ الالتزام.\n3. إلزام المدعية بأتعاب المحاماة ومصاريف التقاضي وقدرها (150,000) ريال سعودي وفق المادة (26) من نظام المحاكم التجارية.',
  },
}

function splitParagraphs(text: string): Paragraph[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { after: 140, line: 340 },
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt
              font: 'Arial',
              rightToLeft: true,
            }),
          ],
        })
    )
}

/**
 * Generates an official court-ready DOCX buffer (Word document) with full RTL Arabic
 * layout, formal header block, 4 structured pleading sections, and counsel signature block.
 */
export async function generateBriefDocxBuffer(brief: StructuredLegalBrief): Promise<Uint8Array> {
  const roleLabelAr =
    brief.submittedByRole === 'PLAINTIFF'
      ? 'وكيل المدعي'
      : brief.submittedByRole === 'DEFENDANT'
      ? 'وكيل المدعى عليه'
      : brief.submittedByRole === 'APPELLANT'
      ? 'وكيل المستأنف'
      : 'وكيل المستأنف ضده'

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~2cm
              bottom: 1134,
              left: 1134,
              right: 1134,
            },
          },
        },
        children: [
          // Basmala
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'بسم الله الرحمن الرحيم',
                bold: true,
                size: 28,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),

          // Court & Circuit Header
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `إلى مقام: ${brief.courtName} — ${brief.circuitName}`,
                bold: true,
                size: 26,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),

          // Document Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            spacing: { before: 180, after: 240 },
            border: {
              bottom: { color: '0F172A', space: 6, style: BorderStyle.SINGLE, size: 12 },
            },
            children: [
              new TextRun({
                text: brief.title,
                bold: true,
                size: 32,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),

          // Case Metadata Block
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `في القضية المقيدة برقم: (${brief.caseNumber})${
                  brief.hearingDate ? ` • موعد الجلسة: ${brief.hearingDate}` : ''
                }`,
                bold: true,
                size: 24,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `المدعي: ${brief.plaintiffName}`,
                size: 24,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `المدعى عليه: ${brief.defendantName}`,
                size: 24,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),

          // Section 1: صفة الخصوم والوقائع
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 220, after: 120 },
            children: [
              new TextRun({
                text: 'أولاً: صفة الخصوم والوقائع الإجرائية',
                bold: true,
                size: 26,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),
          ...splitParagraphs(brief.sections.partiesAndFacts),

          // Section 2: الدفوع الشكلية والموضوعية
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 220, after: 120 },
            children: [
              new TextRun({
                text: 'ثانياً: الدفوع الشكلية والموضوعية',
                bold: true,
                size: 26,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),
          ...splitParagraphs(brief.sections.formalAndSubstantiveDefenses),

          // Section 3: الأسانيد النظامية والشرعية
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 220, after: 120 },
            children: [
              new TextRun({
                text: 'ثالثاً: الأسانيد النظامية والشرعية والسوابق القضائية',
                bold: true,
                size: 26,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),
          ...splitParagraphs(brief.sections.statutoryAndShariaBases),

          // Section 4: الطلبات الختامية
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 220, after: 120 },
            children: [
              new TextRun({
                text: 'رابعاً: الطلبات الختامية',
                bold: true,
                size: 26,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),
          ...splitParagraphs(brief.sections.finalRemedies),

          // Signature Footer Block
          new Paragraph({
            alignment: AlignmentType.LEFT,
            bidirectional: true,
            spacing: { before: 420, after: 80 },
            children: [
              new TextRun({
                text: `مقدمه / ${roleLabelAr}`,
                bold: true,
                size: 24,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            bidirectional: true,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: brief.counselName || 'المحامي المرخص',
                bold: true,
                size: 24,
                font: 'Arial',
                rightToLeft: true,
              }),
            ],
          }),
          ...(brief.licenseNumber
            ? [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: `ترخيص وزارة العدل رقم: (${brief.licenseNumber})`,
                      size: 22,
                      font: 'Arial',
                      rightToLeft: true,
                    }),
                  ],
                }),
              ]
            : []),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  return new Uint8Array(buffer)
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Generates an official court-ready printable HTML/PDF document matching Saudi Ministry of Justice
 * (Najiz) pleading formatting standards.
 */
export function generateCourtReadyPdfHtml(brief: StructuredLegalBrief): string {
  const roleLabelAr =
    brief.submittedByRole === 'PLAINTIFF'
      ? 'وكيل المدعي'
      : brief.submittedByRole === 'DEFENDANT'
      ? 'وكيل المدعى عليه'
      : brief.submittedByRole === 'APPELLANT'
      ? 'وكيل المستأنف'
      : 'وكيل المستأنف ضده'

  const renderLines = (content: string) =>
    escapeHtml(content)
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => `<p class="body-p">${line}</p>`)
      .join('\n')

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(brief.title)} — قضية رقم ${escapeHtml(brief.caseNumber)}</title>
  <style>
    @page {
      size: A4;
      margin: 22mm 20mm 22mm 20mm;
    }
    body {
      font-family: 'IBM Plex Sans Arabic', 'Traditional Arabic', 'Arial', sans-serif;
      color: #0f172a;
      line-height: 1.85;
      font-size: 13.5pt;
      margin: 0;
      padding: 0;
    }
    .basmala {
      text-align: center;
      font-weight: 700;
      font-size: 15pt;
      margin-bottom: 14px;
    }
    .header-box {
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 14px 18px;
      background: #f8fafc;
      margin-bottom: 20px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      font-size: 11.5pt;
      margin-bottom: 6px;
    }
    .doc-title {
      text-align: center;
      font-size: 17pt;
      font-weight: 800;
      margin: 18px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #0f172a;
    }
    .section-heading {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
      background: #f1f5f9;
      border-right: 4px solid #0284c7;
      padding: 6px 12px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .body-p {
      margin: 0 0 10px 0;
      text-align: justify;
    }
    .sig-block {
      margin-top: 38px;
      display: flex;
      justify-content: flex-end;
    }
    .sig-card {
      width: 260px;
      text-align: center;
      border-top: 1px solid #475569;
      padding-top: 10px;
      font-size: 12pt;
    }
    .footer-stamp {
      margin-top: 32px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
      font-size: 9.5pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="basmala">بسم الله الرحمن الرحيم</div>

  <div class="header-box">
    <div class="header-row">
      <div><strong>الجهة القضائية:</strong> ${escapeHtml(brief.courtName)}</div>
      <div><strong>الدائرة:</strong> ${escapeHtml(brief.circuitName)}</div>
    </div>
    <div class="header-row">
      <div><strong>رقم القضية:</strong> ${escapeHtml(brief.caseNumber)}</div>
      <div><strong>موعد الجلسة:</strong> ${escapeHtml(brief.hearingDate || 'محدد بجدول الدائرة')}</div>
    </div>
    <div class="header-row">
      <div><strong>المدعي:</strong> ${escapeHtml(brief.plaintiffName)}</div>
    </div>
    <div class="header-row">
      <div><strong>المدعى عليه:</strong> ${escapeHtml(brief.defendantName)}</div>
    </div>
  </div>

  <h1 class="doc-title">${escapeHtml(brief.title)}</h1>

  <h2 class="section-heading">أولاً: صفة الخصوم والوقائع الإجرائية</h2>
  ${renderLines(brief.sections.partiesAndFacts)}

  <h2 class="section-heading">ثانياً: الدفوع الشكلية والموضوعية</h2>
  ${renderLines(brief.sections.formalAndSubstantiveDefenses)}

  <h2 class="section-heading">ثالثاً: الأسانيد النظامية والشرعية والسوابق القضائية</h2>
  ${renderLines(brief.sections.statutoryAndShariaBases)}

  <h2 class="section-heading">رابعاً: الطلبات الختامية</h2>
  ${renderLines(brief.sections.finalRemedies)}

  <div class="sig-block">
    <div class="sig-card">
      <div><strong>مقدمه / ${roleLabelAr}</strong></div>
      <div>${escapeHtml(brief.counselName || 'المحامي المرخص')}</div>
      ${brief.licenseNumber ? `<div>ترخيص رقم: (${escapeHtml(brief.licenseNumber)})</div>` : ''}
    </div>
  </div>

  <div class="footer-stamp">
    <span>صادر عبر منصة مَقَرّ (MAQAR LegalOps Hub) — مطابق لمعايير إيداع المذكرات القضائية</span>
    <span>تاريخ الإصدار: ${new Date().toISOString().slice(0, 10)}</span>
  </div>
</body>
</html>`
}

