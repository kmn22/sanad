'use client'

import Link from 'next/link'
import { Scale } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SandboxHeader() {
  return (
    <>
      <header className="border-b border-[#CCD8CE] bg-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE] flex items-center justify-center font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base font-heading text-[#1B281F]">
                  مكتب العدل والإنصاف للمحاماة (معمل تجريبي)
                </h1>
                <Badge variant="outline" className="text-[10px] border-[#CCD8CE] text-[#1F7A46] bg-[#E8EFE9]">
                  وضع المعاينة الحية
                </Badge>
              </div>
              <p className="text-[11px] text-[#566A5C]">ترخيص وزارة العدل رقم 104820 • الرياض، المملكة العربية السعودية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register?plan=firm"
              className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-colors shadow-2xs"
            >
              تفعيل اشتراك المكتب
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
