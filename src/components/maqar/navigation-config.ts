'use client'

import React from 'react'
import {
  FileCheck2,
  Radar,
  Landmark,
  CheckSquare,
  Building2,
  Gavel,
  CalendarClock,
  Receipt,
  FileSignature,
  UsersRound,
  FlaskConical,
  Scale,
  PenTool,
  GraduationCap,
  CalendarDays,
  FileText,
  MessageCircle,
  Video,
} from 'lucide-react'
import type { WorkspaceCategory, WorkspaceVertical } from '@/lib/core/types'

export type MaqarRole = 'ENTERPRISE_CORP' | 'LAW_FIRM' | 'LAW_STUDENT'

export interface MaqarNavItem {
  id: string
  label: { ar: string; en: string }
  subtitle: { ar: string; en: string }
  icon: React.ComponentType<{ className?: string }>
  badge?: {
    ar: string
    en: string
    tone: 'navy' | 'emerald' | 'amber' | 'rose'
  }
  legacyViewKey?: string
}

export interface MaqarOrgEntity {
  id: string
  name: { ar: string; en: string }
  slug: string
  type: MaqarRole
  vertical: WorkspaceVertical
  tier: string
  workspaces: Array<{
    id: string
    name: { ar: string; en: string }
    type: string
  }>
}

export const MAQAR_ROLE_META: Record<
  MaqarRole,
  {
    category: WorkspaceCategory
    label: { ar: string; en: string }
    badge: string
    tagline: { ar: string; en: string }
  }
> = {
  ENTERPRISE_CORP: {
    category: 'GENERAL',
    label: { ar: 'المقر العام والمكاتب الافتراضية', en: 'General Virtual Office' },
    badge: 'ENTERPRISE',
    tagline: {
      ar: 'الإدارة القانونية الداخلية، العقود والالتزام المؤسسي',
      en: 'In-House Legal Operations, CLM & Corporate Governance',
    },
  },
  LAW_FIRM: {
    category: 'LEGAL',
    label: { ar: 'مكاتب المحاماة والتقاضي', en: 'Law Firm & Litigation Practice' },
    badge: 'LAW FIRM',
    tagline: {
      ar: 'إدارة القضايا، الجلسات، المذكرات والفوترة القانونية',
      en: 'Litigation Docket, Court Hearings, Briefs & Client Billing',
    },
  },
  LAW_STUDENT: {
    category: 'STUDENT',
    label: { ar: 'الباحث والأكاديمية القانونية', en: 'Legal Scholar & Student Lab' },
    badge: 'SCHOLAR',
    tagline: {
      ar: 'معمل الأبحاث، السوابق القضائية، ومحاكاة الصياغة',
      en: 'Legal Research Lab, Precedent Bank & Drafting Simulator',
    },
  },
}

