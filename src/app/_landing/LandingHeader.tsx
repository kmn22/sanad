'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Scale, ArrowLeft, Menu, X, LayoutDashboard } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/#checker', label: 'مساعد قراءة البنود', highlight: true },
  { href: '/pricing', label: 'الأسعار والباقات' },
  { href: '/about', label: 'عن مقر' },
  { href: '/security', label: 'الأمان والخصوصية', subtle: true },
]

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="border-b border-[#CCD8CE] bg-[#E8EFE9] px-4 py-2 text-center text-xs font-medium text-[#1B281F] flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-[#1F7A46]" />
        <span className="font-bold text-[#1B281F]">«مقر»</span>
        <span>—</span>
        <span>المكتب الرقمي وبوابة الموكّل للمحامين والمكاتب الصغيرة في السعودية</span>
        <span className="text-[#566A5C] hidden sm:inline">•</span>
        <Link href="/register" className="text-[#1F7A46] font-bold hover:underline hidden sm:inline-flex items-center gap-1">
          جرّب ١٤ يوماً مجاناً <ArrowLeft className="w-3 h-3 inline" />
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
                    <span className="text-2xl font-black text-[#1B281F] font-heading">مقر</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider border border-[#CCD8CE] text-[#34543F] bg-[#E8EFE9] px-1.5 py-0.5 rounded-md font-semibold">
                      MAQAR
                    </span>
                  </div>
                  <span className="text-[11px] text-[#4A5D50] hidden sm:block">
                    المكتب الرقمي للمحامي المستقل والمكاتب الصغيرة
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1B281F]">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-[#1F7A46] transition-colors ${item.highlight ? 'font-bold text-[#1F7A46]' : item.subtle ? 'text-xs text-[#4A5D50]' : ''
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth Actions + Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <Link href="/lawyer">
                  <Button size="sm" className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>مساحة العمل</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-[#1B281F] hover:text-[#1F7A46] hover:bg-[#E8EFE9] font-medium text-xs sm:text-sm cursor-pointer">
                      دخول
                    </Button>
                  </Link>
                  <Link href="/register" data-testid="header-cta-register">
                    <Button size="sm" className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer">
                      ابدأ تجربة ١٤ يوماً
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    </Button>
                  </Link>
                </>
              )}
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg border border-[#CCD8CE] text-[#1B281F] hover:bg-[#E8EFE9] transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <nav
              aria-label="قائمة الجوال"
              className="lg:hidden border-t border-[#CCD8CE] py-3 flex flex-col gap-1 text-sm font-medium text-[#1B281F]"
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
              {!isAuthenticated && (
                <>
                  <div className="border-t border-[#CCD8CE] my-1" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] text-[#1B281F]"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg bg-[#E8EFE9] text-[#1F7A46] font-bold"
                  >
                    ابدأ تجربة ١٤ يوماً مجاناً
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
