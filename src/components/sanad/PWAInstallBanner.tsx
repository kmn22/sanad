'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'sanad.pwa.dismissed.at'
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function PWAInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !deferred) return null

  const install = async () => {
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') {
      setVisible(false)
    } else {
      dismiss()
    }
  }

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-sm z-50 rounded-lg border border-primary/20 bg-card shadow-lg p-3 flex items-center gap-3 animate-in slide-in-from-bottom-4"
    >
      <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
        <Download className="h-4 w-4" />
      </div>
      <div className="flex-1 text-xs leading-tight">
        <p className="font-semibold">ثبّت سند على جهازك</p>
        <p className="text-muted-foreground">وصول أسرع، يعمل بدون إنترنت بشكل جزئي</p>
      </div>
      <Button size="sm" className="h-8 text-xs" onClick={install}>
        تثبيت
      </Button>
      <button
        onClick={dismiss}
        aria-label="إغلاق"
        className="text-muted-foreground hover:text-foreground p-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
