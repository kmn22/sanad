'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Scale, ArrowLeft, Menu, X, LayoutDashboard, Building2, Briefcase, GraduationCap } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/solutions/enterprise', label: 'للشركات (CLM)', highlight: true },
  { href: '/solutions/firms', label: 'لمكاتب المحاماة' },
  { href: '/solutions/academy', label: 'للأكاديميين والطلاب' },
  { href: '/#checker', label: 'المصحح النظامي' },
  { href: '/pricing', label: 'الأسعار والباقات' },
  { href: '/security', label: 'الأمان والسيادة', subtle: true },
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
        <span>المقر الرقمي للعمليات القانونية والحوكمة</span>
        <span className="text-[#566A5C] hidden sm:inline">•</span>
        <Link href="/onboarding" className="text-[#1F7A46] font-bold hover:underline hidden sm:inline-flex items-center gap-1">
          ابدأ الآن <ArrowLeft className="w-3 h-3 inline" />
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
                    المقر الرقمي للعمليات القانونية والحوكمة
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#1B281F]">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-[#1F7A46] transition-colors ${
                    item.highlight ? 'font-bold text-[#1F7A46]' : item.subtle ? 'text-xs text-[#4A5D50]' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth Actions + Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="sm" className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>مساحة العمل</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-[#1B281F] hover:text-[#1F7A46] hover:bg-[#E8EFE9] font-medium text-xs sm:text-sm cursor-pointer">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/onboarding" data-testid="header-cta-onboarding">
                    <Button size="sm" className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer">
                      ابدأ الآن
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
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#566A5C]">حلول مقر حسب القطاع:</div>
              <Link
                href="/solutions/enterprise"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] hover:text-[#1F7A46] transition-colors flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-[#1F7A46]" />
                <span>الشركات والإدارات القانونية (CLM)</span>
              </Link>
              <Link
                href="/solutions/firms"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] hover:text-[#1F7A46] transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-[#1F7A46]" />
                <span>مكاتب وشركات المحاماة</span>
              </Link>
              <Link
                href="/solutions/academy"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] hover:text-[#1F7A46] transition-colors flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-[#1F7A46]" />
                <span>الأكاديميون وطلاب القانون</span>
              </Link>
              <div className="border-t border-[#CCD8CE] my-1" />
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] hover:text-[#1F7A46] transition-colors"
              >
                الأسعار والباقات
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] hover:text-[#1F7A46] transition-colors"
              >
                من نحن
              </Link>
              <Link
                href="/security"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#E8EFE9] hover:text-[#1F7A46] transition-colors text-xs text-[#4A5D50]"
              >
                الأمان والسيادة
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
