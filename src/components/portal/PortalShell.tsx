'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Briefcase, Building2, LogOut, Languages, Moon, RefreshCw, Search, ShieldCheck, Sun, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { NotificationCenter } from '@/components/sanad/NotificationCenter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLang } from '@/lib/sanad/i18n'
import { canAccessPortal, PORTAL_PATHS } from '@/lib/auth/portals'
import { PORTAL_THEMES, type Bilingual, type PortalTheme } from './theme'
import type { PortalId } from '@/lib/auth/portals'

export type NavBadge = { text: string; tone?: 'rose' | 'amber' | 'accent' | 'muted' }

export type NavItem = {
  href: string
  label: Bilingual
  icon: React.ComponentType<{ className?: string }>
  badge?: NavBadge | null
  /** Match only the exact path (used for portal home items). */
  exact?: boolean
}

export type NavSection = { title: Bilingual; items: NavItem[] }

const ROLE_LABELS: Record<string, Bilingual> = {
  admin: { ar: 'مدير النظام', en: 'Administrator' },
  workspace_owner: { ar: 'مالك المكتب', en: 'Firm owner' },
  lawyer: { ar: 'محامٍ', en: 'Lawyer' },
  staff: { ar: 'فريق المكتب', en: 'Staff' },
  auditor: { ar: 'مدقق (قراءة فقط)', en: 'Auditor (read-only)' },
  student: { ar: 'طالب قانون', en: 'Law student' },
  client: { ar: 'موكّل', en: 'Client' },
}

export function useBilingual() {
  const { lang } = useLang()
  return (l: Bilingual) => (lang === 'ar' ? l.ar : l.en)
}

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function badgeClass(theme: PortalTheme, tone: NavBadge['tone']) {
  switch (tone) {
    case 'rose':
      return 'bg-rose-500/15 text-rose-800 dark:text-rose-400'
    case 'amber':
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-400'
    case 'muted':
      return 'bg-muted text-muted-foreground'
    default:
      return `${theme.chip} border`
  }
}

interface PortalShellProps {
  portal: PortalId
  sections: NavSection[]
  children: React.ReactNode
  onRefresh?: () => void
  refreshing?: boolean
  onSearch?: () => void
  sidebarFooter?: React.ReactNode
}

