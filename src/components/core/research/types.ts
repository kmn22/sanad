import React from 'react'
import { BookOpen, Scale, Gavel, Shield, FileText } from 'lucide-react'

export interface ResearchItem {
  id: string
  title: string
  content: string
  type: string // statute | precedent | regulation | note | doctrine
  category: string // civil | commercial | labor | tax | corporate | procedural | general
  source?: string | null
  tags?: string | null
  notes?: string | null
  caseId?: string | null
  url?: string | null
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export const TYPE_CONFIG: Record<string, { labelAr: string; labelEn: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  statute: { labelAr: 'الأنظمة ولوائحها', labelEn: 'Statutes & Regulations', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', icon: BookOpen },
  regulation: { labelAr: 'الأوامر والتعاميم', labelEn: 'Orders & Circulars', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30', icon: Scale },
  precedent: { labelAr: 'السوابق القضائية', labelEn: 'Judicial Precedents', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: Gavel },
  doctrine: { labelAr: 'الكتب والأبحاث القانونية', labelEn: 'Legal Books & Research', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30', icon: Shield },
  note: { labelAr: 'مذكرة بحثية', labelEn: 'Research Note', color: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30', icon: FileText },
}

export const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  civil: { ar: 'معاملات مدنية', en: 'Civil' },
  commercial: { ar: 'تجاري وشركات', en: 'Commercial' },
  labor: { ar: 'عمل وتأمينات', en: 'Labor' },
  procedural: { ar: 'مرافعات وإثبات', en: 'Procedural' },
  corporate: { ar: 'حوكمة واستثمار', en: 'Corporate' },
  tax: { ar: 'زكاة وضريبة', en: 'Tax & ZATCA' },
  general: { ar: 'عام', en: 'General' },
}

export interface ResearchHubProps {
  onNavigateToDrafting?: (text: string) => void
}
