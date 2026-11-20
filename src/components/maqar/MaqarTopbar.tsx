'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import {
  Search,
  Languages,
  Sun,
  Moon,
  RefreshCw,
  Shield,
  Scale,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { NotificationCenter } from '@/components/core/NotificationCenter'
import { OrgWorkspaceSwitcher } from './OrgWorkspaceSwitcher'
import {
  MAQAR_ROLE_META,
  type MaqarOrgEntity,
  type MaqarRole,
} from './navigation-config'

interface MaqarTopbarProps {
  lang: 'ar' | 'en'
  onToggleLang: () => void
  activeRole: MaqarRole
  onChangeRole: (role: MaqarRole) => void
  activeOrg: MaqarOrgEntity
  activeWorkspaceId: string
  organizations: MaqarOrgEntity[]
  onSelectOrgWorkspace: (org: MaqarOrgEntity, workspaceId: string) => void
  onCreateWorkspace: (vertical: 'LEGAL' | 'STUDENT' | 'GENERAL') => void
  onOpenCommandSearch: () => void
  onRefresh?: () => void
  loading?: boolean
}

const ROLE_SWITCH_OPTIONS: Array<{
  role: MaqarRole
  shortLabel: { ar: string; en: string }
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    role: 'ENTERPRISE_CORP',
    shortLabel: { ar: 'الشركات والعقود', en: 'Enterprise' },
    icon: Shield,
  },
  {
    role: 'LAW_FIRM',
    shortLabel: { ar: 'مكتب محاماة', en: 'Law Firm' },
    icon: Scale,
  },
  {
    role: 'LAW_STUDENT',
    shortLabel: { ar: 'باحث وطالب', en: 'Academy' },
    icon: GraduationCap,
  },
]

export function MaqarTopbar({
  lang,
  onToggleLang,
  activeRole,
  onChangeRole,
  activeOrg,
  activeWorkspaceId,
  organizations,
  onSelectOrgWorkspace,
  onCreateWorkspace,
  onOpenCommandSearch,
  onRefresh,
  loading = false,
}: MaqarTopbarProps) {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userName = session?.user?.name || (lang === 'ar' ? 'حساب مقر' : 'Maqar Account')
  const userEmail = session?.user?.email || ''
  const initial = userName.trim().charAt(0) || 'م'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand + Org & Workspace Switcher */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F7A46] text-white font-black text-lg shadow-xs">
                <Scale className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="hidden xl:block leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-foreground font-heading">
                    {lang === 'ar' ? 'مقر' : 'MAQAR'}
                  </span>
                  <span className="rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase bg-accent text-accent-foreground border border-border">
                    MAQAR
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {lang === 'ar'
                    ? 'المقر الرقمي للعمليات القانونية والحوكمة'
                    : 'Unified Legal Ops & Corporate Governance'}
                </p>
              </div>
            </Link>

            <div className="h-6 w-[1px] bg-border hidden sm:block" />

            {/* Multi-Tenant Org & Workspace Switcher */}
            <OrgWorkspaceSwitcher
              lang={lang}
              activeOrg={activeOrg}
              activeWorkspaceId={activeWorkspaceId}
              organizations={organizations}
              onSelectOrgWorkspace={onSelectOrgWorkspace}
              onCreateWorkspace={onCreateWorkspace}
            />
          </div>

          {/* Center Universal Command Search Bar (Cmd+K) */}
          <button
            type="button"
            onClick={onOpenCommandSearch}
            className="hidden md:flex items-center justify-between gap-3 h-10 px-3.5 rounded-xl bg-muted/70 hover:bg-muted text-muted-foreground border border-border transition-all cursor-pointer w-64 lg:w-80 group"
            title={lang === 'ar' ? 'بحث شامل (⌘K)' : 'Universal Search (⌘K)'}
          >
            <span className="flex items-center gap-2 min-w-0">
              <Search className="h-4 w-4 text-primary shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-xs truncate">
                {lang === 'ar'
                  ? 'بحث في القضايا، العقود، الأنظمة والأبحاث...'
                  : 'Search Cases, Contracts, Statutes & Research...'}
              </span>
            </span>
            <kbd className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-card text-muted-foreground border border-border">
              ⌘K
            </kbd>
          </button>

          {/* Right Controls: Role Switcher, Language Toggle (AR/EN), Theme, Notifications, User Menu */}
          <div className="flex items-center gap-2">
            {/* Role-Adaptive Switcher Pill */}
            <div
              className="hidden lg:flex items-center rounded-xl bg-muted/80 p-1 border border-border"
              role="tablist"
              aria-label={lang === 'ar' ? 'تبديل مسار العمل' : 'Workspace View Switcher'}
            >
              {ROLE_SWITCH_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const active = activeRole === opt.role
                return (
                  <button
                    key={opt.role}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onChangeRole(opt.role)}
                    className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#1F7A46] text-white shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={MAQAR_ROLE_META[opt.role].label[lang]}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{opt.shortLabel[lang]}</span>
                  </button>
                )
              })}
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenCommandSearch}
              className="h-9 w-9 p-0 md:hidden rounded-xl border border-border"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-9 w-9 p-0 rounded-xl border border-border"
                title={lang === 'ar' ? 'تحديث البيانات' : 'Refresh'}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary' : ''}`} />
              </Button>
            )}

            {/* Arabic RTL / English LTR Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleLang}
              className="h-9 px-2.5 gap-1.5 rounded-xl border border-border font-semibold text-xs"
              title={lang === 'ar' ? 'Switch to English (LTR)' : 'التبديل إلى العربية (RTL)'}
            >
              <Languages className="h-3.5 w-3.5 text-primary" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </Button>

            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 p-0 rounded-xl border border-border"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-foreground" />
                )}
              </Button>
            )}

            <NotificationCenter />

            {/* User Profile & Sign Out Menu */}
            <DropdownMenu dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={lang === 'ar' ? 'قائمة الحساب' : 'Account menu'}
                  className="h-9 w-9 rounded-xl bg-accent text-accent-foreground border border-border grid place-items-center text-xs font-bold cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                <DropdownMenuLabel className="font-normal px-2.5 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-foreground truncate">{userName}</p>
                    {userEmail && (
                      <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/security" className="cursor-pointer gap-2 flex items-center rounded-xl px-2.5 py-2 text-xs">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{lang === 'ar' ? 'الأمان والتحقق الثنائي' : 'Security & MFA'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="cursor-pointer gap-2 flex items-center rounded-xl px-2.5 py-2 text-xs">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>{lang === 'ar' ? 'الباقات والاشتراك' : 'Plans & Billing'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer gap-2 rounded-xl px-2.5 py-2 text-xs"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
