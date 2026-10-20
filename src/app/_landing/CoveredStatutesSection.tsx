'use client'

import { useState } from 'react'
import { Search, Scale, ExternalLink } from 'lucide-react'

type PillarId = 'statutes' | 'orders' | 'precedents' | 'books'

interface KnowledgePillar {
  id: PillarId
  title: string
  desc: string
  samples: Array<{
    title: string
    source: string
    snippet: string
  }>
}

const KNOWLEDGE_PILLARS: KnowledgePillar[] = [
  {
    id: 'statutes',
    title: 'الأنظمة ولوائحها',
    desc: 'تجد في مكان واحد جميع الأنظمة السعودية مقترنةً بلوائحها التنفيذية وبآخر التحديثات والتعديلات الصادرة عليها',
    samples: [
      {
        title: 'نظام المعاملات المدنية (مرسوم ملكي م/191)',
        source: 'المادتان (174) و (179) — الظروف الطارئة والشرط الجزائي',
        snippet: 'تنظيم أركان العقد، القوة الملزمة، سلطة المحكمة في تعديل التعويض الاتفاقي المبالغ فيه، ورد الالتزام المرهق إلى الحد المعقول.',
      },
      {
        title: 'نظام العمل السعودي ولائحته التنفيذية',
        source: 'المواد (53، 77، 80، 83، 92–93)',
        snippet: 'ضوابط فترة التجربة (90–180 يوماً)، شروط صحة عدم المنافسة، حالات الفسخ المشروع، وسقف الحسم من أجر العامل.',
      },
      {
        title: 'نظام الشركات الجديد ولائحته التنفيذية (م/132)',
        source: 'المادة (138) وما بعدها — شركة المساهمة المبسطة وحوكمة الشركات',
        snippet: 'إطار تأسيس الشركات، اتفاقيات الشركاء ومواثيق العائلة، مسؤولية المديرين وأعضاء مجلس الإدارة.',
      },
      {
        title: 'نظام حماية البيانات الشخصية (PDPL) ولوائحه',
        source: 'المرسوم الملكي (م/19) والمادة (29)',
        snippet: 'ضوابط معالجة البيانات الشخصية، حقوق صاحب البيانات، واشتراطات توطين وحفظ البيانات داخل المملكة.',
      },
    ],
  },
  {
    id: 'orders',
    title: 'الأوامر والتعاميم',
    desc: 'الاطلاع على آلاف الأوامر والقرارات بوثائقها الأصلية من الجهات الحكومية مع إمكانية البحث في محتوى المستند',
    samples: [
      {
        title: 'تعميم وزارة العدل بشأن وجوب الإخطار والمصالحة قبل قيد الدعاوى التجارية',
        source: 'المادتان (8) و (19) من نظام المحاكم التجارية ولائحته التنفيذية',
        snippet: 'اشتراط إخطار المدعى عليه كتابياً بأداء الحق قبل 15 يوماً من قيد الدعوى أو اللجوء لمنصة تراضي كشرط لقبول الدعوى شكلاً.',
      },
      {
        title: 'قرارات وزارة الموارد البشرية بشأن حظر احتجاز وثائق العامل',
        source: 'المادة (61) من نظام العمل والقرارات الوزارية المنظمة',
        snippet: 'حظر احتجاز جواز سفر العامل أو إقامته أو وثائقه الثبوتية أو توقيع عقوبات غير واردة في لائحة تنظيم العمل المعتمدة.',
      },
      {
        title: 'ضوابط الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) للإخطار عن التسرب',
        source: 'اللائحة التنفيذية لنظام حماية البيانات الشخصية',
        snippet: 'التزام جهة التحكم بإخطار الهيئة خلال 72 ساعة من العلم بحادث تسرب أو وصول غير مصرح به للبيانات الشخصية.',
      },
    ],
  },
  {
    id: 'precedents',
    title: 'السوابق القضائية',
    desc: 'الاطلاع على آلاف من الأحكام القضائية في المملكة العربية السعودية مع إمكانية البحث بموضوع النزاع',
    samples: [
      {
        title: 'مبدأ الهيئة العامة للمحكمة العليا: قصر التعويض على الضرر الفعلي المباشر',
        source: 'قرار الهيئة العامة للمحكمة العليا رقم (124/م/1442هـ)',
        snippet: 'التعويض القضائي في المنازعات المالية والتجارية يقصر وجوباً على الخسارة الفعلية المباشرة المثبتة، وبطلان الفوائد التأخيرية أو الأرباح الافتراضية.',
      },
      {
        title: 'مبدأ المحكمة العليا: تقادم الدعوى العمالية بمضي 12 شهراً',
        source: 'قرار المحكمة العليا رقم (89/م/1443هـ) والمادة (222) من نظام العمل',
        snippet: 'لا تُسمع الدعوى المتعلقة بالمطالبة بالحقوق المقررة في نظام العمل إذا أقيمت بعد مضي اثني عشر شهراً من تاريخ انتهاء علاقة العمل.',
      },
      {
        title: 'سابقة المحاكم التجارية: حجية المراسلات الإلكترونية والفواتير المستلمة',
        source: 'مجموعة الأحكام التجارية — الدوائر الاستئنافية والمادة (54) إثبات',
        snippet: 'المراسلات الإلكترونية الصادرة من البريد المعتمد للأطراف حجة كاملة في إثبات استلام البضاعة أو إقرار الرصيد المالي.',
      },
    ],
  },
  {
    id: 'books',
    title: 'الكتب والأبحاث القانونية',
    desc: 'تصفّح العديد من الكتب والأبحاث القانونية والمصادر الثانوية المتنوعة والمثرية',
    samples: [
      {
        title: 'شرح أحكام الضمان العقدي والمسؤولية التقصيرية في نظام المعاملات المدنية',
        source: 'موسوعة الفقه والقضاء المدني السعودي',
        snippet: 'تحليل مقارن لأركان المسؤولية العقدية (الخطأ، الضرر، علاقة السببية) وتطبيقات القضاء السعودي في عقود التوريد والمقاولات.',
      },
      {
        title: 'أصول الصياغة الوقائية للعقود التجارية والعمالية في المملكة',
        source: 'سلسلة الدراسات القانونية التطبيقية للمحامين',
        snippet: 'قواعد بناء البنود الجوهرية، صياغة شروط الإنهاء والفسخ، وتفادي الثغرات المؤدية إلى بطلان الشروط التعاقدية.',
      },
      {
        title: 'الدفوع الشكلية والموضوعية أمام المحاكم التجارية والعمالية',
        source: 'دليل المرافعات القضائية السعودية',
        snippet: 'ترتيب إبداء الدفوع الشكلية (الاختصاص، الصفة، الإخطار المسبق، التقادم) قبل الخوض في أصل الحق المتنازع عليه.',
      },
    ],
  },
]

