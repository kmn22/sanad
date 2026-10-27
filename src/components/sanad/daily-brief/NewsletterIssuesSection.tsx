'use client'

import { Sparkles, Calendar, Share2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { NEWSLETTER_ISSUES } from './data'
import type { DailyBriefState } from './use-daily-brief'

export function NewsletterIssuesSection({ v }: { v: DailyBriefState }) {
  const { lang, viewMode } = v
  return (
    <>
      {/* 3. MODE A: CURATED NEWSLETTER ISSUES */}
      {viewMode === 'issues' && (
        <div className="space-y-4">
          {NEWSLETTER_ISSUES.map((issue) => (
            <div
              key={issue.id}
              className="rounded-2xl border border-border/80 bg-card/70 hover:border-emerald-500/40 p-6 transition-all duration-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 font-bold">
                    العدد #{issue.issueNumber}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {issue.dateHijri} ({issue.dateGregorian})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {issue.readTime}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground hover:text-emerald-500 transition-colors">
                  {issue.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
                  {issue.summary}
                </p>
              </div>

              {/* Lead Highlight */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-xs space-y-2">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>المحور التشريعي الأبرز: {issue.leadTopic}</span>
                </p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside ps-1">
                  {issue.highlights.map((h, i) => (
                    <li key={i} className="leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  نشرة رسمية موجهة لممارسي القانون والإدارات القانونية بالسعودية
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${issue.title}\n\n${issue.summary}\n\n${issue.highlights.join('\n')}`)
                      toast.success(lang === 'ar' ? 'تم نسخ ملخص العدد للحافظة' : 'Copied issue summary')
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'مشاركة العدد' : 'Share'}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </>
  )
}
