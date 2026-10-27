'use client'

import React from 'react'
import { BookOpen, Scale, Gavel, Layers } from 'lucide-react'
import type { ResearchHubState } from './use-research-hub'

const PILLARS = [
  {
    type: 'statute',
    title: 'الأنظمة ولوائحها',
    desc: 'تجد في مكان واحد جميع الأنظمة السعودية مقترنةً بلوائحها التنفيذية وبآخر التحديثات والتعديلات الصادرة عليها',
    icon: BookOpen,
  },
  {
    type: 'regulation',
    title: 'الأوامر والتعاميم',
    desc: 'الاطلاع على آلاف الأوامر والقرارات بوثائقها الأصلية من الجهات الحكومية مع إمكانية البحث في محتوى المستند',
    icon: Scale,
  },
  {
    type: 'precedent',
    title: 'السوابق القضائية',
    desc: 'الاطلاع على آلاف من الأحكام القضائية في المملكة العربية السعودية مع إمكانية البحث بموضوع النزاع',
    icon: Gavel,
  },
  {
    type: 'doctrine',
    title: 'الكتب والأبحاث القانونية',
    desc: 'تصفّح العديد من الكتب والأبحاث القانونية والمصادر الثانوية المتنوعة والمثرية',
    icon: Layers,
  },
]

export function KnowledgePillars({ state }: { state: ResearchHubState }) {
  const { lang, items, selectedType, setSelectedType, activeTab, setActiveTab } = state

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {PILLARS.map((pillar) => {
        const Icon = pillar.icon
        const active = selectedType === pillar.type && activeTab === 'saved'
        return (
          <button
            key={pillar.type}
            type="button"
            onClick={() => {
              setActiveTab('saved')
              setSelectedType(selectedType === pillar.type ? 'all' : pillar.type)
            }}
            className={`text-right rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
              active
                ? 'border-primary bg-primary/5 ring-2 ring-primary/15 shadow-sm'
                : 'border-border/80 bg-card hover:border-primary/50 shadow-2xs'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Icon className="w-6 h-6 text-muted-foreground" />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {items.filter((it) => it.type === pillar.type).length} {lang === 'ar' ? 'مرجع' : 'items'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-foreground font-heading">
                {pillar.title}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