function PillarIcon({ id }: { id: PillarId }) {
  if (id === 'statutes') {
    // Saudi Palm & Crossed Swords Emblem SVG
    return (
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#5A6578]" aria-hidden="true">
        <path
          d="M18 6v11M18 9c-3.5-3.5-8-3-10.5-.5 3-.8 6.5-.2 10.5 2.5M18 9c3.5-3.5 8-3 10.5-.5-3-.8-6.5-.2-10.5 2.5M18 12c-4-2.5-8.5-1.5-11 1.5 3.5-1 7-.5 11 1.5M18 12c4-2.5 8.5-1.5 11 1.5-3.5-1-7-.5-11 1.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 28c5-2.5 13-6.5 20-12M28 28C23 25.5 15 21.5 8 16M7 26.5l2.5 2.5M29 26.5l-2.5 2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (id === 'orders') {
    // Scales of Justice SVG
    return (
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#5A6578]" aria-hidden="true">
        <path
          d="M18 6v23M12 29h12M9 11h18M9 11l-3.5 8h7L9 11zm18 0l-3.5 8h7L27 11z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M5.5 19a3.5 3.5 0 0 0 7 0M23.5 19a3.5 3.5 0 0 0 7 0" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }
  if (id === 'precedents') {
    // Judicial Gavel SVG
    return (
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#5A6578]" aria-hidden="true">
        <path
          d="M15 9l6 6-4 4-6-6 4-4zM13 7l-3 3M23 17l-3 3M18 16L8 26M19 28h10"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  // Books / Legal Library SVG
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 text-[#5A6578]" aria-hidden="true">
      <rect x="7" y="8" width="5" height="20" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="8" width="5" height="20" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M22 8.5l4.8-1.2a1 1 0 0 1 1.2.7l4.2 18.2a1 1 0 0 1-.7 1.2l-4.8 1.2a1 1 0 0 1-1.2-.7L21.3 9.7a1 1 0 0 1 .7-1.2z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M9 12h1M16 12h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function CoveredStatutesSection() {
  const [selectedPillar, setSelectedPillar] = useState<PillarId>('statutes')
  const [query, setQuery] = useState('')

  const active = KNOWLEDGE_PILLARS.find((p) => p.id === selectedPillar) || KNOWLEDGE_PILLARS[0]
  const filteredSamples = active.samples.filter(
    (s) =>
      !query.trim() ||
      s.title.includes(query) ||
      s.source.includes(query) ||
      s.snippet.includes(query),
  )

  return (
    <section className="py-14 border-y border-[#CCD8CE] bg-[#F8FAF8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1B281F] font-heading flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1F7A46]" />
              <span>قاعدة المعرفة القانونية السعودية الشاملة</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] mt-1">
              كل مخرج في سَنَد مستند إلى أربعة روافد نظامية وقضائية سعودية موثقة ومحدثة
            </p>
          </div>
          <div className="text-[11px] font-mono text-[#34543F] bg-white px-3.5 py-1.5 rounded-full border border-[#CCD8CE] self-start md:self-auto font-bold shadow-2xs">
            مراجع نظامية سعودية موثقة • تحديث 2026
          </div>
        </div>

        {/* 4 Saudi Legal Knowledge Pillar Cards (matching the institutional 4-card layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KNOWLEDGE_PILLARS.map((pillar) => {
            const isSelected = selectedPillar === pillar.id
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillar(pillar.id)}
                className={`text-right rounded-2xl bg-white p-6 sm:p-7 border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#1F7A46] shadow-md ring-2 ring-[#1F7A46]/15'
                    : 'border-[#E2E8E4] shadow-xs hover:border-[#1F7A46]/60 hover:shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  {/* Top-Right Icon */}
                  <div className="flex items-center justify-between">
                    <PillarIcon id={pillar.id} />
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8EFE9] text-[#1F7A46]">
                        قيد الاستعراض
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base sm:text-lg text-[#1F2937] font-heading">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-[#6B7280] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Interactive Explorer Drawer for Selected Pillar */}
        <div className="rounded-2xl bg-white border border-[#CCD8CE] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CCD8CE] pb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#E8EFE9] text-[#1F7A46]">
                نماذج من {active.title}
              </span>
              <span className="text-xs text-[#566A5C]">
                انقر على أي بطاقة أعلاه لتبديل القسم أو ابحث في المحتوى
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#566A5C] absolute right-3 top-2.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`ابحث في ${active.title}...`}
                className="w-full h-8 pr-8 pl-3 rounded-lg bg-[#F5F7F5] border border-[#CCD8CE] text-xs text-[#1B281F] focus:outline-none focus:border-[#1F7A46]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {filteredSamples.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#CCD8CE] bg-[#F5F7F5]/60 p-4 space-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B281F] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#4A5D50] leading-relaxed">
                    {item.snippet}
                  </p>
                </div>
                <p className="pt-2 text-[11px] font-mono font-bold text-[#1F7A46] flex items-center gap-1 border-t border-[#CCD8CE]/70">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.source}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
