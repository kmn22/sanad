'use client'

/**
 * ============================================================================
 * Maqar (مقر) — Multi-Role Onboarding Wizard (`src/components/maqar/MaqarOnboardingWizard.tsx`)
 * ============================================================================
 *
 * Interactive 3-step Arabic RTL / English LTR onboarding flow aligned with
 * Maqar's institutional light identity (#F5F7F5 / #1F7A46):
 *   Step 1: Persona Selection (Company/In-House, Law Firm, Law Student)
 *   Step 2: Persona-Specific Regulatory & Profile Details
 *   Step 3: Summary & Workspace Provisioning (or seamless Account Sign-Up/Sign-In)
 */

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Scale,
  GraduationCap,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileBadge,
  MapPin,
  Users,
  BookOpen,
  Briefcase,
  Hash,
  Layers,
  Globe,
  Loader2,
  Lock,
  UserPlus,
  LogIn,
} from 'lucide-react'
import {
  completeMaqarOnboarding,
  type MaqarOnboardingInput,
} from '@/app/actions/onboarding'
import {
  MAQAR_DASHBOARD_PATHS,
  type MaqarPersonaType,
} from '@/lib/auth/portals'

interface PersonaCardOption {
  id: MaqarPersonaType
  titleAr: string
  titleEn: string
  subtitleAr: string
  subtitleEn: string
  badgeAr: string
  badgeEn: string
  targetLabelAr: string
  targetLabelEn: string
  defaultRoleAr: string
  defaultRoleEn: string
  registerType: 'firm' | 'lawyer' | 'student'
  icon: React.ComponentType<{ className?: string }>
  highlightsAr: string[]
  highlightsEn: string[]
}

const PERSONA_CARDS: PersonaCardOption[] = [
  {
    id: 'ENTERPRISE_CORP',
    titleAr: 'منشأة تجارية / إدارة قانونية',
    titleEn: 'Company / In-House Legal Team',
    subtitleAr:
      'للشركات القابضة والمنشآت التجارية الراغبة في أتمتة دورة حياة العقود (CLM)، ومراقبة الامتثال (PDPL)، وحوكمة قرارات مجلس الإدارة.',
    subtitleEn:
      'For corporations and in-house legal departments managing CLM, GRC compliance, and board governance.',
    badgeAr: 'حوكمة الشركات والعقود',
    badgeEn: 'Corporate Legal & GRC',
    targetLabelAr: 'لوحة العقود والحوكمة المؤسسية',
    targetLabelEn: 'Corporate CLM & Governance HQ',
    defaultRoleAr: 'مدير الإدارة القانونية',
    defaultRoleEn: 'Corporate Legal Director',
    registerType: 'firm',
    icon: Building2,
    highlightsAr: [
      'خزينة العقود الذكية وفحص المخاطر بالذكاء الاصطناعي',
      'رادار الامتثال التنظيمي (سدايا PDPL وهيئة السوق المالية)',
      'سجل قرارات مجلس الإدارة وإدارة المكاتب الخارجية',
    ],
    highlightsEn: [
      'Contract Lifecycle Vault & AI Clause Risk Audit',
      'Regulatory Compliance Radar (SDAIA PDPL, CMA, MHRSD)',
      'Board Resolutions & External Law Firm Spend Tracker',
    ],
  },
  {
    id: 'LAW_FIRM',
    titleAr: 'مكتب أو شركة محاماة',
    titleEn: 'Law Firm / Independent Lawyer',
    subtitleAr:
      'لشركات المحاماة والمستشارين القانونيين لإدارة القضايا والترافع، وحساب المواعيد النظامية والمدد الاستئنافية، وصياغة المذكرات الجوابية.',
    subtitleEn:
      'For law firms and legal practitioners managing litigations, statutory deadlines, court briefs, and client billing.',
    badgeAr: 'إدارة التقاضي والممارسة المهنية',
    badgeEn: 'Litigation & Practice Ops',
    targetLabelAr: 'لوحة مكاتب المحاماة والتقاضي',
    targetLabelEn: 'Law Firm & Litigation HQ',
    defaultRoleAr: 'الشريك المدير',
    defaultRoleEn: 'Managing Partner',
    registerType: 'firm',
    icon: Scale,
    highlightsAr: [
      'إدارة القضايا والجلسات ومحرك حساب مهل الاستئناف (30 يوماً)',
      'منضدة صياغة المذكرات الترافعية وتصدير DOCX / PDF',
      'الفوترة الإلكترونية المتوافقة مع المرحلة الثانية (ZATCA)',
    ],
    highlightsEn: [
      'Litigation Case Engine & 30-Day Statutory Appeal Calculator',
      'Structured Court Pleading Builder with DOCX / PDF Export',
      'ZATCA Phase-2 Compliant Legal Billing & Time Tracking',
    ],
  },
  {
    id: 'LAW_STUDENT',
    titleAr: 'باحث / طالب قانون',
    titleEn: 'Law Student / Legal Academic',
    subtitleAr:
      'لطلاب كليات الحقوق والشريعة والباحثين القانونيين للتدريب على الصياغة القضائية، والبحث الدلالي الموثق بالمواد النظامية، وفرص التدريب.',
    subtitleEn:
      'For law students and legal scholars accessing grounded RAG research, judicial drafting simulation, and firm internships.',
    badgeAr: 'المختبر الأكاديمي والعيادة القضائية',
    badgeEn: 'Academic Lab & Simulation',
    targetLabelAr: 'الأكاديمية ومعمل الأبحاث القانونية',
    targetLabelEn: 'Legal Research Academy',
    defaultRoleAr: 'باحث / متدرب قانوني',
    defaultRoleEn: 'Legal Researcher / Trainee',
    registerType: 'student',
    icon: GraduationCap,
    highlightsAr: [
      'المساعد البحثي الدلالي الموثق بأرقام المواد والمراسيم الملكية',
      'مختبر محاكاة الصياغة القضائية وتقييم الدفوع آلياً',
      'دليل المواهب القانونية والترشيح للتدريب لدى مكاتب المحاماة',
    ],
    highlightsEn: [
      'Citation-Grounded Legal Research Assistant',
      'Interactive Judicial Pleading & Contract Redline Simulator',
      'Verified Talent Directory & Law Firm Internship Matching',
    ],
  },
]

