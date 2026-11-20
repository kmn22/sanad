'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Gavel,
  FileCheck2,
  Scale,
  FlaskConical,
  ArrowUpRight,
  CornerDownLeft,
  Sparkles,
} from 'lucide-react'
import { type MaqarRole } from './navigation-config'

export type SearchCategory = 'ALL' | 'CASES' | 'CONTRACTS' | 'STATUTES' | 'RESEARCH'

export interface UniversalSearchResult {
  id: string
  category: Exclude<SearchCategory, 'ALL'>
  title: { ar: string; en: string }
  reference: string
  meta: { ar: string; en: string }
  targetModuleId: string
}

interface UniversalCommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lang: 'ar' | 'en'
  activeRole: MaqarRole
  onSelectModule: (moduleId: string, item?: UniversalSearchResult) => void
}

const CORPUS_ITEMS: UniversalSearchResult[] = [
  {
    id: 'case-4491',
    category: 'CASES',
    title: {
      ar: 'دعوى تعويض إخلال التزامات توريد تقنية — المحكمة التجارية بالرياض',
      en: 'Tech Supply Breach Damages Claim — Riyadh Commercial Court',
    },
    reference: 'COM-1448-9921',
    meta: { ar: 'قضية تجارية • جلسة المرافعة القادمة: 14 نوفمبر', en: 'Commercial Litigation • Next Session: Nov 14' },
    targetModuleId: 'cases-litigations',
  },
  {
    id: 'case-8820',
    category: 'CASES',
    title: {
      ar: 'منازعة تحكيم عقد مقاولات البنية التحتية (SCCA)',
      en: 'Infrastructure EPC Arbitration Dispute (SCCA)',
    },
    reference: 'ARB-2026-410',
    meta: { ar: 'تحكيم مؤسسي • مرحلة تبادل المذكرات', en: 'Institutional Arbitration • Briefs Stage' },
    targetModuleId: 'cases-litigations',
  },
  {
    id: 'clm-109',
    category: 'CONTRACTS',
    title: {
      ar: 'اتفاقية مستوى الخدمة والحوسبة السحابية السيادية (MSA)',
      en: 'Sovereign Cloud Hosting Master Services Agreement (MSA)',
    },
    reference: 'CLM-MSA-2026-08',
    meta: { ar: 'خزينة العقود • مستوى المخاطر: منخفض • سارٍ', en: 'Contract Vault • Risk: LOW • Active' },
    targetModuleId: 'contract-vault',
  },
  {
    id: 'clm-204',
    category: 'CONTRACTS',
    title: {
      ar: 'اتفاقية معالجة البيانات الشخصية ومشاركة المعلومات (DPA)',
      en: 'Personal Data Processing & Cross-Border Addendum (DPA)',
    },
    reference: 'CLM-DPA-2026-19',
    meta: { ar: 'خزينة العقود • قيد المراجعة القانونية (PDPL)', en: 'Contract Vault • Legal Review (PDPL)' },
    targetModuleId: 'contract-vault',
  },
  {
    id: 'stat-179',
    category: 'STATUTES',
    title: {
      ar: 'نظام المعاملات المدنية — المادة (179): تعديل الشرط الجزائي قضاءً',
      en: 'Civil Transactions Law — Art. 179: Judicial Adjustment of Liquidated Damages',
    },
    reference: 'مرسوم ملكي م/191',
    meta: { ar: 'الأنظمة والتشريعات • التزامات وعقود', en: 'Statutes & Regulations • Obligations & Contracts' },
    targetModuleId: 'precedent-bank',
  },
  {
    id: 'stat-pdpl',
    category: 'STATUTES',
    title: {
      ar: 'نظام حماية البيانات الشخصية (PDPL) — ضوابط نقل البيانات خارج المملكة',
      en: 'Personal Data Protection Law (PDPL) — Cross-Border Transfer Safeguards',
    },
    reference: 'سدايا • م/19',
    meta: { ar: 'رادار الامتثال • حوكمة البيانات والأمن السيبراني', en: 'Compliance Radar • Data Governance & Privacy' },
    targetModuleId: 'compliance-radar',
  },
  {
    id: 'res-301',
    category: 'RESEARCH',
    title: {
      ar: 'ورقة بحثية: المسؤولية التقصيرية للأنظمة الذكية في العقود التجارية',
      en: 'Research Paper: Tortious Liability of Autonomous AI Agents in Commercial CLM',
    },
    reference: 'RES-2026-AI',
    meta: { ar: 'معمل الأبحاث القانونية • محكّمة', en: 'Legal Research Lab • Peer Reviewed' },
    targetModuleId: 'research-lab',
  },
  {
    id: 'res-309',
    category: 'RESEARCH',
    title: {
      ar: 'مبدأ قضائي: حجية المراسلات الرقمية والبريد الإلكتروني في إثبات التعاقد التجاري',
      en: 'Judicial Principle: Evidentiary Weight of Digital Correspondence in Commercial Contracts',
    },
    reference: 'المحكمة العليا — مبدأ 44/ت',
    meta: { ar: 'بنك السوابق القضائية • نظام الإثبات', en: 'Precedent Bank • Law of Evidence' },
    targetModuleId: 'precedent-bank',
  },
]

