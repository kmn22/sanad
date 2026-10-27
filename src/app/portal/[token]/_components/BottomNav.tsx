'use client'

import {
  Clock,
  CreditCard,
  FileText,
  Scale,
  Settings,
} from 'lucide-react'
import type { PortalView } from '../_lib/use-portal-view'

export function BottomNav({ v }: { v: PortalView }) {
  const { activeTab, setActiveTab, setMoreSubScreen, unpaidInvoices, unsignedDocs } = v
  return (
    <>
      {/* ========================================================
          BOTTOM TAB BAR: 5 DESTINATIONS (الرئيسية، قضاياي، المستندات، الفواتير، أكثر)
         ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2">
        <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">الرئيسية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'cases'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">قضاياي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'docs'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">المستندات</span>
            {unsignedDocs.length > 0 && (
              <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'invoices'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">الفواتير</span>
            {unpaidInvoices.length > 0 && (
              <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-emerald-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('more')
              setMoreSubScreen('sessions')
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'more'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">أكثر</span>
          </button>
        </div>
      </nav>
    </>
  )
}
