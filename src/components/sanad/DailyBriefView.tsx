'use client'

import { useDailyBrief } from './daily-brief/use-daily-brief'
import { DailyBriefHero } from './daily-brief/DailyBriefHero'
import { DailyBriefModeSelector } from './daily-brief/DailyBriefModeSelector'
import { NewsletterIssuesSection } from './daily-brief/NewsletterIssuesSection'
import { LiveFeedSection } from './daily-brief/LiveFeedSection'

export function DailyBriefView(props: { onNavigateToResearch?: () => void }) {
  const v = useDailyBrief(props)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <DailyBriefHero v={v} />
      <DailyBriefModeSelector v={v} />
      <NewsletterIssuesSection v={v} />
      <LiveFeedSection v={v} />
    </div>
  )
}
