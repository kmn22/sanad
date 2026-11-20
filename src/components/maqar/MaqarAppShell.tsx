'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Shield, Scale, GraduationCap } from 'lucide-react'
import { useLang } from '@/lib/core/i18n'
import { MAQAR_DASHBOARD_PATHS } from '@/lib/auth/portals'
import {
  DEFAULT_MAQAR_ORGS,
  MAQAR_NAVIGATION,
  MAQAR_ROLE_META,
  type MaqarNavItem,
  type MaqarOrgEntity,
  type MaqarRole,
} from './navigation-config'
import { MaqarTopbar } from './MaqarTopbar'
import { MaqarAdaptiveSidebar } from './MaqarAdaptiveSidebar'
import {
  UniversalCommandSearch,
  type UniversalSearchResult,
} from './UniversalCommandSearch'
import type { WorkspaceCategory, WorkspaceVertical } from '@/lib/core/types'

export interface MaqarAppShellRenderState {
  role: MaqarRole
  workspaceCategory: WorkspaceCategory
  activeModule: MaqarNavItem
  activeOrg: MaqarOrgEntity
  activeWorkspaceId: string
  lang: 'ar' | 'en'
  openCommandSearch: () => void
  selectModuleById: (moduleId: string) => void
}

interface MaqarAppShellProps {
  initialRole?: MaqarRole
  /** When true (dedicated /dashboard/corporate|practice|academy routes), keeps role aligned with the route and navigates on role switch. */
  lockRole?: boolean
  loading?: boolean
  onRefresh?: () => void
  onModuleChange?: (item: MaqarNavItem, role: MaqarRole) => void
  children: (state: MaqarAppShellRenderState) => React.ReactNode
}

const ROLE_STORAGE_KEY = 'maqar.active_role'
const ORG_STORAGE_KEY = 'maqar.active_org'