export const MAQAR_NAVIGATION: Record<MaqarRole, MaqarNavItem[]> = {
  ENTERPRISE_CORP: [
    {
      id: 'virtual-rooms',
      label: { ar: 'الغرف الافتراضية', en: 'Virtual Rooms' },
      subtitle: { ar: 'مساحات الاجتماعات والتعاون مع الفرق والعملاء', en: 'Shared rooms for teams and clients' },
      icon: Video,
      legacyViewKey: 'communications',
    },
    {
      id: 'shared-calendar',
      label: { ar: 'المواعيد والجلسات', en: 'Calendar & Booking' },
      subtitle: { ar: 'المواعيد والحجوزات وجلسات العمل', en: 'Appointments, bookings & work sessions' },
      icon: CalendarDays,
      legacyViewKey: 'calendar',
    },
    {
      id: 'shared-documents',
      label: { ar: 'المستندات', en: 'Documents' },
      subtitle: { ar: 'ملفات ومسودات ومساحات مشاركة', en: 'Files, drafts & shared documents' },
      icon: FileText,
      legacyViewKey: 'documents',
    },
    {
      id: 'shared-messages',
      label: { ar: 'المحادثات', en: 'Messages' },
      subtitle: { ar: 'تواصل آمن مع الفرق والعملاء', en: 'Secure team and client communication' },
      icon: MessageCircle,
      legacyViewKey: 'communications',
    },
    {
      id: 'contract-vault',
      label: { ar: 'خزينة العقود (CLM)', en: 'Contract Vault' },
      subtitle: { ar: 'دورة حياة العقود والمخاطر والالتزامات', en: 'End-to-end CLM, clause risk & renewals' },
      icon: FileCheck2,
      badge: { ar: 'CLM', en: 'CLM', tone: 'emerald' },
      legacyViewKey: 'documents',
    },
    {
      id: 'compliance-radar',
      label: { ar: 'رادار الامتثال (GRC)', en: 'Compliance Radar' },
      subtitle: { ar: 'حماية البيانات، هيئة الزكاة، واللوائح التنظيمية', en: 'PDPL, NCA, ZATCA & regulatory posture' },
      icon: Radar,
      badge: { ar: 'GRC', en: 'GRC', tone: 'emerald' },
      legacyViewKey: 'compliance',
    },
    {
      id: 'board-resolutions',
      label: { ar: 'قرارات مجلس الإدارة', en: 'Board Resolutions' },
      subtitle: { ar: 'محاضر الاجتماعات، التفويضات، وحوكمة الشركات', en: 'Minutes, delegations of authority & governance' },
      icon: Landmark,
      legacyViewKey: 'briefs',
    },
    {
      id: 'in-house-tasks',
      label: { ar: 'مهام الإدارة القانونية', en: 'In-House Tasks' },
      subtitle: { ar: 'طلبات الإدارات الداخلية واتفاقيات مستوى الخدمة', en: 'Internal legal intake & department SLAs' },
      icon: CheckSquare,
      legacyViewKey: 'tasks',
    },
    {
      id: 'external-law-firms',
      label: { ar: 'المكاتب القانونية الخارجية', en: 'External Law Firms' },
      subtitle: { ar: 'إدارة المستشارين الخارجيين والميزانيات القضائية', en: 'Outside counsel spend, panels & instructions' },
      icon: Building2,
      legacyViewKey: 'clients',
    },
    {
      id: 'project-boards',
      label: { ar: 'إدارة المشاريع', en: 'Project Boards' },
      subtitle: { ar: 'لوحات العمل والمراحل والمهام المشتركة', en: 'Shared project boards and milestones' },
      icon: CheckSquare,
      legacyViewKey: 'tasks',
    },
    {
      id: 'client-portals',
      label: { ar: 'بوابة العملاء', en: 'Client Portals' },
      subtitle: { ar: 'مساحات آمنة لمتابعة العملاء والمشاريع', en: 'Secure client workspaces and updates' },
      icon: UsersRound,
      legacyViewKey: 'clients',
    },
    {
      id: 'service-packages',
      label: { ar: 'باقات الخدمات', en: 'Service Packages' },
      subtitle: { ar: 'تنظيم الخدمات والأسعار والعروض', en: 'Organize services, pricing and offers' },
      icon: Building2,
      legacyViewKey: 'invoices',
    },
  ],
  LAW_FIRM: [
    {
      id: 'virtual-rooms',
      label: { ar: 'الغرف الافتراضية', en: 'Virtual Rooms' },
      subtitle: { ar: 'مساحات الاجتماعات والتعاون مع الفرق والعملاء', en: 'Shared rooms for teams and clients' },
      icon: Video,
      legacyViewKey: 'communications',
    },
    {
      id: 'shared-calendar',
      label: { ar: 'المواعيد والجلسات', en: 'Calendar & Booking' },
      subtitle: { ar: 'المواعيد والحجوزات وجلسات العمل', en: 'Appointments, bookings & work sessions' },
      icon: CalendarDays,
      legacyViewKey: 'calendar',
    },
    {
      id: 'shared-documents',
      label: { ar: 'المستندات', en: 'Documents' },
      subtitle: { ar: 'ملفات ومسودات ومساحات مشاركة', en: 'Files, drafts & shared documents' },
      icon: FileText,
      legacyViewKey: 'documents',
    },
    {
      id: 'shared-messages',
      label: { ar: 'المحادثات', en: 'Messages' },
      subtitle: { ar: 'تواصل آمن مع الفرق والعملاء', en: 'Secure team and client communication' },
      icon: MessageCircle,
      legacyViewKey: 'communications',
    },
    {
      id: 'cases-litigations',
      label: { ar: 'القضايا والمنازعات', en: 'Cases & Litigations' },
      subtitle: { ar: 'سجل القضايا، المحاكم التجارية والعمالية والإدارية', en: 'Active court dockets, pleadings & stages' },
      icon: Gavel,
      legacyViewKey: 'cases',
    },
    {
      id: 'hearings-calendar',
      label: { ar: 'تقويم الجلسات والمواعيد', en: 'Hearings Calendar' },
      subtitle: { ar: 'جلسات ناجز، مدد الاعتراض، والمواعيد الإجرائية', en: 'Court sessions, statutory deadlines & alerts' },
      icon: CalendarClock,
      legacyViewKey: 'calendar',
    },
    {
      id: 'client-invoicing',
      label: { ar: 'فوترة الموكلين والأتعاب', en: 'Client Invoicing' },
      subtitle: { ar: 'الفوترة الإلكترونية (فاتورة)، الساعات، والتحصيل', en: 'ZATCA e-invoicing, retainers & billable hours' },
      icon: Receipt,
      legacyViewKey: 'invoices',
    },
    {
      id: 'submissions-briefs',
      label: { ar: 'المذكرات واللوائح الجوابية', en: 'Submissions & Briefs' },
      subtitle: { ar: 'صياغة اللوائح، صحائف الدعوى، ومذكرات الدفاع', en: 'Pleadings, appellate briefs & court filings' },
      icon: FileSignature,
      badge: { ar: 'صياغة ذكية', en: 'AI Assist', tone: 'emerald' },
      legacyViewKey: 'documents',
    },
    {
      id: 'team-allocation',
      label: { ar: 'توزيع الفريق والمحامين', en: 'Team Allocation' },
      subtitle: { ar: 'إسناد القضايا، عبء العمل، ومراجعة الشركاء', en: 'Partner review, associate workload & capacity' },
      icon: UsersRound,
      legacyViewKey: 'tasks',
    },
    {
      id: 'poa-compliance',
      label: { ar: 'الوكالات والامتثال', en: 'PoA & Compliance' },
      subtitle: { ar: 'الوكالات والتنبيهات والالتزامات النظامية', en: 'Powers of attorney and compliance' },
      icon: Radar,
      legacyViewKey: 'compliance',
    },
  ],
  LAW_STUDENT: [
    {
      id: 'virtual-rooms',
      label: { ar: 'الغرف الافتراضية', en: 'Virtual Rooms' },
      subtitle: { ar: 'مساحات الاجتماعات والتعاون مع الزملاء', en: 'Shared rooms for peers and mentors' },
      icon: Video,
      legacyViewKey: 'communications',
    },
    {
      id: 'shared-calendar',
      label: { ar: 'المواعيد والجلسات', en: 'Calendar & Booking' },
      subtitle: { ar: 'المواعيد والحجوزات وجلسات الدراسة', en: 'Appointments, bookings & study sessions' },
      icon: CalendarDays,
      legacyViewKey: 'calendar',
    },
    {
      id: 'shared-documents',
      label: { ar: 'المستندات', en: 'Documents' },
      subtitle: { ar: 'ملفات الأبحاث والمسودات', en: 'Research files and drafts' },
      icon: FileText,
      legacyViewKey: 'documents',
    },
    {
      id: 'shared-messages',
      label: { ar: 'المحادثات', en: 'Messages' },
      subtitle: { ar: 'تواصل آمن مع الزملاء والمشرفين', en: 'Secure peer and mentor communication' },
      icon: MessageCircle,
      legacyViewKey: 'communications',
    },
    {
      id: 'research-lab',
      label: { ar: 'معمل الأبحاث القانونية', en: 'Research Lab' },
      subtitle: { ar: 'الأبحاث المحكمة، المقارنات الفقهية والنظامية', en: 'Doctrinal analysis, statutes & academic papers' },
      icon: FlaskConical,
      badge: { ar: 'مُحكّم', en: 'Indexed', tone: 'navy' },
      legacyViewKey: 'research',
    },
    {
      id: 'precedent-bank',
      label: { ar: 'بنك السوابق القضائية', en: 'Precedent Bank' },
      subtitle: { ar: 'المبادئ القضائية للمحكمة العليا وديوان المظالم', en: 'Supreme Court & Board of Grievances principles' },
      icon: Scale,
      badge: { ar: '+1,240 مبدأ', en: '1,240+ Cases', tone: 'emerald' },
      legacyViewKey: 'casebook',
    },
    {
      id: 'drafting-simulator',
      label: { ar: 'محاكي الصياغة القانونية', en: 'Drafting Simulator' },
      subtitle: { ar: 'تدريب تفاعلي على صياغة العقود ومذكرات الترافع', en: 'Interactive contract & pleading sandbox' },
      icon: PenTool,
      badge: { ar: 'تفاعلي', en: 'Interactive', tone: 'amber' },
      legacyViewKey: 'documents',
    },
    {
      id: 'mentorship-internships',
      label: { ar: 'الإرشاد والتدريب العدلي', en: 'Mentorship & Internships' },
      subtitle: { ar: 'فرص التدريب في المكاتب والشركات والعيادات القانونية', en: 'Legal clinics, moot courts & fellowship tracks' },
      icon: GraduationCap,
      legacyViewKey: 'overview',
    },
    {
      id: 'ai-case-briefs',
      label: { ar: 'ملخصات القضايا الذكية', en: 'AI Case Briefs' },
      subtitle: { ar: 'تلخيص وتحليل القضايا مع مراجع البحث', en: 'AI-assisted case summaries and analysis' },
      icon: FileCheck2,
      legacyViewKey: 'research',
    },
    {
      id: 'study-rooms',
      label: { ar: 'غرف المذاكرة المشتركة', en: 'Study Rooms' },
      subtitle: { ar: 'جلسات دراسة وتعاون مع الزملاء', en: 'Collaborative study sessions' },
      icon: Video,
      legacyViewKey: 'communications',
    },
    {
      id: 'academic-tracker',
      label: { ar: 'المتابعة الأكاديمية', en: 'Academic Tracker' },
      subtitle: { ar: 'المهام والمواعيد والدرجات الأكاديمية', en: 'Academic tasks, deadlines and GPA progress' },
      icon: CalendarDays,
      legacyViewKey: 'overview',
    },
  ],
}

