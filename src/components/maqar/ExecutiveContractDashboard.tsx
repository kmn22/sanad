'use client'

import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  CalendarClock,
  CheckCircle2,
  Copy,
  FileCheck2,
  FileSignature,
  Gavel,
  Scale,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useLang } from '@/lib/core/i18n'
import {
  CLM_STAGE_METADATA,
  getAllowedNextStages,
  type ClmStage,
} from '@/lib/clm/state-machine'
import { GOLDEN_CLAUSE_REPOSITORY, type GoldenClauseTemplate } from '@/lib/clm/clause-repository'
import { useClauseAnalyzer, useClmStateMachine } from '@/hooks/useClauseAnalyzer'

export interface ClmPortfolioContract {
  id: string
  title: { ar: string; en: string }
  counterparty: { ar: string; en: string }
  contractType: string
  stage: ClmStage
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  liabilityCapSar: number
  uncappedLiability: boolean
  daysToExpiry: number
  signatureProgress: number // 0 - 100
}

const SAMPLE_CLM_PORTFOLIO: ClmPortfolioContract[] = [
  {
    id: 'CLM-2026-901',
    title: {
      ar: 'اتفاقية الاستضافة السحابية السيادية والخدمات المدارة (MSA)',
      en: 'Sovereign Cloud Hosting & Managed Services Agreement (MSA)',
    },
    counterparty: { ar: 'شركة سحابة المدار للتقنية', en: 'Al-Madar Cloud Technologies' },
    contractType: 'MSA',
    stage: 'ACTIVE',
    riskLevel: 'LOW',
    liabilityCapSar: 2_400_000,
    uncappedLiability: false,
    daysToExpiry: 22,
    signatureProgress: 100,
  },
  {
    id: 'CLM-2026-902',
    title: {
      ar: 'عقد توريد وتكامل أنظمة أمن المعلومات (NCA-ECC)',
      en: 'Cybersecurity Systems Supply & Integration Contract',
    },
    counterparty: { ar: 'المجموعة الوطنية للأنظمة الرقمية', en: 'National Digital Systems Corp' },
    contractType: 'SUPPLY',
    stage: 'AI_CLAUSE_RISK_AUDIT',
    riskLevel: 'HIGH',
    liabilityCapSar: 5_800_000,
    uncappedLiability: true,
    daysToExpiry: 47,
    signatureProgress: 40,
  },
  {
    id: 'CLM-2026-903',
    title: {
      ar: 'اتفاقية معالجة البيانات الشخصية والامتثال لنظام سدايا (DPA)',
      en: 'Personal Data Processing & SDAIA Compliance Addendum (DPA)',
    },
    counterparty: { ar: 'منصة التحليلات المالية المتقدمة', en: 'FinAnalytics Platform Ltd' },
    contractType: 'DPA',
    stage: 'DIGITAL_SIGNATURE_DISPATCH',
    riskLevel: 'MEDIUM',
    liabilityCapSar: 1_250_000,
    uncappedLiability: false,
    daysToExpiry: 19,
    signatureProgress: 85,
  },
  {
    id: 'CLM-2026-904',
    title: {
      ar: 'عقد عمل تنفيذي — رئيس قطاع الحوكمة والامتثال',
      en: 'Executive Employment Agreement — VP of Governance & Compliance',
    },
    counterparty: { ar: 'المستشار التنفيذي / أ. طارق العتيبي', en: 'Tariq Al-Otaibi (VP GRC)' },
    contractType: 'EMPLOYMENT',
    stage: 'APPROVAL_WORKFLOW',
    riskLevel: 'MEDIUM',
    liabilityCapSar: 780_000,
    uncappedLiability: false,
    daysToExpiry: 55,
    signatureProgress: 60,
  },
]

const SAMPLE_AUDIT_CONTRACT_TEXT =
  'يلتزم الطرف الثاني بتعويض الطرف الأول عن كافة الأضرار المباشرة وغير المباشرة وفوات الربح بمسؤولية غير محدودة دون سقف مالي. كما يتفق الطرفان على غرامة تأخير وشرط جزائي قطعي غير قابل للتخفيض ولا يخضع لرقابة القضاء. ويلتزم العامل بعدم المنافسة لمدة خمس سنوات في جميع أنحاء المملكة، وتكون فترة التجربة 180 يوماً، كما يجوز نقل البيانات الشخصية لخوادم خارج المملكة.'

const ORDERED_PIPELINE_STAGES: ClmStage[] = [
  'DRAFT',
  'INTERNAL_REVIEW',
  'AI_CLAUSE_RISK_AUDIT',
  'APPROVAL_WORKFLOW',
  'DIGITAL_SIGNATURE_DISPATCH',
  'ACTIVE',
  'ARCHIVED',
]

