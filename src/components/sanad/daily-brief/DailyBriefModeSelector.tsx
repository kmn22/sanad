'use client'

import { BookOpen, Bookmark, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NEWSLETTER_ISSUES } from './data'
import type { DailyBriefState } from './use-daily-brief'

export function DailyBriefModeSelector({ v }: { v: DailyBriefState }) {
  const { onNavigateToResearch, lang, briefs, viewMode, setViewMode } = v
  return (
    <>
      {/* 2. Mode Selector: Live Feed vs Periodic Issues */}
      <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'feed' ? 'default' : 'ghost'}
            onClick={() => setViewMode('feed')}
            className={`text-xs gap-1.5 rounded-xl ${viewMode === 'feed' ? 'bg-primary text-primary-foreground font-semibold' : ''}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'البث الحي والمستجدات' : 'Live Regulations Feed'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary-foreground/20 font-mono">
              {briefs.length}
            </span>
          </Button>

          <Button
            size="sm"
            variant={viewMode === 'issues' ? 'default' : 'ghost'}
            onClick={() => setViewMode('issues')}
            className={`text-xs gap-1.5 rounded-xl ${viewMode === 'issues' ? 'bg-primary text-primary-foreground font-semibold' : ''}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'أعداد النشرة التحليلية' : 'Curated Issues'}</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono">
              {NEWSLETTER_ISSUES.length} {lang === 'ar' ? 'أعداد' : 'issues'}
            </Badge>
          </Button>
        </div>

        {onNavigateToResearch && (
          <Button
            size="sm"
            variant="outline"
            onClick={onNavigateToResearch}
            className="text-xs text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/30 gap-1.5 hidden sm:flex"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مركز الأبحاث المحفوظة' : 'View Research Hub'}</span>
          </Button>
        )}
      </div>

    </>
  )
}