export function PortalShell({ portal, sections, children, onRefresh, refreshing, onSearch, sidebarFooter }: PortalShellProps) {
  const theme = PORTAL_THEMES[portal]
  const pathname = usePathname() || ''
  const { data: session } = useSession()
  const { lang, toggle: toggleLang } = useLang()
  const { theme: colorMode, setTheme } = useTheme()
  const L = useBilingual()
  const [mounted, setMounted] = useState(false)
  const [clock, setClock] = useState('')
  const [workspaceMemberships, setWorkspaceMemberships] = useState<Array<{ workspaceId: string; workspace: { name: string }; role: string }>>([])

  const role = (session?.user as { role?: string } | undefined)?.role
  const userName = session?.user?.name || L(ROLE_LABELS[role || ''] || theme.name)
  const userEmail = session?.user?.email || ''
  const initial = userName.trim().charAt(0) || 'س'

  useEffect(() => {
    setMounted(true)
    const locale = lang === 'ar' ? 'ar-SA' : 'en-GB'
    const tick = () => {
      const now = new Date()
      setClock(`${now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} • ${now.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [lang])

  useEffect(() => {
    if (!session?.user || role === 'client') return
    fetch('/api/memberships?all=1').then(async (response) => {
      if (response.ok) setWorkspaceMemberships(await response.json())
    })
  }, [session?.user, role])

  useEffect(() => {
    if (!onSearch) return
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearch()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onSearch])

  // Owners/admins can hop between their firm console and personal workspace.
  const switchTargets = (['firm', 'lawyer'] as PortalId[]).filter((p) => p !== portal && canAccessPortal(role, p))
  const allItems = sections.flatMap((s) => s.items)

  async function switchWorkspace(workspaceId: string) {
    const response = await fetch('/api/memberships/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId }) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) return
    if (result.requiresSignIn) await signOut({ callbackUrl: '/login?workspaceChanged=1' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`absolute top-[-10%] start-[-10%] w-[40%] h-[40%] ${theme.glowA} rounded-full blur-[120px] pointer-events-none`} />
      <div className={`absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] ${theme.glowB} rounded-full blur-[120px] pointer-events-none`} />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <SonnerToaster position="top-right" richColors closeButton />

        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 gap-3">
              <Link href={PORTAL_PATHS[portal]} className="flex items-center gap-3 min-w-0" id="portal-home-link">
                <div className={`relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br ${theme.logo} text-white font-bold text-base shadow-sm ring-1`}>
                  <span className="translate-y-[-1px]">س</span>
                  <span className="absolute -bottom-0.5 -end-0.5 h-2 w-2 rounded-full bg-white/90 ring-2 ring-background" />
                </div>
                <div className="leading-tight text-start min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold tracking-tight truncate">{L(theme.name)}</p>
                    <span className={`text-[9px] uppercase px-1.5 rounded-full font-semibold border ${theme.chip}`}>{theme.badge}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground hidden sm:block truncate">{L(theme.tagline)}</p>
                </div>
              </Link>

              {onSearch && (
                <button
                  id="portal-search"
                  onClick={onSearch}
                  className="hidden md:flex items-center gap-2 h-8 px-3 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs border border-border/80 transition-all cursor-pointer w-48 lg:w-64 justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Search className={`h-3.5 w-3.5 ${theme.text} transition-transform group-hover:scale-110`} />
                    {lang === 'ar' ? 'بحث سريع...' : 'Quick search...'}
                  </span>
                  <kbd className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border/80 font-mono">⌘K</kbd>
                </button>
              )}

              <div className="flex items-center gap-1.5">
                <span className="hidden lg:inline text-xs text-muted-foreground tabular-nums">{mounted ? clock : null}</span>

                {switchTargets.map((p) => {
                  const Icon = p === 'firm' ? Building2 : Briefcase
                  return (
                    <Link
                      key={p}
                      id={`portal-switch-${p}`}
                      href={PORTAL_PATHS[p]}
                      className={`hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-xs font-semibold border transition-colors hover:opacity-90 ${PORTAL_THEMES[p].chip}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {L(PORTAL_THEMES[p].name)}
                    </Link>
                  )
                })}

                {onSearch && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:hidden" onClick={onSearch} aria-label="Search">
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                )}

                {portal !== 'client' && <NotificationCenter />}

                {onRefresh && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onRefresh} aria-label="Refresh" id="portal-refresh">
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? `animate-spin ${theme.text}` : ''}`} />
                  </Button>
                )}

                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={toggleLang} id="portal-lang">
                  <Languages className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{lang === 'ar' ? 'EN' : 'ع'}</span>
                </Button>

                {mounted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    id="portal-theme"
                    onClick={() => setTheme(colorMode === 'dark' ? 'light' : 'dark')}
                    aria-label="Theme"
                  >
                    {colorMode === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
                  </Button>
                )}

                <DropdownMenu dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <DropdownMenuTrigger asChild>
                    <button
                      id="portal-user-menu"
                      className={`relative h-8 w-8 rounded-full grid place-items-center text-xs font-bold border cursor-pointer transition-all focus:outline-none ${theme.chip}`}
                    >
                      {initial}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 glass-panel">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                        {role && (
                          <span className={`mt-1.5 w-fit text-[10px] px-2 py-0.5 rounded-full font-medium border ${theme.chip}`}>
                            {L(ROLE_LABELS[role] || { ar: role, en: role })}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {workspaceMemberships.length > 1 && <>
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">{lang === 'ar' ? 'مساحات العمل' : 'Workspaces'}</DropdownMenuLabel>
                      {workspaceMemberships.map((membership) => <DropdownMenuItem key={membership.workspaceId} onClick={() => switchWorkspace(membership.workspaceId)} className="cursor-pointer gap-2"><Building2 className="h-4 w-4" /><span className="truncate">{membership.workspace.name}</span>{membership.workspaceId === (session?.user as { workspaceId?: string } | undefined)?.workspaceId && <span className="ms-auto h-2 w-2 rounded-full bg-emerald-500" />}</DropdownMenuItem>)}
                      <DropdownMenuSeparator />
                    </>}
                    {switchTargets.map((p) => (
                      <DropdownMenuItem key={p} asChild>
                        <Link href={PORTAL_PATHS[p]} className="cursor-pointer gap-2 flex items-center">
                          {p === 'firm' ? <Building2 className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                          {L(PORTAL_THEMES[p].name)}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Link href="/settings/security" className="cursor-pointer gap-2 flex items-center">
                        <ShieldCheck className="h-4 w-4" />
                        {lang === 'ar' ? 'الأمان والتحقق الثنائي' : 'Security & MFA'}
                      </Link>
                    </DropdownMenuItem>
                    {portal !== 'client' && (
                      <DropdownMenuItem asChild>
                        <Link href="/pricing" className="cursor-pointer gap-2 flex items-center">
                          <CreditCard className="h-4 w-4" />
                          {lang === 'ar' ? 'الباقات والأسعار' : 'Plans & pricing'}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      id="portal-signout"
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      {lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* ── Mobile nav ─────────────────────────────────────── */}
        <nav className="lg:hidden border-b border-border/80 bg-background/90 backdrop-blur-md sticky top-14 z-30" aria-label="Portal navigation">
          <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scroll-thin">
            {allItems.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    active ? `${theme.activePill} font-semibold shadow-xs` : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {L(item.label)}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="flex flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <nav className="sticky top-20 space-y-5 pb-6" aria-label="Portal sections">
              {sections.map((section) => (
                <div key={section.title.en} className="space-y-1">
                  <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{L(section.title)}</p>
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(pathname, item)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        id={`nav-${item.href.replaceAll('/', '-').slice(1)}`}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                          active ? `${theme.active} font-semibold shadow-2xs` : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span className="truncate">{L(item.label)}</span>
                        {item.badge && (
                          <span className={`ms-auto text-[10px] rounded-full px-2 py-0.5 font-medium whitespace-nowrap ${badgeClass(theme, item.badge.tone)}`}>
                            {item.badge.text}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ))}
              {sidebarFooter}
            </nav>
          </aside>

          <main className="flex-1 min-w-0 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">{children}</main>
        </div>

        <footer className="mt-auto border-t border-border bg-background/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>{lang === 'ar' ? `سند — ${theme.name.ar}` : `Sanad — ${theme.name.en}`}</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {lang === 'ar' ? 'اتصال آمن ومشفّر' : 'Secure, encrypted session'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

/** Shared page header used at the top of every portal page. */
export function PortalPageHeader({
  portal,
  title,
  subtitle,
  actions,
}: {
  portal: PortalId
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  const theme = PORTAL_THEMES[portal]
  return (
    <div className={`relative mb-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-l ${theme.hero} p-5 sm:p-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/** KPI tile used across portal dashboards. */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'good' | 'warn' | 'bad'
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'warn'
        ? 'text-amber-600 dark:text-amber-400'
        : tone === 'bad'
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-foreground'
  return (
    <div className="group rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-border">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground transition-transform group-hover:scale-110" />}
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
