'use client'

import {
  BookOpen,
  Calendar,
  ChevronLeft,
  MessageSquare,
  Settings,
} from 'lucide-react'
import type { PortalView } from '../_lib/use-portal-view'

export function MoreTab({ v }: { v: PortalView }) {
  const { activeTab, moreSubScreen, setMoreSubScreen, setShowGlossaryModal } = v
  return (
    <>
      {/* ========================================================
          SCREEN: MORE MENU (أكثر)
         ======================================================== */}
      {activeTab === 'more' && moreSubScreen !== 'sessions' && moreSubScreen !== 'messages' && moreSubScreen !== 'settings' && (
        <div className="space-y-3 animate-in fade-in">
          <h2 className="text-lg font-bold">الخدمات الإضافية</h2>

          <div className="grid grid-cols-1 gap-2.5">
            <div
              onClick={() => setMoreSubScreen('sessions')}
              className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">الجلسات والمواعيد (S4)</h4>
                  <p className="text-xs text-muted-foreground">تفاصيل المواعيد، التقويم، والاتجاهات للمحكمة</p>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </div>

            <div
              onClick={() => setMoreSubScreen('messages')}
              className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">الرسائل والمراسلات (S7)</h4>
                  <p className="text-xs text-muted-foreground">مراسلة محامي القضية وإرفاق المستندات الإضافية</p>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </div>

            <div
              onClick={() => setMoreSubScreen('settings')}
              className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">الإعدادات والتنبيهات (S8)</h4>
                  <p className="text-xs text-muted-foreground">إدارة قنوات التنبيهات، الأجهزة، وحماية البيانات</p>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </div>

            <div
              onClick={() => setShowGlossaryModal(true)}
              className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">مسرد المصطلحات المبسطة</h4>
                  <p className="text-xs text-muted-foreground">شرح المعاني القضائية بلغة واضحة خالية من التعقيد</p>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
