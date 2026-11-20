'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles } from 'lucide-react'
import {
  MAQAR_NAVIGATION,
  MAQAR_ROLE_META,
  type MaqarNavItem,
  type MaqarRole,
} from './navigation-config'

interface MaqarAdaptiveSidebarProps {
  role: MaqarRole
  activeModuleId: string
  onSelectModule: (item: MaqarNavItem) => void
  lang: 'ar' | 'en'
  onOpenCommandSearch: () => void
}

function getBadgeStyle(tone: 'navy' | 'emerald' | 'amber' | 'rose') {
  switch (tone) {
    case 'rose':
      return 'bg-rose-500/12 text-rose-700 dark:text-rose-400 border-rose-500/25'
    case 'amber':
      return 'bg-amber-500/12 text-amber-800 dark:text-amber-400 border-amber-500/25'
    case 'emerald':
    case 'navy':
    default:
      return 'bg-accent text-accent-foreground border-border'
  }
}

export function MaqarAdaptiveSidebar({
  role,
  activeModuleId,
  onSelectModule,
  lang,
  onOpenCommandSearch,
}: MaqarAdaptiveSidebarProps) {
  const navItems = MAQAR_NAVIGATION[role]
  const roleMeta = MAQAR_ROLE_META[role]

  const roleBadgeLabel =
    role === 'ENTERPRISE_CORP'
      ? lang === 'ar'
        ? 'الشركات والحوكمة'
        : 'Enterprise Legal'
      : role === 'LAW_FIRM'
        ? lang === 'ar'
          ? 'مكاتب المحاماة'
          : 'Law Practice'
        : lang === 'ar'
          ? 'الباحث والأكاديمية'
          : 'Legal Academy'

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 select-none">
      <div className="sticky top-20 flex flex-col gap-5 rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-3.5 shadow-xs">
        {/* Role Context Header */}
        <div className="px-2.5 pt-1 pb-2.5 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-primary">
              {roleBadgeLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {lang === 'ar' ? 'بيئة محمية' : 'Protected'}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold text-foreground">
            {roleMeta.label[lang]}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
            {roleMeta.tagline[lang]}
          </p>
        </div>

        {/* Role-Adaptive Navigation Items */}
        <nav className="space-y-1.5" aria-label="Maqar Role Navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeModuleId === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectModule(item)}
                className={`relative w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-start transition-colors cursor-pointer group ${isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="maqar-sidebar-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-accent/80 border border-primary/25 shadow-2xs"
                  />
                )}

                <div
                  className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all ${isActive
                    ? 'bg-[#1F7A46] text-white border-[#1F7A46] shadow-2xs'
                    : 'bg-muted/80 text-muted-foreground border-border group-hover:scale-105'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="relative z-10 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold truncate">
                      {item.label[lang]}
                    </span>
                    {item.badge && (
                      <span
                        className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${getBadgeStyle(
                          item.badge.tone
                        )}`}
                      >
                        {item.badge[lang]}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {item.subtitle[lang]}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Sovereign Security & Quick Search Footer */}
        <div className="pt-3 border-t border-border">
          <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {lang === 'ar' ? 'عزل وحماية بيانات المنشأة' : 'Isolated Organization Vault'}
              </span>
              <button
                type="button"
                onClick={onOpenCommandSearch}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border text-muted-foreground hover:border-primary/40 cursor-pointer"
              >
                ⌘K
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'المقر الرقمي للعمليات القانونية والحوكمة'
                  : 'Unified Headquarters for Legal Ops & Governance'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
