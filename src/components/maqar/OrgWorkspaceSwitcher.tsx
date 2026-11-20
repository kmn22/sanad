'use client'

import React from 'react'
import { Building2, Check, ChevronsUpDown, Layers, Shield, Scale, GraduationCap } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MAQAR_ROLE_META,
  type MaqarOrgEntity,
  type MaqarRole,
} from './navigation-config'
import type { WorkspaceVertical } from '@/lib/core/types'

interface OrgWorkspaceSwitcherProps {
  lang: 'ar' | 'en'
  activeOrg: MaqarOrgEntity
  activeWorkspaceId: string
  organizations: MaqarOrgEntity[]
  onSelectOrgWorkspace: (org: MaqarOrgEntity, workspaceId: string) => void
  onCreateWorkspace: (vertical: WorkspaceVertical) => void
}

const ORG_TYPE_ICON: Record<MaqarRole, React.ComponentType<{ className?: string }>> = {
  ENTERPRISE_CORP: Shield,
  LAW_FIRM: Scale,
  LAW_STUDENT: GraduationCap,
}

const VERTICAL_LABELS: Record<WorkspaceVertical, { ar: string; en: string }> = {
  LEGAL: { ar: 'المقر القانوني', en: 'Legal Workspace' },
  STUDENT: { ar: 'المقر الأكاديمي', en: 'Academic Workspace' },
  GENERAL: { ar: 'المقر العام', en: 'General Virtual Office' },
}

export function OrgWorkspaceSwitcher({
  lang,
  activeOrg,
  activeWorkspaceId,
  organizations,
  onSelectOrgWorkspace,
  onCreateWorkspace,
}: OrgWorkspaceSwitcherProps) {
  const activeWorkspace =
    activeOrg.workspaces.find((w) => w.id === activeWorkspaceId) || activeOrg.workspaces[0]
  const ActiveIcon = ORG_TYPE_ICON[activeOrg.type] || Building2

  return (
    <DropdownMenu dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2.5 h-10 px-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all shadow-2xs cursor-pointer text-start max-w-[270px] sm:max-w-[320px]"
          title={lang === 'ar' ? 'تبديل المقر أو مساحة العمل' : 'Switch Maqar Workspace'}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1F7A46] text-white shadow-2xs">
            <ActiveIcon className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-bold text-foreground">
                {activeOrg.name[lang]}
              </span>
              <span className="hidden sm:inline-block rounded px-1 py-0.2 text-[9px] font-semibold bg-accent text-accent-foreground border border-border">
                {VERTICAL_LABELS[activeOrg.vertical][lang]}
              </span>
            </div>
            <p className="truncate text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Layers className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
              <span>{activeWorkspace?.name[lang]}</span>
            </p>
          </div>

          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-80 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-1.5 shadow-2xl"
      >
        <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {lang === 'ar'
            ? 'تبديل المقر (Workspace Switcher)'
            : 'Switch Maqar Workspace'}
        </DropdownMenuLabel>

        {organizations.map((org, idx) => {
          const OrgIcon = ORG_TYPE_ICON[org.type] || Building2
          const isCurrentOrg = org.id === activeOrg.id

          return (
            <React.Fragment key={org.id}>
              {idx > 0 && <DropdownMenuSeparator className="my-1 bg-slate-200/70 dark:bg-slate-800/80" />}
              <div className="px-2.5 py-1 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <OrgIcon className="h-3.5 w-3.5 text-slate-500 dark:text-sky-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {org.name[lang]}
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                  {VERTICAL_LABELS[org.vertical][lang]}
                </span>
              </div>

              {org.workspaces.map((ws) => {
                const selected = isCurrentOrg && ws.id === activeWorkspace?.id
                return (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => onSelectOrgWorkspace(org, ws.id)}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors ${
                      selected
                        ? 'bg-[#1F7A46] text-white font-semibold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="h-3.5 w-3.5 shrink-0 opacity-75" />
                      <span className="truncate">{ws.name[lang]}</span>
                    </div>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                  </DropdownMenuItem>
                )
              })}
            </React.Fragment>
          )
        })}
        <DropdownMenuSeparator className="my-1 bg-slate-200/70 dark:bg-slate-800/80" />
        <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400">
          {lang === 'ar' ? 'إنشاء مقر جديد' : 'Create a workspace'}
        </DropdownMenuLabel>
        {(['LEGAL', 'STUDENT', 'GENERAL'] as const).map((vertical) => (
          <DropdownMenuItem
            key={vertical}
            onClick={() => onCreateWorkspace(vertical)}
            className="rounded-xl px-3 py-2 text-xs cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {VERTICAL_LABELS[vertical][lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