const CATEGORY_TABS: Array<{
  key: SearchCategory
  label: { ar: string; en: string }
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'ALL', label: { ar: 'الكل', en: 'All' }, icon: Sparkles },
  { key: 'CASES', label: { ar: 'القضايا', en: 'Cases' }, icon: Gavel },
  { key: 'CONTRACTS', label: { ar: 'العقود', en: 'Contracts' }, icon: FileCheck2 },
  { key: 'STATUTES', label: { ar: 'الأنظمة واللوائح', en: 'Statutes' }, icon: Scale },
  { key: 'RESEARCH', label: { ar: 'الأبحاث والسوابق', en: 'Research' }, icon: FlaskConical },
]

export function UniversalCommandSearch({
  open,
  onOpenChange,
  lang,
  onSelectModule,
}: UniversalCommandSearchProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SearchCategory>('ALL')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [apiResults, setApiResults] = useState<UniversalSearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setCategory('ALL')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  // Also query live `/api/search` when user types >= 2 characters
  useEffect(() => {
    if (query.trim().length < 2) {
      setApiResults([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) return
        const json = await res.json()
        if (cancelled || !Array.isArray(json.results)) return
        const mapped: UniversalSearchResult[] = json.results.map((r: any) => ({
          id: `live-${r.id}`,
          category:
            r.type === 'case'
              ? 'CASES'
              : r.type === 'document'
              ? 'CONTRACTS'
              : r.type === 'compliance'
              ? 'STATUTES'
              : 'RESEARCH',
          title: { ar: r.title, en: r.title },
          reference: r.type?.toUpperCase() || 'RECORD',
          meta: { ar: r.subtitle || 'سجل مساحة العمل', en: r.subtitle || 'Workspace Record' },
          targetModuleId:
            r.type === 'case'
              ? 'cases-litigations'
              : r.type === 'document'
              ? 'contract-vault'
              : 'research-lab',
        }))
        setApiResults(mapped)
      } catch {
        // fallback to indexed corpus
      }
    }, 180)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    const combined = [...apiResults, ...CORPUS_ITEMS]
    return combined.filter((item) => {
      if (category !== 'ALL' && item.category !== category) return false
      if (!q) return true
      return (
        item.title.ar.toLowerCase().includes(q) ||
        item.title.en.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q) ||
        item.meta.ar.toLowerCase().includes(q) ||
        item.meta.en.toLowerCase().includes(q)
      )
    })
  }, [query, category, apiResults])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, category])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(filteredItems.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filteredItems[selectedIndex]
      if (selected) {
        onSelectModule(selected.targetModuleId, selected)
        onOpenChange(false)
      }
    }
  }

  const getCategoryIcon = (cat: UniversalSearchResult['category']) => {
    switch (cat) {
      case 'CASES':
        return Gavel
      case 'CONTRACTS':
        return FileCheck2
      case 'STATUTES':
        return Scale
      case 'RESEARCH':
        return FlaskConical
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        onKeyDown={handleKeyDown}
        className="max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-2xl shadow-2xl"
      >
        <DialogTitle className="sr-only">
          {lang === 'ar' ? 'البحث الموحد في مقر' : 'Maqar Universal Search'}
        </DialogTitle>

        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="h-4 w-4 text-primary shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'ابحث فورياً في القضايا، العقود، الأنظمة، والأوراق البحثية...'
                : 'Instant lookup across Cases, Contracts, Statutes & Research papers...'
            }
            className="border-0 bg-transparent focus-visible:ring-0 px-0 h-7 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/40 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon
            const active = category === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategory(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#1F7A46] text-white border border-[#1F7A46] shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label[lang]}</span>
              </button>
            )
          })}
        </div>

        {/* Results List */}
        <ScrollArea className="h-[360px]">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center text-slate-400 dark:text-slate-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">
                {lang === 'ar'
                  ? 'لا توجد نتائج مطابقة في السجل الموحد'
                  : 'No matching records found in the unified index'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredItems.map((item, idx) => {
                const Icon = getCategoryIcon(item.category)
                const isSelected = idx === selectedIndex
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      onSelectModule(item.targetModuleId, item)
                      onOpenChange(false)
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent/80 border border-primary/25'
                        : 'border border-transparent hover:bg-muted/70'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent border border-border text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                            {item.title[lang]}
                          </p>
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground border border-border">
                            {item.reference}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {item.meta[lang]}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-primary translate-x-0.5 -translate-y-0.5'
                          : 'text-muted-foreground/40'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[10px]">
                ↑↓
              </kbd>
              {lang === 'ar' ? 'للتنقل' : 'Navigate'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[10px]">
                <CornerDownLeft className="h-2.5 w-2.5 inline" />
              </kbd>
              {lang === 'ar' ? 'فتح السجل' : 'Open Record'}
            </span>
          </div>
          <span className="font-mono text-[10px]">
            {filteredItems.length} {lang === 'ar' ? 'سجل مفهرس' : 'indexed items'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