const SAUDI_INDUSTRIES = [
  'التقنية والاتصالات والحوسبة السحابية',
  'الطاقة والبتروكيماويات والصناعة',
  'القطاع المالي والمصرفي والتقنية المالية (FinTech)',
  'التطوير العقاري والمقاولات والبنية التحتية',
  'الرعاية الصحية والصناعات الدوائية',
  'التجارة الإلكترونية والخدمات اللوجستية',
]

const SAUDI_CITIES = [
  'الرياض — منطقة الرياض',
  'جدة — منطقة مكة المكرمة',
  'الدمام / الخبر — المنطقة الشرقية',
  'مكة المكرمة — منطقة مكة المكرمة',
  'المدينة المنورة — منطقة المدينة المنورة',
  'أبها — منطقة عسير',
]

const SAUDI_UNIVERSITIES = [
  'جامعة الملك سعود — كلية الحقوق والعلوم السياسية',
  'جامعة الإمام محمد بن سعود الإسلامية — كلية الشريعة',
  'جامعة الملك عبدالعزيز — كلية الحقوق',
  'جامعة الأمير سلطان — كلية القانون',
  'جامعة الملك فيصل — كلية الحقوق',
  'الجامعة السعودية الإلكترونية — قسم القانون',
]

const STUDENT_INTEREST_TAGS = [
  'نظام المعاملات المدنية',
  'القضاء التجاري والشركات',
  'نظام العمل والمنازعات العمالية',
  'نظام الإجراءات الجزائية',
  'حماية البيانات الشخصية والذكاء الاصطناعي',
  'التحكيم التجاري وتسوية المنازعات',
  'الملكية الفكرية والتقنية المالية',
]

const DRAFT_STORAGE_KEY = 'maqar.onboarding_draft'

