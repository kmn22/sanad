'use client'

import type { Props } from './deep-work/types'
import { useDeepWork } from './deep-work/use-deep-work'
import { DeepWorkHeader } from './deep-work/DeepWorkHeader'
import { DeepWorkGrid } from './deep-work/DeepWorkGrid'
import { WeeklyHoursChart } from './deep-work/WeeklyHoursChart'

export function DeepWorkView(props: Props) {
  const v = useDeepWork(props)

  return (
    <div className="space-y-6">
      <DeepWorkHeader v={v} />
      <DeepWorkGrid v={v} />
      <WeeklyHoursChart v={v} />
    </div>
  )
}