export const DEFAULT_MAQAR_ORGS: MaqarOrgEntity[] = [
  {
    id: 'org-enterprise-01',
    name: { ar: 'مجموعة المدار القابضة', en: 'Al-Madar Holding Group' },
    slug: 'almadar-holding',
    type: 'ENTERPRISE_CORP',
    vertical: 'GENERAL',
    tier: 'ENTERPRISE',
    workspaces: [
      { id: 'ws-ent-clm', name: { ar: 'الإدارة القانونية والعقود', en: 'Corporate Legal & CLM' }, type: 'CORPORATE_CLM' },
      { id: 'ws-ent-grc', name: { ar: 'الحوكمة والامتثال وأمانة المجلس', en: 'Governance, Risk & Board' }, type: 'GRC_COMPLIANCE' },
    ],
  },
  {
    id: 'org-lawfirm-01',
    name: { ar: 'الفيصل وشركاه للمحاماة والاستشارات', en: 'Al-Faisal & Partners Law Firm' },
    slug: 'alfaisal-law',
    type: 'LAW_FIRM',
    vertical: 'LEGAL',
    tier: 'PROFESSIONAL',
    workspaces: [
      { id: 'ws-firm-lit', name: { ar: 'قطاع التقاضي والمنازعات التجارية', en: 'Commercial Litigation Practice' }, type: 'LITIGATION' },
      { id: 'ws-firm-corp', name: { ar: 'قطاع الشركات والاندماج والاستحواذ', en: 'Corporate & M&A Advisory' }, type: 'CORPORATE_CLM' },
    ],
  },
  {
    id: 'org-academic-01',
    name: { ar: 'أكاديمية مقر للدراسات القانونية', en: 'Maqar Legal Research Academy' },
    slug: 'maqar-academy',
    type: 'LAW_STUDENT',
    vertical: 'STUDENT',
    tier: 'STARTER',
    workspaces: [
      { id: 'ws-acad-lab', name: { ar: 'العيادة القانونية ومعمل الصياغة', en: 'Legal Clinic & Drafting Lab' }, type: 'ACADEMIC_CLINIC' },
    ],
  },
]
