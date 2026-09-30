'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Bell, CheckCheck, ShieldAlert, Scale, CheckSquare, Sparkles, ExternalLink, Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/sanad/i18n'
import { useRouter } from 'next/navigation'

interface AppNotification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link?: string | null
  createdAt: string
  entityType?: string | null
  entityId?: string | null
}

function formatRelativeTime(dateStr: string, lang: 'ar' | 'en'): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (lang === 'ar') {
    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays === 1) return 'أمس'
    return `منذ ${diffDays} يوم`
  }

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  return `${diffDays}d ago`
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'compliance':
      return <ShieldAlert className="h-4 w-4 text-rose-500" />
    case 'hearing':
      return <Scale className="h-4 w-4 text-indigo-500" />
    case 'task':
      return <CheckSquare className="h-4 w-4 text-amber-500" />
    default:
      return <Sparkles className="h-4 w-4 text-emerald-500" />
  }
}

export function NotificationCenter() {
  const { lang } = useLang()
  const router = useRouter()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) {
        setNotifications(data)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    let eventSource: EventSource | null = null
    try {
      eventSource = new EventSource('/api/notifications/stream')

      eventSource.addEventListener('sync', (e) => {
        try {
          const payload = JSON.parse(e.data)
          if (Array.isArray(payload.notifications)) {
            setNotifications(payload.notifications)
          }
        } catch {}
      })

      eventSource.addEventListener('new', (e) => {
        try {
          const payload = JSON.parse(e.data)
          if (Array.isArray(payload.notifications) && payload.notifications.length > 0) {
            setNotifications((prev) => {
              const existingIds = new Set(prev.map((n) => n.id))
              const fresh = payload.notifications.filter((n: AppNotification) => !existingIds.has(n.id))
              return [...fresh, ...prev].slice(0, 50)
            })
          }
        } catch {}
      })

      eventSource.onerror = () => {
        // If SSE fails or unauthenticated, close cleanly
        eventSource?.close()
      }
    } catch {
      // Fallback
    }

    // Keep background polling every 60 seconds as safety net
    const interval = setInterval(fetchNotifications, 60000)

    return () => {
      eventSource?.close()
      clearInterval(interval)
    }
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = async (id: string, link?: string | null) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }

    if (link) {
      setOpen(false)
      router.push(link)
    }
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return
    setMarkingAll(true)
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [] }),
      })
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      fetchNotifications()
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0 hover:bg-muted/80"
          title={lang === 'ar' ? 'التنبيهات' : 'Notifications'}
          aria-label={lang === 'ar' ? 'التنبيهات' : 'Notifications'}
        >
          <Bell className="h-4 w-4 text-foreground/80 transition-transform active:scale-95" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-xl border border-border/80 bg-background/95 backdrop-blur-md rounded-xl overflow-hidden"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {lang === 'ar' ? 'مركز التنبيهات' : 'Notifications'}
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                {unreadCount} {lang === 'ar' ? 'جديد' : 'new'}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              <span>{lang === 'ar' ? 'قراءة الكل' : 'Mark all read'}</span>
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {loading && notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="h-10 w-10 rounded-full bg-muted/80 text-muted-foreground mx-auto flex items-center justify-center mb-2">
                <Bell className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {lang === 'ar' ? 'لا توجد تنبيهات حالياً' : 'No notifications'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ar'
                  ? 'ستظهر هنا مواعيد الجلسات، تنبيهات التراخيص، والمهام المستحقة.'
                  : 'Court hearings, compliance expiries, and task deadlines will appear here.'}
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id, item.link)}
                className={`p-3.5 hover:bg-muted/50 cursor-pointer transition-colors flex items-start gap-3 text-start ${
                  !item.isRead ? 'bg-primary/5 dark:bg-primary/[0.04]' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0 rounded-lg p-2 bg-background border border-border/80 shadow-2xs">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs truncate ${!item.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/90'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                      {formatRelativeTime(item.createdAt, lang)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  {item.link && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-primary font-medium">
                      <span>{lang === 'ar' ? 'عرض التفاصيل' : 'View details'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {!item.isRead && (
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0 ring-2 ring-primary/20" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 text-center border-t border-border/60 bg-muted/20">
            <span className="text-[11px] text-muted-foreground">
              {lang === 'ar' ? 'يتم التحديث تلقائياً' : 'Auto-updated every minute'}
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
