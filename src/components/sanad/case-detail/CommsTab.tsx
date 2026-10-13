'use client'

import { Card, CardContent } from '@/components/ui/card'
import { User, Calendar, Clock, MessageSquare } from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, type Communication } from '@/lib/sanad/types'
import { getCommMeta, getDirectionMeta } from './meta'
import { EmptyState } from './primitives'

export function CommsTab({
  communications,
}: {
  communications: (Communication & { client?: { name: string } | null })[]
}) {
  const { lang, t } = useLang()

  if (communications.length === 0) {
    return <EmptyState icon={MessageSquare} label={t('case.no_comms')} />
  }

  return (
    <ul className="p-3 space-y-2">
      {communications.map((c) => {
        const meta = getCommMeta(c.type)
        const dirMeta = getDirectionMeta(c.direction)
        const Icon = meta.Icon
        return (
          <li key={c.id}>
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`shrink-0 rounded-md p-1.5 ${meta.color}`}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight flex-1 min-w-0 text-start">
                        {c.subject}
                      </p>
                      <dirMeta.Icon
                        className={`size-3.5 shrink-0 mt-0.5 ${dirMeta.color}`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                      <span>{t(`comms.types.${c.type}`)}</span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-2.5" />
                        {formatDate(c.date, lang)}
                      </span>
                      {c.client?.name && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="flex items-center gap-1">
                            <User className="size-2.5" />
                            {c.client.name}
                          </span>
                        </>
                      )}
                      {c.durationMin != null && c.durationMin > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {c.durationMin.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                            {lang === 'ar' ? 'د' : 'm'}
                          </span>
                        </>
                      )}
                    </div>
                    {c.body && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 text-start">
                        {c.body}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