export function MaqarOnboardingWizard() {
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isRtl = lang === 'ar'

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedPersona, setSelectedPersona] =
    useState<MaqarPersonaType>('ENTERPRISE_CORP')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [needsAccountPrompt, setNeedsAccountPrompt] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Step 2A: Company / In-House Legal State
  const [companyName, setCompanyName] = useState('')
  const [crNumber, setCrNumber] = useState('')
  const [industry, setIndustry] = useState(SAUDI_INDUSTRIES[0])
  const [companySize, setCompanySize] = useState<'1-50' | '51-250' | '251-1000' | '1000+'>('51-250')

  // Step 2B: Law Firm State
  const [firmName, setFirmName] = useState('')
  const [barLicense, setBarLicense] = useState('')
  const [cityRegion, setCityRegion] = useState(SAUDI_CITIES[0])
  const [teamCapacity, setTeamCapacity] = useState<
    'SOLO_1_3' | 'BOUTIQUE_4_15' | 'MIDSIZE_16_50' | 'ENTERPRISE_50_PLUS'
  >('BOUTIQUE_4_15')

  // Step 2C: Law Student / Researcher State
  const [studentName, setStudentName] = useState('')
  const [university, setUniversity] = useState(SAUDI_UNIVERSITIES[0])
  const [academicLevel, setAcademicLevel] = useState<
    | 'UNDERGRADUATE_Y1_Y2'
    | 'UNDERGRADUATE_Y3_Y4'
    | 'LLB_GRADUATE_TRAINEE'
    | 'LLM_PHD_RESEARCHER'
  >('UNDERGRADUATE_Y3_Y4')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'نظام المعاملات المدنية',
  ])

  // Apply ?persona= query param or restore draft after sign-up / login
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const personaParam = params.get('persona')
    if (
      personaParam === 'ENTERPRISE_CORP' ||
      personaParam === 'LAW_FIRM' ||
      personaParam === 'LAW_STUDENT'
    ) {
      setSelectedPersona(personaParam)
      setStep(2)
    }

    const rawDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (rawDraft) {
      try {
        const draft = JSON.parse(rawDraft)
        if (draft.selectedPersona) setSelectedPersona(draft.selectedPersona)
        if (typeof draft.companyName === 'string') setCompanyName(draft.companyName)
        if (typeof draft.crNumber === 'string') setCrNumber(draft.crNumber)
        if (typeof draft.industry === 'string') setIndustry(draft.industry)
        if (typeof draft.companySize === 'string') setCompanySize(draft.companySize)
        if (typeof draft.firmName === 'string') setFirmName(draft.firmName)
        if (typeof draft.barLicense === 'string') setBarLicense(draft.barLicense)
        if (typeof draft.cityRegion === 'string') setCityRegion(draft.cityRegion)
        if (typeof draft.teamCapacity === 'string') setTeamCapacity(draft.teamCapacity)
        if (typeof draft.studentName === 'string') setStudentName(draft.studentName)
        if (typeof draft.university === 'string') setUniversity(draft.university)
        if (typeof draft.academicLevel === 'string') setAcademicLevel(draft.academicLevel)
        if (Array.isArray(draft.selectedInterests) && draft.selectedInterests.length > 0) {
          setSelectedInterests(draft.selectedInterests)
        }
        if (draft.step === 2 || draft.step === 3) {
          setStep(draft.step)
        }
      } catch {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      }
    }
  }, [])

  const activeCard =
    PERSONA_CARDS.find((c) => c.id === selectedPersona) ?? PERSONA_CARDS[0]

  const toggleInterestTag = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    )
  }

  const persistDraft = (targetStep: 1 | 2 | 3) => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        step: targetStep,
        selectedPersona,
        companyName,
        crNumber,
        industry,
        companySize,
        firmName,
        barLicense,
        cityRegion,
        teamCapacity,
        studentName,
        university,
        academicLevel,
        selectedInterests,
      })
    )
  }

  const validateStep2 = (): boolean => {
    setErrorMessage(null)
    if (selectedPersona === 'ENTERPRISE_CORP') {
      if (companyName.trim().length < 2) {
        setErrorMessage(
          isRtl
            ? 'يرجى إدخال اسم المنشأة التجارية بشكل صحيح.'
            : 'Please enter a valid company name.'
        )
        return false
      }
      if (!/^\d{10}$/.test(crNumber.trim())) {
        setErrorMessage(
          isRtl
            ? 'رقم السجل التجاري السعودي يجب أن يتكون من 10 أرقام (مثال: 1010894521).'
            : 'Saudi Commercial Registration number must be 10 digits.'
        )
        return false
      }
      return true
    }

    if (selectedPersona === 'LAW_FIRM') {
      if (firmName.trim().length < 2) {
        setErrorMessage(
          isRtl
            ? 'يرجى إدخال اسم مكتب أو شركة المحاماة.'
            : 'Please enter the law firm name.'
        )
        return false
      }
      if (barLicense.trim().length < 4) {
        setErrorMessage(
          isRtl
            ? 'يرجى إدخال رقم ترخيص المحاماة الصادر من وزارة العدل.'
            : 'Please enter your Bar License number.'
        )
        return false
      }
      return true
    }

    if (selectedPersona === 'LAW_STUDENT') {
      if (studentName.trim().length < 2) {
        setErrorMessage(
          isRtl
            ? 'يرجى إدخال الاسم الكامل للباحث أو الطالب.'
            : 'Please enter your full name.'
        )
        return false
      }
      if (selectedInterests.length === 0) {
        setErrorMessage(
          isRtl
            ? 'يرجى اختيار مجال بحثي أو قانوني واحد على الأقل.'
            : 'Please select at least one legal research area.'
        )
        return false
      }
      return true
    }

    return true
  }

  const handleNextStep = () => {
    if (step === 1) {
      setErrorMessage(null)
      setStep(2)
      return
    }
    if (step === 2) {
      if (validateStep2()) {
        persistDraft(3)
        setStep(3)
      }
    }
  }

  const handleCompleteOnboarding = () => {
    setErrorMessage(null)

    if (sessionStatus !== 'authenticated') {
      persistDraft(3)
      setNeedsAccountPrompt(true)
      return
    }

    startTransition(async () => {
      let payload: MaqarOnboardingInput
      if (selectedPersona === 'ENTERPRISE_CORP') {
        payload = {
          persona: 'ENTERPRISE_CORP',
          entityName: companyName.trim(),
          commercialRegistrationNumber: crNumber.trim(),
          industry,
          companySize,
        }
      } else if (selectedPersona === 'LAW_FIRM') {
        payload = {
          persona: 'LAW_FIRM',
          entityName: firmName.trim(),
          barLicenseNumber: barLicense.trim(),
          cityRegion,
          teamCapacity,
        }
      } else {
        payload = {
          persona: 'LAW_STUDENT',
          fullName: studentName.trim(),
          universityCollege: university,
          academicLevel,
          areasOfInterest: selectedInterests,
        }
      }

      const result = await completeMaqarOnboarding(payload)
      if (!result.success) {
        setErrorMessage(
          result.error || 'تعذر حفظ إعدادات التهيئة، يرجى المحاولة مجدداً.'
        )
        return
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      }
      router.push(result.redirectPath || MAQAR_DASHBOARD_PATHS[selectedPersona])
    })
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F5F7F5] dark:bg-background text-foreground flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#CCD8CE] dark:border-border bg-white/95 dark:bg-card/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-[#1F7A46] flex items-center justify-center shadow-xs text-white">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-[#1B281F] dark:text-foreground font-heading">
                  مقر
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-[#E8EFE9] text-[#34543F] border border-[#CCD8CE] font-semibold">
                  MAQAR
                </span>
              </div>
              <p className="text-[11px] text-[#4A5D50] dark:text-muted-foreground hidden sm:block">
                {isRtl
                  ? 'المقر الرقمي للعمليات القانونية والحوكمة'
                  : 'Unified Legal Ops & Corporate Governance'}
              </p>
            </div>
          </Link>

          {/* Stepper Indicator & Language Switch */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              {[
                { num: 1, labelAr: 'تحديد المسار', labelEn: 'Persona' },
                { num: 2, labelAr: 'البيانات النظامية', labelEn: 'Profile Details' },
                { num: 3, labelAr: 'تفعيل المقر', labelEn: 'Launch HQ' },
              ].map((item) => {
                const isActive = step === item.num
                const isDone = step > item.num
                return (
                  <div key={item.num} className="flex items-center gap-1.5">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                        isActive
                          ? 'bg-[#1F7A46] text-white'
                          : isDone
                          ? 'bg-[#E8EFE9] text-[#1F7A46] border border-[#1F7A46]/40'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isDone ? '✓' : item.num}
                    </span>
                    <span
                      className={
                        isActive
                          ? 'font-bold text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {isRtl ? item.labelAr : item.labelEn}
                    </span>
                    {item.num < 3 && (
                      <span className="text-border mx-1">/</span>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:border-primary transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              {lang === 'ar' ? 'EN' : 'العربية'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Wizard Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs sm:text-sm text-rose-800 dark:text-rose-200 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 dark:text-rose-300 hover:opacity-75 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ================================================================
              STEP 1: PERSONA SELECTION CARDS
             ================================================================ */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] dark:bg-accent border border-[#CCD8CE] dark:border-border text-[#1F7A46] dark:text-primary text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isRtl
                    ? 'الخطوة ١ من ٣ — تخصيص بيئة العمل القانونية'
                    : 'Step 1 of 3 — Select Your Legal Workspace Persona'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-heading">
                  {isRtl
                    ? 'اختر مسارك المهني لتهيئة مقرّك الرقمي'
                    : 'Choose Your Primary Legal Persona'}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRtl
                    ? 'يقوم نظام «مقر» بضبط وحدات القائمة، وصلاحيات الوصول، وسياسات العزل والحماية تلقائياً بناءً على طبيعة منشأتك.'
                    : 'Maqar adapts navigation modules, access permissions, and isolation policies to match your organization.'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {PERSONA_CARDS.map((card) => {
                  const Icon = card.icon
                  const isSelected = selectedPersona === card.id
                  const highlights = isRtl ? card.highlightsAr : card.highlightsEn

                  return (
                    <button
                      key={card.id}
                      type="button"
                      data-testid={`persona-card-${card.id}`}
                      onClick={() => setSelectedPersona(card.id)}
                      className={`text-start rounded-2xl p-6 transition-all duration-200 border flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#1F7A46] ring-2 ring-[#1F7A46]/20 bg-white dark:bg-card shadow-md'
                          : 'border-[#CCD8CE] dark:border-border bg-white/80 dark:bg-card/70 hover:border-[#1F7A46]/60 hover:bg-white dark:hover:bg-card'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
                              isSelected
                                ? 'bg-[#1F7A46] border-[#1F7A46] text-white'
                                : 'bg-[#E8EFE9] dark:bg-muted border-[#CCD8CE] dark:border-border text-[#1F7A46] dark:text-foreground'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#E8EFE9] dark:bg-muted text-[#34543F] dark:text-muted-foreground border border-[#CCD8CE] dark:border-border">
                            {isRtl ? card.badgeAr : card.badgeEn}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h2 className="text-lg font-extrabold text-foreground">
                            {isRtl ? card.titleAr : card.titleEn}
                          </h2>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {isRtl ? card.subtitleAr : card.subtitleEn}
                          </p>
                        </div>

                        <ul className="space-y-2 pt-3 border-t border-border">
                          {highlights.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-foreground/90"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#1F7A46] dark:text-primary shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">
                          {isRtl ? card.targetLabelAr : card.targetLabelEn}
                        </span>
                        <span
                          className={`font-bold ${
                            isSelected ? 'text-[#1F7A46] dark:text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {isSelected
                            ? isRtl
                              ? '✓ محدد حالياً'
                              : '✓ Selected'
                            : isRtl
                            ? 'اختر المسار'
                            : 'Select'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ================================================================
              STEP 2: DYNAMIC PERSONA-SPECIFIC CONFIGURATION
             ================================================================ */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] dark:bg-accent border border-[#CCD8CE] dark:border-border text-[#1F7A46] dark:text-primary text-xs font-semibold">
                  {isRtl
                    ? `الخطوة ٢ من ٣ — بيانات ${activeCard.titleAr}`
                    : `Step 2 of 3 — ${activeCard.titleEn} Details`}
                </span>
                <h2 className="text-2xl font-black text-foreground font-heading">
                  {selectedPersona === 'ENTERPRISE_CORP' &&
                    (isRtl
                      ? 'بيانات السجل التجاري والمنشأة'
                      : 'Commercial Registration & Corporate Profile')}
                  {selectedPersona === 'LAW_FIRM' &&
                    (isRtl
                      ? 'بيانات ترخيص المحاماة وسعة المكتب'
                      : 'Bar License & Law Firm Capacity')}
                  {selectedPersona === 'LAW_STUDENT' &&
                    (isRtl
                      ? 'البيانات الأكاديمية والاهتمامات البحثية'
                      : 'University Profile & Research Interests')}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? 'تُستخدم هذه المحددات لضبط القوالب النظامية، والاختصاص المكاني، وقواعد فحص العقود والامتثال.'
                    : 'These parameters calibrate statutory rules, jurisdiction defaults, and compliance checks.'}
                </p>
              </div>

              <div className="rounded-2xl border border-[#CCD8CE] dark:border-border bg-white dark:bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                {selectedPersona === 'ENTERPRISE_CORP' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-2">
                        {isRtl ? 'اسم المنشأة أو الشركة القابضة' : 'Company / Legal Entity Name'}
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-muted-foreground absolute top-3.5 start-3.5" />
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder={isRtl ? 'مثال: الشركة الوطنية للتقنية المتقدمة' : 'e.g. National Advanced Tech Co.'}
                          className="w-full rounded-xl bg-background border border-border ps-10 pe-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">
                          {isRtl
                            ? 'رقم السجل التجاري الموحد (10 أرقام)'
                            : 'Commercial Registration Number (10 digits)'}
                        </label>
                        <div className="relative">
                          <Hash className="w-4 h-4 text-muted-foreground absolute top-3.5 start-3.5" />
                          <input
                            type="text"
                            maxLength={10}
                            value={crNumber}
                            onChange={(e) =>
                              setCrNumber(e.target.value.replace(/\D/g, ''))
                            }
                            placeholder="1010XXXXXX"
                            className="w-full rounded-xl bg-background border border-border ps-10 pe-4 py-2.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">
                          {isRtl ? 'حجم المنشأة (عدد الموظفين)' : 'Company Size'}
                        </label>
                        <select
                          value={companySize}
                          onChange={(e) =>
                            setCompanySize(
                              e.target.value as '1-50' | '51-250' | '251-1000' | '1000+'
                            )
                          }
                          className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="1-50">منشأة صغيرة (1 - 50 موظفاً)</option>
                          <option value="51-250">منشأة متوسطة (51 - 250 موظفاً)</option>
                          <option value="251-1000">شركة كبرى (251 - 1,000 موظف)</option>
                          <option value="1000+">مجموعة قابضة / عملاقة (+1,000 موظف)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-2">
                        {isRtl ? 'القطاع الصناعي / النشاط الرئيسي' : 'Primary Industry Sector'}
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-muted-foreground absolute top-3.5 start-3.5" />
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full rounded-xl bg-background border border-border ps-10 pe-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          {SAUDI_INDUSTRIES.map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPersona === 'LAW_FIRM' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-2">
                        {isRtl
                          ? 'اسم مكتب أو شركة المحاماة والاستشارات القانونية'
                          : 'Law Firm / Legal Practice Name'}
                      </label>
                      <div className="relative">
                        <Scale className="w-4 h-4 text-muted-foreground absolute top-3.5 start-3.5" />
                        <input
                          type="text"
                          value={firmName}
                          onChange={(e) => setFirmName(e.target.value)}
                          placeholder={isRtl ? 'مثال: شركة الفيصل للمحاماة والاستشارات' : 'e.g. Al-Faisal & Partners Law Firm'}
                          className="w-full rounded-xl bg-background border border-border ps-10 pe-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">
                          {isRtl
                            ? 'رقم ترخيص المحاماة (وزارة العدل / الهيئة السعودية للمحامين)'
                            : 'Bar License Number (MoJ / SBA)'}
                        </label>
                        <div className="relative">
                          <FileBadge className="w-4 h-4 text-muted-foreground absolute top-3.5 start-3.5" />
                          <input
                            type="text"
                            value={barLicense}
                            onChange={(e) => setBarLicense(e.target.value)}
                            placeholder="4409XXXX"
                            className="w-full rounded-xl bg-background border border-border ps-10 pe-4 py-2.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">
                          {isRtl ? 'المدينة / المنطقة الإدارية' : 'Primary City / Jurisdiction'}
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-muted-foreground absolute top-3.5 start-3.5" />
                          <select
                            value={cityRegion}
                            onChange={(e) => setCityRegion(e.target.value)}
                            className="w-full rounded-xl bg-background border border-border ps-10 pe-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                          >
                            {SAUDI_CITIES.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-2">
                        {isRtl ? 'سعة الفريق القانوني والمحامين' : 'Legal Team Capacity'}
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-muted-foreground absolute top-3.5 start-3.5" />
                        <select
                          value={teamCapacity}
                          onChange={(e) =>
                            setTeamCapacity(
                              e.target.value as
                                | 'SOLO_1_3'
                                | 'BOUTIQUE_4_15'
                                | 'MIDSIZE_16_50'
                                | 'ENTERPRISE_50_PLUS'
                            )
                          }
                          className="w-full rounded-xl bg-background border border-border ps-10 pe-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="SOLO_1_3">مكتب فردي / ناشئ (1 - 3 محامين)</option>
                          <option value="BOUTIQUE_4_15">مكتب متخصص (4 - 15 محامياً ومستشاراً)</option>
                          <option value="MIDSIZE_16_50">شركة محاماة متوسطة (16 - 50 محامياً)</option>
                          <option value="ENTERPRISE_50_PLUS">شركة محاماة كبرى (+50 محامياً ومستشاراً)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPersona === 'LAW_STUDENT' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">
                          {isRtl ? 'الاسم الكامل للباحث / الطالب' : 'Full Researcher / Student Name'}
                        </label>
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder={isRtl ? 'الاسم الثلاثي' : 'Full Name'}
                          className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground mb-2">
                          {isRtl ? 'المستوى الأكاديمي' : 'Academic Standing'}
                        </label>
                        <select
                          value={academicLevel}
                          onChange={(e) =>
                            setAcademicLevel(
                              e.target.value as
                                | 'UNDERGRADUATE_Y1_Y2'
                                | 'UNDERGRADUATE_Y3_Y4'
                                | 'LLB_GRADUATE_TRAINEE'
                                | 'LLM_PHD_RESEARCHER'
                            )
                          }
                          className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="UNDERGRADUATE_Y1_Y2">بكالوريوس قانون / شريعة (المستوى التأسيسي)</option>
                          <option value="UNDERGRADUATE_Y3_Y4">بكالوريوس قانون / شريعة (المستوى المتقدم والعيادة القضائية)</option>
                          <option value="LLB_GRADUATE_TRAINEE">خريج بكالوريوس / محامٍ متدرب</option>
                          <option value="LLM_PHD_RESEARCHER">باحث دراسات عليا (ماجستير / دكتوراه)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-2">
                        {isRtl ? 'الجامعة / الكلية' : 'University / Law College'}
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-muted-foreground absolute top-3.5 start-3.5" />
                        <select
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full rounded-xl bg-background border border-border ps-10 pe-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          {SAUDI_UNIVERSITIES.map((uni) => (
                            <option key={uni} value={uni}>
                              {uni}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-2">
                        {isRtl
                          ? 'المجالات البحثية والقانونية المهتم بها (اختر مجالاً أو أكثر)'
                          : 'Legal Research Areas of Interest'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {STUDENT_INTEREST_TAGS.map((tag) => {
                          const active = selectedInterests.includes(tag)
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleInterestTag(tag)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                active
                                  ? 'bg-[#E8EFE9] dark:bg-accent border-[#1F7A46] text-[#1F7A46] dark:text-primary'
                                  : 'bg-background border-border text-muted-foreground hover:border-primary/40'
                              }`}
                            >
                              {active ? `✓ ${tag}` : `+ ${tag}`}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================================================================
              STEP 3: PROVISIONING SUMMARY
             ================================================================ */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] dark:bg-accent border border-[#CCD8CE] dark:border-border text-[#1F7A46] dark:text-primary text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isRtl
                    ? 'الخطوة ٣ من ٣ — مراجعة الإعدادات وتفعيل المقر الرقمي'
                    : 'Step 3 of 3 — Confirm Settings & Launch Workspace'}
                </span>
                <h2 className="text-2xl font-black text-foreground font-heading">
                  {isRtl
                    ? 'ملخص تهيئة المقر والصلاحيات'
                    : 'Workspace & Access Summary'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRtl
                    ? 'سيتم إنشاء مساحة عمل معزولة وتعيين الصلاحيات الافتراضية وتوجيهك مباشرة إلى لوحة القيادة المخصصة.'
                    : 'Your isolated tenant workspace will be provisioned and routed to your tailored dashboard.'}
                </p>
              </div>

              <div className="rounded-2xl border border-[#CCD8CE] dark:border-border bg-white dark:bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-1">
                    <span className="text-[11px] text-muted-foreground">
                      {isRtl ? 'المسار المهني المختار' : 'Selected Workspace Track'}
                    </span>
                    <p className="text-sm font-extrabold text-foreground">
                      {isRtl ? activeCard.titleAr : activeCard.titleEn}
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-[#1F7A46] dark:text-primary">
                      {isRtl ? activeCard.badgeAr : activeCard.badgeEn}
                    </span>
                  </div>

                  <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-1">
                    <span className="text-[11px] text-muted-foreground">
                      {isRtl ? 'الدور الوظيفي الافتراضي' : 'Default Workspace Role'}
                    </span>
                    <p className="text-sm font-extrabold text-foreground">
                      {isRtl ? activeCard.defaultRoleAr : activeCard.defaultRoleEn}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                      <Lock className="w-3 h-3" />
                      {isRtl ? 'عزل بيانات المستأجرين وحمايتها مفعل' : 'Tenant Isolation & Encryption Enabled'}
                    </span>
                  </div>
                </div>

                {/* Dynamic Summary Details */}
                <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>
                      {isRtl ? 'البيانات النظامية المسجلة:' : 'Registered Profile Details:'}
                    </span>
                  </div>

                  {selectedPersona === 'ENTERPRISE_CORP' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-foreground">
                      <div>
                        <span className="text-muted-foreground block">المنشأة:</span>
                        <span className="font-bold">{companyName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">السجل التجاري:</span>
                        <span className="font-mono font-bold text-primary">{crNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">القطاع والحجم:</span>
                        <span className="font-bold">{industry} ({companySize})</span>
                      </div>
                    </div>
                  )}

                  {selectedPersona === 'LAW_FIRM' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-foreground">
                      <div>
                        <span className="text-muted-foreground block">مكتب/شركة المحاماة:</span>
                        <span className="font-bold">{firmName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">رقم ترخيص المحاماة:</span>
                        <span className="font-mono font-bold text-primary">{barLicense}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">النطاق والسعة:</span>
                        <span className="font-bold">{cityRegion} ({teamCapacity})</span>
                      </div>
                    </div>
                  )}

                  {selectedPersona === 'LAW_STUDENT' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-foreground">
                      <div>
                        <span className="text-muted-foreground block">الباحث / الطالب:</span>
                        <span className="font-bold">{studentName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">الجامعة / الكلية:</span>
                        <span className="font-bold text-primary">{university}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">الاهتمامات البحثية:</span>
                        <span className="font-bold">{selectedInterests.join('، ')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-[#E8EFE9] dark:bg-accent border border-[#CCD8CE] dark:border-border p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#34543F] dark:text-muted-foreground block">
                      {isRtl
                        ? 'مساحة العمل التي سيتم توجيهك إليها:'
                        : 'Destination Workspace:'}
                    </span>
                    <span className="text-sm font-extrabold text-[#1B281F] dark:text-foreground">
                      {isRtl ? activeCard.targetLabelAr : activeCard.targetLabelEn}
                    </span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-[#1F7A46] dark:text-primary" />
                </div>

                {needsAccountPrompt && sessionStatus !== 'authenticated' && (
                  <div className="rounded-2xl border border-[#1F7A46]/40 bg-[#E8EFE9]/70 dark:bg-accent/50 p-5 space-y-3">
                    <p className="text-sm font-extrabold text-foreground">
                      {isRtl
                        ? 'خطوة أخيرة: أنشئ حسابك أو سجل الدخول لحفظ تهيئة المقر'
                        : 'One final step: Create an account or sign in to activate your workspace'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRtl
                        ? 'تم حفظ بيانات التهيئة مؤقتاً — فور تسجيل الدخول ستُحفظ إعدادات منشأتك وتنتقل مباشرة إلى لوحة القيادة.'
                        : 'Your onboarding details are saved temporarily — once signed in, your workspace will be provisioned automatically.'}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Link
                        href={`/register?type=${activeCard.registerType}&callbackUrl=${encodeURIComponent('/onboarding')}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs transition"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isRtl ? 'إنشاء حساب جديد' : 'Create Account'}</span>
                      </Link>
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent('/onboarding')}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-card border border-border text-xs font-bold text-foreground hover:border-primary transition"
                      >
                        <LogIn className="w-4 h-4 text-primary" />
                        <span>{isRtl ? 'لدي حساب — تسجيل الدخول' : 'Sign In'}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setNeedsAccountPrompt(false)
                setStep((prev) => (prev === 3 ? 2 : 1))
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-xs sm:text-sm font-semibold text-foreground hover:border-primary/50 transition cursor-pointer"
            >
              {isRtl ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
              {isRtl ? 'الرجوع للخطوة السابقة' : 'Previous Step'}
            </button>
          ) : (
            <div className="text-xs text-muted-foreground">
              {isRtl
                ? 'يمكنك تعديل مسارك أو إضافة مساحات عمل لاحقاً من داخل المقر.'
                : 'You can customize or add workspaces anytime inside Maqar.'}
            </div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1F7A46] hover:bg-[#165832] text-white font-extrabold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <span>{isRtl ? 'متابعة' : 'Continue'}</span>
              {isRtl ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={handleCompleteOnboarding}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1F7A46] hover:bg-[#165832] text-white font-extrabold text-xs sm:text-sm shadow-xs transition disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isRtl ? 'جاري تهيئة المقر الرقمي...' : 'Provisioning Workspace...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? 'اعتماد التهيئة والانتقال إلى لوحة القيادة'
                      : 'Complete Setup & Launch Dashboard'}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
