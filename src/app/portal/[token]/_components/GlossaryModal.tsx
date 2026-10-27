'use client'

import {
  BookOpen,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GLOSSARY_ITEMS } from '@/lib/portal-glossary'
import type { PortalView } from '../_lib/use-portal-view'

export function GlossaryModal({ v }: { v: PortalView }) {
  const { showGlossaryModal, setShowGlossaryModal } = v
  return (
    <>
      {/* ========================================================
          MODAL: ZERO-JARGON GLOSSARY SHEET
         ======================================================== */}
      {showGlossaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">دليل المصطلحات المبسطة (Zero Jargon)</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowGlossaryModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                في سند، نؤمن بأن لغة القانون حق للموكل أن يفهمها دون غموض. يوضح هذا الجدول ترجمة المصطلحات الرسمية إلى لغة يومية ميسرة:
              </p>

              <div className="space-y-2">
                {GLOSSARY_ITEMS.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">{item.clientWording}</span>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">{item.term}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.why}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t bg-slate-50 dark:bg-slate-800/40 text-center">
              <Button size="sm" className="bg-emerald-600 text-white text-xs w-full" onClick={() => setShowGlossaryModal(false)}>
                إغلاق الدليل
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
