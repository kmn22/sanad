'use client'

import type { DeepWorkState } from './use-deep-work'

export function DeepWorkHeader({ v }: { v: DeepWorkState }) {
  const { t } = v
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t('dw.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('dw.subtitle')}</p>
      </div>
    </>
  )
}