export function MaqarAppShell({
  initialRole = 'ENTERPRISE_CORP',
  lockRole = false,
  loading = false,
  onRefresh,
  onModuleChange,
  children,
}: MaqarAppShellProps) {
  const router = useRouter()
  const { lang, toggle: toggleLang } = useLang()
  const [role, setRole] = useState<MaqarRole>(initialRole)
  const [organizations, setOrganizations] = useState<MaqarOrgEntity[]>(DEFAULT_MAQAR_ORGS)
  const [activeOrg, setActiveOrg] = useState<MaqarOrgEntity>(
    () => DEFAULT_MAQAR_ORGS.find((o) => o.type === initialRole) || DEFAULT_MAQAR_ORGS[0]
  )
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(
    () => activeOrg.workspaces[0]?.id || 'ws-ent-clm'
  )
  const [activeModuleId, setActiveModuleId] = useState<string>(
    () => MAQAR_NAVIGATION[initialRole][0].id
  )
  const [searchOpen, setSearchOpen] = useState(false)

  // Restore saved custom workspaces and (unless route-locked) saved role/org on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) as MaqarRole | null
    const savedOrgId = localStorage.getItem(ORG_STORAGE_KEY)
    const savedCustom = localStorage.getItem('maqar.custom_workspaces')
    let availableOrganizations = DEFAULT_MAQAR_ORGS
    if (savedCustom) {
      try {
        availableOrganizations = [
          ...DEFAULT_MAQAR_ORGS,
          ...(JSON.parse(savedCustom) as MaqarOrgEntity[]),
        ]
        setOrganizations(availableOrganizations)
      } catch {
        localStorage.removeItem('maqar.custom_workspaces')
      }
    }

    if (lockRole) {
      const routeOrg =
        availableOrganizations.find((o) => o.id === savedOrgId && o.type === initialRole) ||
        availableOrganizations.find((o) => o.type === initialRole) ||
        availableOrganizations[0]
      setRole(initialRole)
      setActiveOrg(routeOrg)
      setActiveWorkspaceId(routeOrg.workspaces[0]?.id || '')
      return
    }

    if (savedRole && MAQAR_NAVIGATION[savedRole]) {
      const matchedOrg =
        availableOrganizations.find((o) => o.id === savedOrgId) ||
        availableOrganizations.find((o) => o.type === savedRole) ||
        availableOrganizations[0]
      setRole(savedRole)
      setActiveOrg(matchedOrg)
      setActiveWorkspaceId(matchedOrg.workspaces[0]?.id || '')
      setActiveModuleId(MAQAR_NAVIGATION[savedRole][0].id)
    }
  }, [initialRole, lockRole])

  const handleCreateWorkspace = (vertical: WorkspaceVertical) => {
    const name = window.prompt(
      lang === 'ar' ? 'اسم المقر الجديد' : 'New workspace name',
      vertical === 'LEGAL' ? 'المقر القانوني' : vertical === 'STUDENT' ? 'المقر الأكاديمي' : 'المقر العام'
    )?.trim()
    if (!name) return

    const roleForVertical: Record<WorkspaceVertical, MaqarRole> = {
      LEGAL: 'LAW_FIRM',
      STUDENT: 'LAW_STUDENT',
      GENERAL: 'ENTERPRISE_CORP',
    }
    const nextRole = roleForVertical[vertical]
    const id = `custom-${vertical.toLowerCase()}-${Date.now()}`
    const created: MaqarOrgEntity = {
      id,
      name: { ar: name, en: name },
      slug: id,
      type: nextRole,
      vertical,
      tier: 'CUSTOM',
      workspaces: [{ id: `${id}-workspace`, name: { ar: name, en: name }, type: vertical }],
    }
    const nextOrganizations = [...organizations, created]
    setOrganizations(nextOrganizations)
    localStorage.setItem(
      'maqar.custom_workspaces',
      JSON.stringify(nextOrganizations.filter((org) => !DEFAULT_MAQAR_ORGS.some((base) => base.id === org.id)))
    )
    handleSelectOrgWorkspace(created, created.workspaces[0].id)
  }

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleRoleSwitch = (nextRole: MaqarRole) => {
    const matchingOrg =
      organizations.find((o) => o.type === nextRole) ||
      DEFAULT_MAQAR_ORGS.find((o) => o.type === nextRole) ||
      DEFAULT_MAQAR_ORGS[0]

    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_STORAGE_KEY, nextRole)
      localStorage.setItem(ORG_STORAGE_KEY, matchingOrg.id)
    }

    if (lockRole && nextRole !== role) {
      router.push(MAQAR_DASHBOARD_PATHS[nextRole])
      return
    }

    setRole(nextRole)
    setActiveOrg(matchingOrg)
    setActiveWorkspaceId(matchingOrg.workspaces[0]?.id || '')
    const firstModule = MAQAR_NAVIGATION[nextRole][0]
    setActiveModuleId(firstModule.id)
    onModuleChange?.(firstModule, nextRole)
  }

  const handleSelectOrgWorkspace = (org: MaqarOrgEntity, workspaceId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_STORAGE_KEY, org.type)
      localStorage.setItem(ORG_STORAGE_KEY, org.id)
    }

    if (lockRole && org.type !== role) {
      router.push(MAQAR_DASHBOARD_PATHS[org.type])
      return
    }

    setActiveOrg(org)
    setActiveWorkspaceId(workspaceId)
    if (org.type !== role) {
      setRole(org.type)
      const firstModule = MAQAR_NAVIGATION[org.type][0]
      setActiveModuleId(firstModule.id)
      onModuleChange?.(firstModule, org.type)
    }
  }

  const handleSelectModule = (item: MaqarNavItem) => {
    setActiveModuleId(item.id)
    onModuleChange?.(item, role)
  }

  const selectModuleById = (moduleId: string, _result?: UniversalSearchResult) => {
    for (const [rKey, items] of Object.entries(MAQAR_NAVIGATION) as Array<
      [MaqarRole, MaqarNavItem[]]
    >) {
      const found = items.find((i) => i.id === moduleId)
      if (found) {
        if (rKey !== role) {
          handleRoleSwitch(rKey)
          if (lockRole) return
        }
        setActiveModuleId(found.id)
        onModuleChange?.(found, rKey)
        return
      }
    }
  }

  const currentItems = MAQAR_NAVIGATION[role]
  const activeModule =
    currentItems.find((item) => item.id === activeModuleId) || currentItems[0]

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden selection:bg-[#1F7A46] selection:text-white"
    >
      {/* Subtle Maqar Institutional Ambient Accent */}
      <div className="pointer-events-none fixed top-[-15%] start-[-10%] h-[420px] w-[420px] rounded-full bg-[#1F7A46]/[0.05] dark:bg-emerald-500/[0.08] blur-[130px]" />
      <div className="pointer-events-none fixed bottom-[-15%] end-[-10%] h-[420px] w-[420px] rounded-full bg-[#34543F]/[0.04] dark:bg-emerald-700/[0.07] blur-[130px]" />

      {/* Topbar */}
      <MaqarTopbar
        lang={lang}
        onToggleLang={toggleLang}
        activeRole={role}
        onChangeRole={handleRoleSwitch}
        activeOrg={activeOrg}
        activeWorkspaceId={activeWorkspaceId}
        organizations={organizations}
        onSelectOrgWorkspace={handleSelectOrgWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        onOpenCommandSearch={() => setSearchOpen(true)}
        onRefresh={onRefresh}
        loading={loading}
      />

      {/* Mobile Role & Navigation Bar */}
      <div className="lg:hidden border-b border-border bg-card/90 backdrop-blur-md sticky top-16 z-30">
        <div className="flex items-center gap-1.5 px-4 pt-2 pb-1.5 overflow-x-auto">
          {(
            [
              { r: 'ENTERPRISE_CORP', icon: Shield, ar: 'الشركات', en: 'Enterprise' },
              { r: 'LAW_FIRM', icon: Scale, ar: 'مكتب محاماة', en: 'Law Firm' },
              { r: 'LAW_STUDENT', icon: GraduationCap, ar: 'باحث وطالب', en: 'Academy' },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon
            const isCurrent = role === tab.r
            return (
              <button
                key={tab.r}
                type="button"
                onClick={() => handleRoleSwitch(tab.r)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1F7A46] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{lang === 'ar' ? tab.ar : tab.en}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto">
          {currentItems.map((item) => {
            const Icon = item.icon
            const active = item.id === activeModule.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectModule(item)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-accent text-accent-foreground border border-primary/25'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label[lang]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-1 mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <MaqarAdaptiveSidebar
          role={role}
          activeModuleId={activeModule.id}
          onSelectModule={handleSelectModule}
          lang={lang}
          onOpenCommandSearch={() => setSearchOpen(true)}
        />

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${activeModule.id}-${activeWorkspaceId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              {children({
                role,
                workspaceCategory: MAQAR_ROLE_META[role].category,
                activeModule,
                activeOrg,
                activeWorkspaceId,
                lang,
                openCommandSearch: () => setSearchOpen(true),
                selectModuleById,
              })}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Enterprise Footer */}
      <footer className="mt-auto border-t border-border bg-card/70 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p className="font-medium">
            {lang === 'ar'
              ? `مقر (MAQAR) — ${MAQAR_ROLE_META[role].label.ar}`
              : `Maqar — ${MAQAR_ROLE_META[role].label.en}`}
          </p>
          <p className="flex items-center gap-2 text-[11px]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              {activeOrg.name[lang]} •{' '}
              {lang === 'ar' ? 'بيئة عمل معزولة ومشفّرة' : 'Isolated & encrypted workspace'}
            </span>
          </p>
        </div>
      </footer>

      {/* Universal Cmd+K Modal */}
      <UniversalCommandSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        lang={lang}
        activeRole={role}
        onSelectModule={selectModuleById}
      />
    </div>
  )
}
