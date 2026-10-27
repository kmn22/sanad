'use client'

import React from 'react'
import { Bookmark, BookOpen, FileText } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useResearchHub } from './research/use-research-hub'
import { ResearchHero } from './research/ResearchHero'
import { KnowledgePillars } from './research/KnowledgePillars'
import { SavedResearchTab } from './research/SavedResearchTab'
import { StatutesRepositoryTab } from './research/StatutesRepositoryTab'
import { DossierBuilderTab } from './research/DossierBuilderTab'
import type { ResearchHubProps } from './research/types'

export type { ResearchItem } from './research/types'

export function ResearchHubView({ onNavigateToDrafting }: ResearchHubProps) {
  const state = useResearchHub()
  const { lang, activeTab, setActiveTab, items, dossierCitations } = state

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Hero Banner */}
      <ResearchHero state={state} />

      {/* 1B. 4 Knowledge Pillar Cards */}
      <KnowledgePillars state={state} />

      {/* 2. Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md w-full">
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'المحفوظات والأبحاث' : 'Saved Research'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-mono">
              {items.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="statutes" className="gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الأنظمة والسوابق' : 'Saudi Codes'}</span>
          </TabsTrigger>
          <TabsTrigger value="dossier" className="gap-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مذكرة الرأي القانوني' : 'Legal Opinion'}</span>
            {dossierCitations.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 font-mono">
                {dossierCitations.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SAVED RESEARCH */}
        <TabsContent value="saved" className="space-y-4">
          <SavedResearchTab state={state} />
        </TabsContent>

        {/* TAB 2: SAUDI STATUTES REPOSITORY */}
        <TabsContent value="statutes" className="space-y-4">
          <StatutesRepositoryTab state={state} />
        </TabsContent>

        {/* TAB 3: LEGAL OPINION / DOSSIER BUILDER */}
        <TabsContent value="dossier" className="space-y-4">
          <DossierBuilderTab state={state} onNavigateToDrafting={onNavigateToDrafting} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
