'use client'

import {
  BookOpen,
  Phone,
  Scale,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function PortalHeader({ v }: { v: PortalView }) {
  const { workspace, client, setShowGlossaryModal } = v
  return (
    <>
  {/* Sovereign Header */}
  <header className="sticky top-0 z-30 border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 shadow-xs">
    <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm">{workspace?.name || 'المقر المهني الشريك'}</span>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-300">
              موثق
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">مَقَرّ الموكل الرقمي • بوابة سحابية آمنة</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowGlossaryModal(true)}
          className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer"
          title="دليل المصطلحات المبسطة"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">دليل المصطلحات</span>
        </button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          onClick={() => {
            const phone = client.phone ? client.phone.replace(/\D/g, '') : ''
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent('السلام عليكم، لدي استفسار بخصوص ملفي في مَقَرّ')}`, '_blank')
          }}
        >
          <Phone className="h-3 w-3" />
          <span>اتصال</span>
        </Button>
      </div>
    </div>
  </header>
    </>
  )
}
