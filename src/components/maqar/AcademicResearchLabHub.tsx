'use client'

import React, { useState } from 'react'
import {
  AlertCircle,
  Award,
  BookOpenCheck,
  Briefcase,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  PenTool,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useLang } from '@/lib/core/i18n'
import {
  runGroundedSemanticLegalSearch,
  type GroundedSemanticSearchResponse,
} from '@/lib/academic/semantic-rag'
import {
  DRAFTING_SIMULATION_SCENARIOS,
  evaluateStudentDraftingSubmission,
  type DraftingEvaluationResult,
} from '@/lib/academic/drafting-simulator'
import { MENTORSHIP_TALENT_PROFILES } from '@/lib/academic/talent-directory'

interface AcademicResearchLabHubProps {
  initialSection?: 'RAG_LAB' | 'DRAFTING_SIMULATOR' | 'TALENT_DIRECTORY'
}

export function AcademicResearchLabHub({
  initialSection = 'RAG_LAB',
}: AcademicResearchLabHubProps) {
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState<
    'RAG_LAB' | 'DRAFTING_SIMULATOR' | 'TALENT_DIRECTORY'
  >(initialSection)

  // 1. Semantic Legal Search (Strict Grounded RAG) State
  const [ragQuery, setRagQuery] = useState(
    'ما حكم تخفيض الشرط الجزائي المبالغ فيه مع التنفيذ الجزئي وفق المادة 179 من نظام المعاملات المدنية؟'
  )
  const [ragResult, setRagResult] = useState<GroundedSemanticSearchResponse>(() =>
    runGroundedSemanticLegalSearch(
      'ما حكم تخفيض الشرط الجزائي المبالغ فيه مع التنفيذ الجزئي وفق المادة 179 من نظام المعاملات المدنية؟'
    )
  )
  const [searchingRag, setSearchingRag] = useState(false)

  // 2. Student Drafting Simulator State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    DRAFTING_SIMULATION_SCENARIOS[0].id
  )
  const activeScenario =
    DRAFTING_SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    DRAFTING_SIMULATION_SCENARIOS[0]

  const [studentSubmission, setStudentSubmission] = useState<string>(
    'إلى مقام الدائرة التجارية بالمحكمة التجارية بالرياض، في القضية المقامة من المدعية ضد موكلتي المدعى عليها:\nندفع ببطلان شرط استبعاد رقابة القضاء لتعلقه بالنظام العام وفق المادة (179) من نظام المعاملات المدنية، كما نتمسك بـالتنفيذ الجزئي البالغ 85% بموجب محاضر استلام رسمية.\nالطلبات الختامية: نلتمس أصلياً رد الدعوى، واحتياطياً تخفيض الشرط الجزائي مع أتعاب المحاماة.'
  )
  const [simEvaluation, setSimEvaluation] =
    useState<DraftingEvaluationResult | null>(() =>
      evaluateStudentDraftingSubmission(
        DRAFTING_SIMULATION_SCENARIOS[0].id,
        'إلى مقام الدائرة التجارية بالمحكمة التجارية بالرياض، في القضية المقامة من المدعية ضد موكلتي المدعى عليها:\nندفع ببطلان شرط استبعاد رقابة القضاء لتعلقه بالنظام العام وفق المادة (179) من نظام المعاملات المدنية، كما نتمسك بـالتنفيذ الجزئي البالغ 85% بموجب محاضر استلام رسمية.\nالطلبات الختامية: نلتمس أصلياً رد الدعوى، واحتياطياً تخفيض الشرط الجزائي مع أتعاب المحاماة.'
      )
    )
  const [evaluatingDraft, setEvaluatingDraft] = useState(false)

  const handleRunSemanticSearch = async () => {
    if (!ragQuery.trim()) return
    setSearchingRag(true)
    try {
      const res = await fetch('/api/academic/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery, topK: 3 }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Search failed')
      setRagResult(json as GroundedSemanticSearchResponse)
    } catch {
      setRagResult(runGroundedSemanticLegalSearch(ragQuery))
    } finally {
      setSearchingRag(false)
    }
  }

  const handleEvaluateSubmission = async () => {
    setEvaluatingDraft(true)
    try {
      const res = await fetch('/api/academic/drafting-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          submissionText: studentSubmission,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Evaluation failed')
      setSimEvaluation(json as DraftingEvaluationResult)
      toast.success(
        lang === 'ar'
          ? 'تم تقييم المسودة وحساب درجات الدقة النظامية والدفوع الموضوعية'
          : 'Evaluated drafting submission & scored procedural/substantive accuracy'
      )
    } catch {
      setSimEvaluation(
        evaluateStudentDraftingSubmission(activeScenario.id, studentSubmission)
      )
    } finally {
      setEvaluatingDraft(false)
    }
  }

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sub-navigation Switcher for the 3 Academic & RAG Pillars */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('RAG_LAB')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RAG_LAB'
                ? 'bg-[#1F7A46] text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            <span>
              {lang === 'ar'
                ? '1. محرك البحث الدلالي المؤصل'
                : '1. Semantic Grounded RAG Search'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DRAFTING_SIMULATOR')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DRAFTING_SIMULATOR'
                ? 'bg-[#1F7A46] text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>
              {lang === 'ar'
                ? '2. مختبر الصياغة القضائية'
                : '2. Student Drafting Simulator'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TALENT_DIRECTORY')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TALENT_DIRECTORY'
                ? 'bg-[#1F7A46] text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>
              {lang === 'ar'
                ? '3. دليل المواهب والزمالة'
                : '3. Mentorship & Talent Directory'}
            </span>
          </button>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
          {lang === 'ar' ? 'توثيق نظامي مؤصل بدون هلوسة' : 'Grounded Citation Guard'}
        </span>
      </div>

      {/* =====================================================================
          TAB 1: SEMANTIC LEGAL SEARCH & STRICT GROUNDED RAG
         ===================================================================== */}
      {activeTab === 'RAG_LAB' && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#1F7A46] dark:text-emerald-400" />
                <span>
                  {lang === 'ar'
                    ? 'البحث القانوني الدلالي المؤصل في الأنظمة والسوابق'
                    : 'Vector-Embedded Semantic Legal RAG Assistant'}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === 'ar'
                  ? 'يلتزم المحرك بالاستشهاد الحرفي بأرقام المواد النظامية وأرقام المراسيم الملكية وتواريخها الرسمية دون أي هلوسة'
                  : 'Strictly grounded responses citing exact article numbers, Royal Decree numbers, and official Hijri/Gregorian dates'}
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
              {lang === 'ar' ? `بُعد التضمين: ${ragResult.embeddingDimension}` : `Vector Dim: ${ragResult.embeddingDimension}`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunSemanticSearch()}
              placeholder={
                lang === 'ar'
                  ? 'اسأل عن مادة نظامية، مرسوم ملكي، أو مبدأ للمحكمة العليا...'
                  : 'Search statutory articles, Royal Decrees, or Supreme Court principles...'
              }
              className="h-10 text-xs sm:text-sm rounded-xl flex-1"
            />
            <Button
              onClick={handleRunSemanticSearch}
              disabled={searchingRag}
              className="h-10 rounded-xl bg-[#1F7A46] hover:bg-[#176137] text-white font-semibold gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>
                {searchingRag
                  ? lang === 'ar'
                    ? 'جاري الاسترجاع...'
                    : 'Retrieving...'
                  : lang === 'ar'
                  ? 'بحث دلالي مؤصل'
                  : 'Semantic Search'}
              </span>
            </Button>
          </div>

          {/* Grounded Answer Box */}
          <div className="rounded-xl border border-[#1F7A46]/25 bg-[#1F7A46]/[0.05] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F7A46] dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                {lang === 'ar'
                  ? 'الإجابة المؤصلة من مدونة الأنظمة والسوابق الرسمية:'
                  : 'Strictly Grounded Statutory Response:'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                {ragResult.hallucinationGuardStatus}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed">
              {ragResult.groundedAnswer}
            </div>
          </div>

          {/* Retrieved Vector Citations */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {lang === 'ar'
                ? `المصادر النظامية والمراسيم الملكية المسترجعة (${ragResult.citations.length})`
                : `Retrieved Authoritative Citations (${ragResult.citations.length})`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ragResult.citations.map((cit) => (
                <div
                  key={cit.documentId}
                  className="rounded-xl border border-border bg-muted/35 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1F7A46]/10 text-[#1F7A46] dark:text-emerald-300 border border-[#1F7A46]/20">
                      {cit.articleNumber}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {Math.round(cit.similarityScore * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-foreground">
                    {cit.lawOrSourceName}
                  </p>
                  <p className="text-[11px] font-semibold text-[#1F7A46] dark:text-emerald-400">
                    {cit.officialDecreeNumber} • {cit.officialDecreeDateHijri} (
                    {cit.officialDecreeDateGregorian}م)
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    «{cit.verbatimExcerpt}»
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: STUDENT DRAFTING SIMULATOR (مختبر الصياغة القضائية)
         ===================================================================== */}
      {activeTab === 'DRAFTING_SIMULATOR' && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                <PenTool className="h-5 w-5 text-[#1F7A46] dark:text-emerald-400" />
                <span>
                  {lang === 'ar'
                    ? 'مختبر الصياغة القضائية والتنقيح التعاقدي'
                    : 'Interactive Legal Defense & Redlining Simulator'}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === 'ar'
                  ? 'اختر القضية التدريبية، قدّم مسودتك، واحصل فوراً على درجة الدقة اللغوية والنظامية والدفوع الفائتة'
                  : 'Submit simulated defenses or contract redlines for automated precision and substantive scoring'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {DRAFTING_SIMULATION_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setSelectedScenarioId(sc.id)
                    setStudentSubmission(sc.modelSolution.ar)
                    setSimEvaluation(
                      evaluateStudentDraftingSubmission(sc.id, sc.modelSolution.ar)
                    )
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedScenarioId === sc.id
                      ? 'bg-[#1F7A46] text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sc.type === 'PLEADING_DEFENSE'
                    ? lang === 'ar'
                      ? 'تمرين مذكرة دفاع (م/179)'
                      : 'Pleading Defense'
                    : lang === 'ar'
                    ? 'تمرين تنقيح عقد (م/53 وم/83)'
                    : 'Contract Redline'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 6 Cols: Scenario Brief & Student Editor */}
            <div className="lg:col-span-6 space-y-3">
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                <span className="text-[10px] font-bold text-[#1F7A46] dark:text-emerald-400">
                  {activeScenario.courtOrContext[lang]}
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground">
                  {activeScenario.title[lang]}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeScenario.caseFacts[lang]}
                </p>
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <strong>
                    {lang === 'ar' ? 'ادعاء الخصم / البند المعيب:' : 'Opposing Claim / Flawed Clause:'}
                  </strong>{' '}
                  {activeScenario.opposingClaimOrFlawedClause[lang]}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  {lang === 'ar'
                    ? 'مسودة الطالب (اكتب دفوعك الشكلية والموضوعية أو صياغتك البديلة):'
                    : 'Your Simulated Pleading / Redline Submission:'}
                </label>
                <textarea
                  value={studentSubmission}
                  onChange={(e) => setStudentSubmission(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-xs leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-[#1F7A46]/35"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={evaluatingDraft}
                    onClick={handleEvaluateSubmission}
                    className="rounded-xl bg-[#1F7A46] hover:bg-[#176137] text-white font-semibold gap-1.5 cursor-pointer"
                  >
                    <Scale className="h-4 w-4" />
                    <span>
                      {lang === 'ar'
                        ? 'تحكيم الصياغة وحساب الدرجة'
                        : 'Evaluate Pleading Precision'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Automated Evaluation Scorecard */}
            <div className="lg:col-span-6 space-y-4">
              {simEvaluation && (
                <div className="rounded-xl border border-border bg-muted/35 p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="rounded-xl bg-background border border-border p-3">
                      <span className="text-[10px] text-muted-foreground block">
                        {lang === 'ar' ? 'الدقة اللغوية والنظامية' : 'Linguistic Precision'}
                      </span>
                      <strong className="text-xl font-extrabold text-[#1F7A46] dark:text-emerald-400">
                        {simEvaluation.linguisticAndLegalPrecisionScore}%
                      </strong>
                    </div>
                    <div className="rounded-xl bg-background border border-border p-3">
                      <span className="text-[10px] text-muted-foreground block">
                        {lang === 'ar' ? 'سلامة الإجراءات الشكلية' : 'Procedural Accuracy'}
                      </span>
                      <strong className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {simEvaluation.proceduralCorrectnessScore}%
                      </strong>
                    </div>
                    <div className="rounded-xl bg-background border border-border p-3">
                      <span className="text-[10px] text-muted-foreground block">
                        {lang === 'ar' ? 'استيفاء الدفوع الموضوعية' : 'Substantive Coverage'}
                      </span>
                      <strong className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                        {simEvaluation.substantiveCompletenessScore}%
                      </strong>
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#123D24] dark:bg-[#0D2B1A] text-white p-3 text-xs leading-relaxed">
                    <span className="font-bold text-emerald-300 block mb-1">
                      {lang === 'ar'
                        ? `التقييم العام (${simEvaluation.overallGrade}):`
                        : `Coach Assessment (${simEvaluation.overallGrade}):`}
                    </span>
                    {simEvaluation.coachFeedback[lang]}
                  </div>

                  {simEvaluation.detectedSubstantiveArguments.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {lang === 'ar'
                          ? 'الدفوع والأسانيد الصحيحة المرصودة في مذكرتك:'
                          : 'Detected Substantive Counterarguments:'}
                      </p>
                      {simEvaluation.detectedSubstantiveArguments.map((arg, i) => (
                        <div
                          key={i}
                          className="text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 text-foreground"
                        >
                          ✓ {arg[lang]}
                        </div>
                      ))}
                    </div>
                  )}

                  {simEvaluation.missedSubstantiveCounterarguments.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {lang === 'ar'
                          ? 'الدفوع الموضوعية والأسانيد الفائتة التي يجب إضافتها:'
                          : 'Missed Substantive Counterarguments:'}
                      </p>
                      {simEvaluation.missedSubstantiveCounterarguments.map((m, i) => (
                        <div
                          key={i}
                          className="text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 text-foreground"
                        >
                          <p className="font-semibold">{m[lang]}</p>
                          <span className="text-[10px] font-mono text-rose-600 dark:text-rose-300">
                            السند: {m.statutoryBasis}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: MENTORSHIP & TALENT DIRECTORY
         ===================================================================== */}
      {activeTab === 'TALENT_DIRECTORY' && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-[#1F7A46] dark:text-emerald-400" />
                <span>
                  {lang === 'ar'
                    ? 'دليل المواهب القانونية واستقطاب المتدربين'
                    : 'Verified Legal Talent & Law Firm Recruitment Directory'}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === 'ar'
                  ? 'ملفات طلاب القانون الموثقة بأوراقهم البحثية المحكّمة ونتائج مختبر الصياغة لاستقطابهم في مكاتب المحاماة والشركات الشريكة'
                  : 'Showcases verified student research memos, academic standing, and simulator scores to partner law firms'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {MENTORSHIP_TALENT_PROFILES.map((stu) => (
              <div
                key={stu.id}
                className="rounded-2xl border border-border bg-muted/35 p-4 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-foreground">
                        {stu.fullName[lang]}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {stu.university[lang]}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1F7A46]/10 text-[#1F7A46] dark:text-emerald-300 border border-[#1F7A46]/25">
                      GPA {stu.gpa}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-background px-3 py-2 rounded-xl border border-border">
                    <span className="text-muted-foreground">
                      {lang === 'ar' ? 'درجة مختبر الصياغة:' : 'Simulator Score:'}
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {stu.draftingSimulatorAvgScore}/100
                    </strong>
                  </div>

                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    <span>{stu.mootCourtHonors[lang]}</span>
                  </p>

                  {/* Verified Research Memos */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <BookOpenCheck className="h-3.5 w-3.5 text-[#1F7A46] dark:text-emerald-400" />
                      {lang === 'ar'
                        ? 'الأبحاث والمذكرات القانونية الموثقة:'
                        : 'Verified Research Memos:'}
                    </span>
                    {stu.verifiedMemos.map((memo) => (
                      <div
                        key={memo.id}
                        className="rounded-xl bg-background border border-border p-2.5 text-xs space-y-1"
                      >
                        <p className="font-bold text-foreground leading-snug">
                          {memo.title[lang]}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{memo.verifiedByProfessor}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {memo.precisionScore}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    toast.success(
                      lang === 'ar'
                        ? `تم إرسال دعوة مقابلة تدريب تعاوني/زمالة إلى: ${stu.fullName.ar}`
                        : `Sent internship recruitment invitation to ${stu.fullName.en}`
                    )
                  }
                  className="w-full rounded-xl bg-[#1F7A46] hover:bg-[#176137] text-white font-semibold gap-1.5 text-xs cursor-pointer"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>
                    {lang === 'ar'
                      ? 'إرسال عرض تدريب / استقطاب للمكتب'
                      : 'Invite for Law Firm Internship'}
                  </span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

