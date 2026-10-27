'use client'

import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import type { SandboxState } from './use-sandbox'

export function SandboxBanner({ v }: { v: SandboxState }) {
  const { secondsLeft, formatTimer } = v
  return (
    <>
      <div className="sticky top-0 z-50 bg-[#34543F] text-white px-4 py-2.5 shadow-xs border-b border-[#CCD8CE]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#E8EFE9] animate-pulse" />
            <span className="font-bold">معمل تجريبي فوري (Sandbox Demo)</span>
            <span className="text-white/80 hidden sm:inline">• مكتب افتراضي مسبق التهيئة</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full font-mono font-bold text-white border border-white/20">
              <Clock className="h-3.5 w-3.5 text-[#E8EFE9]" />
              <span>متبقي في الجلسة: {formatTimer(secondsLeft)}</span>
            </div>

            <Link
              href="/pricing"
              className="bg-white text-[#1B281F] hover:bg-[#E8EFE9] px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <span>احفظ أعمالك — فعّل حسابك</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
