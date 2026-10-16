'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale, ArrowLeft, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/#checker', label: 'المصحح', highlight: true },
  { href: '/sandbox', label: 'المعمل التجريبي' },
  { href: '/pricing', label: 'الأسعار والباقات' },
  { href: '/about', label: 'من نحن' },
  { href: '/security', label: 'الأمان والسيادة', subtle: true },
]

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="border-b border-[#CCD8CE] bg-[#E8EFE9] px-4 py-2 text-center text-xs font-medium text-[#1B281F] flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-[#1F7A46]" />
        <span>منصة سعودية مساندة للمحامين — صياغة ممتثلة وتدقيق نظامي لحظي</span>
        <span className="text-[#566A5C] hidden sm:inline">•</span>
        <Link href="/about" className="text-[#1F7A46] font-bold hover:underline inline-flex items-center gap-1">
          تعرّف على سَنَد <ArrowLeft className="w-3 h-3 inline" />
        </Link>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#CCD8CE] bg-[#FFFFFF]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-[#1F7A46] p-2.5 rounded-xl shadow-xs text-white">
                  <Scale className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-[#1B281F] font-heading">سَنَد</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider border border-[#CCD8CE] text-[#34543F] bg-[#E8EFE9] px-1.5 py-0.5 rounded-md font-semibold">
                      LEGAL OS
                    </span>
                  </div>
                  <span className="text-[11px] text-[#4A5D50] hidden sm:block">مساعد الصياغة الممتثلة للأنظمة السعودية</span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-6 text-sm font-medium text-[#1B281F]">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-[#1F7A46] transition-colors ${
                    item.highlight ? 'font-semibold' : item.subtle ? 'text-xs text-[#4A5D50]' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth Actions + Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[#1B281F] hover:text-[#1F7A46] hover:bg-[#E8EFE9] font-medium text-xs sm:text-sm cursor-pointer">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer">
                  ابدأ مجاناً
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                </Button>
              </Link>
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-[#CCD8CE] text-[#1B281F] hover:bg-[#E8EFE9] transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <nav
              aria-label="قائمة الجوال"
              className="md:hidden border-t border-[#CCD8CE] py-3 flex flex-col gap-1 text-sm font-medium text-[#1B281F]"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] hover:text-[#1F7A46] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/build"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] hover:text-[#1F7A46] transition-colors text-xs text-[#4A5D50]"
              >
                قيد البناء (خارطة الطريق)
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
