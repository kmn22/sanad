'use client'

import { ArrowLeft, BriefcaseBusiness, GraduationCap, Scale } from 'lucide-react'

type VerticalModule = 'LEGAL' | 'STUDENT' | 'GENERAL'

const CONTENT: Record<VerticalModule, { title: string; subtitle: string; icon: typeof Scale; items: string[] }> = {
  LEGAL: {
    title: 'البوابة القانونية',
    subtitle: 'أدوات المحامين ومكاتب المحاماة مع الحفاظ على كامل دورة القضية.',
    icon: Scale,
    items: ['إدارة القضايا والمذكرات القانونية', 'الوكالات والامتثال', 'فوترة الموكلين والأتعاب'],
  },
  STUDENT: {
    title: 'مقر الطلاب والباحثين',
    subtitle: 'مساحة أكاديمية للبحث، التلخيص، الدراسة، وتتبع التقدم.',
    icon: GraduationCap,
    items: ['ملخصات القضايا الذكية', 'غرف المذاكرة المشتركة', 'متابعة المهام الأكاديمية وGPA'],
  },
  GENERAL: {
    title: 'المقر العام',
    subtitle: 'مكتب افتراضي مرن للمشاريع والعملاء والخدمات.',
    icon: BriefcaseBusiness,
    items: ['إدارة المشاريع ولوحات العمل', 'بوابة العملاء', 'باقات الخدمات'],
  },
}

export function VerticalModulePanel({ vertical }: { vertical: VerticalModule }) {
  const content = CONTENT[vertical]
  const Icon = content.icon

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-accent p-3 text-primary border border-border">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">{content.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{content.subtitle}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {content.items.map((item) => (
          <div key={item} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-sm font-semibold text-foreground">
            <span>{item}</span>
            <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        ))}
      </div>
    </section>
  )
}