export function ExecutiveContractDashboard() {
  const { lang } = useLang()
  const [expiryWindow, setExpiryWindow] = useState<30 | 60>(30)
  const [clauseSearch, setClauseSearch] = useState('')
  const [clauseCategory, setClauseCategory] = useState<string>('ALL')
  const [contractText, setContractText] = useState(SAMPLE_AUDIT_CONTRACT_TEXT)

  const { report, analyzing, analyzeContract } = useClauseAnalyzer()
  const { stage, transitioning, transitionError, transitionTo } =
    useClmStateMachine('AI_CLAUSE_RISK_AUDIT')

  const expiringContracts = useMemo(
    () => SAMPLE_CLM_PORTFOLIO.filter((c) => c.daysToExpiry <= expiryWindow),
    [expiryWindow]
  )

  const totalActiveLiabilitySar = useMemo(
    () => SAMPLE_CLM_PORTFOLIO.reduce((sum, c) => sum + c.liabilityCapSar, 0),
    []
  )

  const uncappedCount = useMemo(
    () => SAMPLE_CLM_PORTFOLIO.filter((c) => c.uncappedLiability).length,
    []
  )

  const avgSignatureCompletion = useMemo(() => {
    const sum = SAMPLE_CLM_PORTFOLIO.reduce((acc, c) => acc + c.signatureProgress, 0)
    return Math.round(sum / SAMPLE_CLM_PORTFOLIO.length)
  }, [])

  const filteredClauses = useMemo(() => {
    const q = clauseSearch.trim().toLowerCase()
    return GOLDEN_CLAUSE_REPOSITORY.filter((c) => {
      if (clauseCategory !== 'ALL' && c.category !== clauseCategory) return false
      if (!q) return true
      return (
        c.title.ar.toLowerCase().includes(q) ||
        c.title.en.toLowerCase().includes(q) ||
        c.clauseBody.ar.toLowerCase().includes(q) ||
        c.clauseBody.en.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [clauseSearch, clauseCategory])

  const handleCopyClause = (clause: GoldenClauseTemplate) => {
    navigator.clipboard?.writeText(clause.clauseBody[lang])
    toast.success(
      lang === 'ar'
        ? `تم نسخ البند المعتمد: ${clause.title.ar}`
        : `Copied standard clause: ${clause.title.en}`
    )
  }

  const handleAdvanceStage = async (target: ClmStage) => {
    const res = await transitionTo(target, {
      riskAuditCompleted: Boolean(report) || stage !== 'AI_CLAUSE_RISK_AUDIT',
      riskLevel: report?.overallRiskScore || 'MEDIUM',
      approverApproved: true,
      signatureEnvelopeId: 'ENV-MAQAR-2026-SIG',
    })
    if (res?.allowed) {
      toast.success(
        lang === 'ar'
          ? `تم انتقال العقد إلى مرحلة: ${CLM_STAGE_METADATA[target].label.ar}`
          : `Contract transitioned to: ${CLM_STAGE_METADATA[target].label.en}`
      )
    }
  }

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* 1. Executive KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: Expiring Contracts (30 / 60 days toggle) */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {lang === 'ar' ? 'العقود المقاربة للانتهاء' : 'Expiring Contracts'}
            </span>
            <div className="flex items-center rounded-lg bg-muted p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setExpiryWindow(30)}
                className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                  expiryWindow === 30
                    ? 'bg-[#1F7A46] text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                30D
              </button>
              <button
                type="button"
                onClick={() => setExpiryWindow(60)}
                className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                  expiryWindow === 60
                    ? 'bg-[#1F7A46] text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                60D
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              {expiringContracts.length}
            </p>
            <CalendarClock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {lang === 'ar'
              ? `خلال الـ ${expiryWindow} يوماً القادمة (تتطلب إشعار تجديد)`
              : `Within next ${expiryWindow} days (renewal notice window)`}
          </p>
        </div>

        {/* Card B: Active Financial Liabilities */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {lang === 'ar' ? 'إجمالي الالتزامات وسقف المسؤولية' : 'Active Contractual Liabilities'}
            </span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground tabular-nums">
            {(totalActiveLiabilitySar / 1_000_000).toFixed(2)}M{' '}
            <span className="text-xs font-semibold text-muted-foreground">SAR</span>
          </p>
          <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            {uncappedCount}{' '}
            {lang === 'ar'
              ? 'عقد يتضمن مسؤولية مفتوحة غير مسقوفة'
              : 'contract with uncapped indemnity exposure'}
          </p>
        </div>

        {/* Card C: Digital Signature Completion Rate */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {lang === 'ar' ? 'معدل استكمال التوقيع الرقمي' : 'Signature Completion Rate'}
            </span>
            <FileSignature className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {avgSignatureCompletion}%
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1F7A46] transition-all"
              style={{ width: `${avgSignatureCompletion}%` }}
            />
          </div>
        </div>

        {/* Card D: Golden Clause Repository Index */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {lang === 'ar' ? 'مستودع البنود القياسية المعتمدة' : 'Golden Clause Repository'}
            </span>
            <BookMarked className="h-4 w-4 text-[#1F7A46] dark:text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-[#1F7A46] dark:text-emerald-400 tabular-nums">
            {GOLDEN_CLAUSE_REPOSITORY.length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {lang === 'ar'
              ? 'متوافقة مع المعاملات المدنية، العمل، وسدايا'
              : 'Aligned with Civil, Labor & SDAIA PDPL'}
          </p>
        </div>
      </div>

      {/* 2. Interactive Contract Lifecycle State Machine Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#1F7A46]/10 text-[#1F7A46] dark:text-emerald-300 border border-[#1F7A46]/20">
              {lang === 'ar' ? 'إدارة دورة حياة العقد' : 'Contract Lifecycle'}
            </span>
            <h3 className="text-base font-bold text-foreground mt-1.5">
              {lang === 'ar'
                ? 'محرك انتقال مراحل دورة حياة العقد'
                : 'Contract Lifecycle State Machine Pipeline'}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {getAllowedNextStages(stage).map((nextStage) => (
              <Button
                key={nextStage}
                size="sm"
                disabled={transitioning}
                onClick={() => handleAdvanceStage(nextStage)}
                className="h-8 text-xs rounded-xl bg-[#1F7A46] hover:bg-[#176137] text-white font-semibold gap-1.5 cursor-pointer"
              >
                <span>
                  {lang === 'ar'
                    ? `انتقال إلى: ${CLM_STAGE_METADATA[nextStage].label.ar}`
                    : `Transition: ${CLM_STAGE_METADATA[nextStage].label.en}`}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        </div>

        {/* Visual Pipeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {ORDERED_PIPELINE_STAGES.map((s, idx) => {
            const meta = CLM_STAGE_METADATA[s]
            const isCurrent = s === stage
            const currentIdx = ORDERED_PIPELINE_STAGES.indexOf(stage)
            const isCompleted = idx < currentIdx

            return (
              <button
                key={s}
                type="button"
                onClick={() => handleAdvanceStage(s)}
                className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#1F7A46] bg-[#1F7A46]/10 text-foreground shadow-xs'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                    : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span>0{idx + 1}</span>
                  {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <p className="text-xs font-bold truncate">{meta.label[lang]}</p>
              </button>
            )
          })}
        </div>

        {transitionError && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
            {transitionError}
          </p>
        )}
      </div>

      {/* 3. Two-Column Main Workspace: AI Clause Risk Auditor + Expiring Contracts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: AI Clause Risk Audit Service */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#1F7A46] dark:text-emerald-400" />
                <h3 className="text-base font-bold text-foreground">
                  {lang === 'ar'
                    ? 'مدقق مخاطر البنود التعاقدية بالذكاء الاصطناعي'
                    : 'AI Statutory Clause Risk Auditor'}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === 'ar'
                  ? 'يكتشف الاختصاص النظامي تلقائياً ويحدد الالتزامات المفتوحة والشروط الجزائية الغامضة والبدائل النظامية'
                  : 'Detects jurisdiction, uncapped liabilities, ambiguous penalties, and generates statutory substitutes'}
              </p>
            </div>
            <Button
              size="sm"
              disabled={analyzing}
              onClick={() => analyzeContract(contractText)}
              className="bg-[#1F7A46] hover:bg-[#176137] text-white font-semibold rounded-xl gap-1.5 shrink-0 cursor-pointer"
            >
              <Scale className="h-4 w-4" />
              <span>
                {analyzing
                  ? lang === 'ar'
                    ? 'جاري الفحص...'
                    : 'Auditing...'
                  : lang === 'ar'
                  ? 'تحليل المخاطر الآن'
                  : 'Run Clause Audit'}
              </span>
            </Button>
          </div>

          <textarea
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-[#1F7A46]/35"
            placeholder={
              lang === 'ar'
                ? 'الصق نص العقد أو البنود المراد فحصها هنا...'
                : 'Paste contract text or clauses to audit...'
            }
          />

          {report && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/50 p-3 rounded-xl border border-border">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {lang === 'ar' ? 'الاختصاص النظامي المكتشف' : 'Detected Jurisdiction'}
                  </span>
                  <p className="text-xs font-bold text-foreground">
                    {report.jurisdiction.label[lang]}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      report.overallRiskScore === 'HIGH'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : report.overallRiskScore === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {lang === 'ar' ? 'مستوى المخاطر:' : 'Risk:'} {report.overallRiskScore}
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#1F7A46] text-white">
                    {report.numericComplianceScore}/100
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pe-1">
                {report.findings.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border border-border p-3.5 space-y-2 bg-background/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {f.statutoryReference[lang]}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {f.severity}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {f.issueExplanation[lang]}
                    </p>

                    <div className="rounded-lg bg-emerald-500/[0.08] border border-emerald-500/25 p-2.5">
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                        {lang === 'ar'
                          ? 'البند البديل المقترح المتوافق نظاماً:'
                          : 'Recommended Statutory Substitute Clause:'}
                      </p>
                      <p className="text-xs text-foreground leading-relaxed">
                        {f.recommendedSubstituteClause[lang]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Expiring Contracts & Active Liabilities Watchlist */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                {lang === 'ar'
                  ? 'سجل العقود الحرجة والالتزامات السارية'
                  : 'Expiring Contracts & Liability Watchlist'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === 'ar'
                  ? `عرض العقود المنتهية خلال ${expiryWindow} يوماً وحالة التوقيع`
                  : `Showing contracts within ${expiryWindow}d window & signature progress`}
              </p>
            </div>
            <FileCheck2 className="h-5 w-5 text-[#1F7A46] dark:text-emerald-400" />
          </div>

          <div className="space-y-3">
            {SAMPLE_CLM_PORTFOLIO.map((c) => {
              const isUrgentExpiry = c.daysToExpiry <= expiryWindow
              return (
                <div
                  key={c.id}
                  className={`rounded-xl border p-3.5 transition-all ${
                    isUrgentExpiry
                      ? 'border-amber-500/40 bg-amber-500/[0.04]'
                      : 'border-border bg-muted/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {c.title[lang]}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {c.counterparty[lang]} • <span className="font-mono">{c.id}</span>
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.daysToExpiry <= 30
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {c.daysToExpiry} {lang === 'ar' ? 'يوم' : 'days'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {lang === 'ar' ? 'سقف المسؤولية:' : 'Liability Cap:'}{' '}
                      <strong className="text-foreground">
                        {`${(c.liabilityCapSar / 1_000_000).toFixed(2)}M SAR`}
                      </strong>
                    </span>
                    <span>
                      {lang === 'ar' ? 'التوقيع:' : 'Signed:'} <strong className="text-foreground">{c.signatureProgress}%</strong>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. Interactive Golden Clause Repository */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Gavel className="h-4 w-4 text-[#1F7A46] dark:text-emerald-400" />
              <span>
                {lang === 'ar'
                  ? 'مستودع البنود التعاقدية القياسية المعتمدة'
                  : 'Interactive Statutory Clause Repository'}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === 'ar'
                ? 'بنود مرجعية محكّمة جاهزة للإدراج المباشر في العقود لتقليل المخاطر النظامية'
                : 'Pre-vetted statutory clauses ready for one-click insertion into contract drafts'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={clauseSearch}
              onChange={(e) => setClauseSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في البنود والمواد...' : 'Search clauses or statutes...'}
              className="h-8 text-xs w-52 rounded-xl"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'ALL', ar: 'الكل', en: 'All' },
              { id: 'COMMERCIAL', ar: 'العقود التجارية', en: 'Commercial' },
              { id: 'LIABILITY_CAP', ar: 'سقف المسؤولية', en: 'Liability Cap' },
              { id: 'LABOR', ar: 'نظام العمل', en: 'Labor' },
              { id: 'DATA_PRIVACY', ar: 'حماية البيانات', en: 'Data Privacy' },
              { id: 'DISPUTE_RESOLUTION', ar: 'تسوية النزاعات', en: 'Disputes' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setClauseCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                clauseCategory === cat.id
                  ? 'bg-[#1F7A46] text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {lang === 'ar' ? cat.ar : cat.en}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClauses.map((clause) => (
            <div
              key={clause.id}
              className="rounded-xl border border-border bg-muted/35 p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1F7A46]/10 text-[#1F7A46] dark:text-emerald-300 border border-[#1F7A46]/25">
                    {clause.statuteReference[lang]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyClause(clause)}
                    className="h-7 px-2 text-xs gap-1 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{lang === 'ar' ? 'نسخ البند' : 'Copy'}</span>
                  </Button>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  {clause.title[lang]}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {clause.clauseBody[lang]}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border">
                {clause.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
