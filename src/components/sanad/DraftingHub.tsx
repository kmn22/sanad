'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  FileText,
  Scale,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
  Copy,
  Download,
  Save,
  ArrowRight,
  ArrowLeft,
  Bot,
  Loader2,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { SmartEditor } from './SmartEditor'
import { TEMPLATES } from '@/lib/sanad/drafting/templates'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SAUDI_STANDARD_CLAUSES } from '@/lib/sanad/drafting/standardClauses'
import { evaluateSafeguards } from '@/lib/sanad/drafting/regulatorySafeguards'
import type { TemplateId, DocumentCategory, DocumentTemplate } from '@/lib/sanad/drafting/types'
import type { LegalCase } from '@/lib/sanad/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  cases: LegalCase[]
  initialTemplateId?: TemplateId
  initialCaseId?: string
  onDocumentSaved?: () => void
}

export function DraftingHub({
  open,
  onOpenChange,
  cases,
  initialTemplateId = 'employment',
  initialCaseId,
  onDocumentSaved,
}: Props) {
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  // Wizard state: 1: Select Template, 2: Questionnaire, 3: Review & Edit
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [category, setCategory] = useState<DocumentCategory>('contract')
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(initialTemplateId)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCaseId || '')
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentTemplate: DocumentTemplate = TEMPLATES[selectedTemplateId] || TEMPLATES.employment

  // Sync initial state when modal opens or props change
  useEffect(() => {
    if (open) {
      if (initialTemplateId && TEMPLATES[initialTemplateId]) {
        setSelectedTemplateId(initialTemplateId)
        setCategory(TEMPLATES[initialTemplateId].category)
        setStep(2) // Jump straight to questionnaire if specifically invoked
      } else {
        setStep(1)
      }
      if (initialCaseId) {
        setSelectedCaseId(initialCaseId)
        const targetCase = cases.find((c) => c.id === initialCaseId)
        if (targetCase) {
          // Pre-fill answers from case data
          setAnswers((prev) => ({
            ...prev,
            caseNumber: targetCase.caseNumber || '',
            courtCircuit: targetCase.court || '',
            plaintiffName: targetCase.clientName || '',
            defendantName: targetCase.opposingParty || '',
            facts: targetCase.notes || targetCase.title || '',
          }))
        }
      }
    }
  }, [open, initialTemplateId, initialCaseId, cases])

  // Reset default answers when template changes
  const handleSelectTemplate = (id: TemplateId) => {
    setSelectedTemplateId(id)
    const tmpl = TEMPLATES[id]
    const defaultAnswers: Record<string, any> = {}
    tmpl.fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        defaultAnswers[f.id] = f.defaultValue
      }
    })

    // Retain case-linked answers if available
    if (selectedCaseId) {
      const targetCase = cases.find((c) => c.id === selectedCaseId)
      if (targetCase) {
        defaultAnswers.caseNumber = targetCase.caseNumber || ''
        defaultAnswers.courtCircuit = targetCase.court || ''
        defaultAnswers.plaintiffName = targetCase.clientName || ''
        defaultAnswers.defendantName = targetCase.opposingParty || ''
      }
    }

    setAnswers(defaultAnswers)
    setStep(2)
  }

  // Evaluate real-time regulatory safeguards
  const activeSafeguards = useMemo(() => {
    return evaluateSafeguards(selectedTemplateId, answers)
  }, [selectedTemplateId, answers])

  const handleFieldChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }))
  }

  // Generate document via Ollama or Fallback
  const handleGenerate = async () => {
    setIsGenerating(true)
    const promptSummary = `
نوع الوثيقة: ${currentTemplate.titleAr}
البيانات والمحددات:
${JSON.stringify(answers, null, 2)}
`.trim()

    let result = ''
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `قم بصياغة ${currentTemplate.titleAr} بالاعتماد على البيانات التالية وفق الأنظمة القضائية السعودية الصادرة:\n${promptSummary}`,
          docType: currentTemplate.defaultDocType,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.draft && data.draft.trim().length > 50) {
          result = data.draft
        }
      }
    } catch (e) {
      console.warn('Ollama generation not responding, using deterministic legal template:', e)
    }

    // If local LLM is offline or returned empty, use deterministic Saudi legal template
    if (!result) {
      result = currentTemplate.generateFallback(answers)
    }

    setGeneratedMarkdown(result)
    setIsGenerating(false)
    setStep(3)
  }

  // Save to database
  const handleSaveToDatabase = async () => {
    if (!generatedMarkdown.trim()) return
    setIsSaving(true)
    try {
      const payload = {
        title: `${currentTemplate.titleAr} - ${new Date().toLocaleDateString('ar-SA')}`,
        docType: currentTemplate.defaultDocType,
        status: 'draft',
        parties: answers.employeeName || answers.receivingParty || answers.defendantName || answers.firstParty || 'أطراف العقد',
        notes: `تم التوليد آلياً عبر محرك الصياغة القانونية.\n${activeSafeguards.map((s) => `[${s.law}]: ${s.messageAr}`).join('\n')}`,
        caseId: selectedCaseId || null,
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(isAr ? 'تم حفظ الوثيقة في قاعدة البيانات بنجاح' : 'Document saved successfully')
        onDocumentSaved?.()
        onOpenChange(false)
      } else {
        const err = await res.json()
        toast.error(err.error || (isAr ? 'فشل حفظ الوثيقة' : 'Failed to save document'))
      }
    } catch {
      toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(isAr ? 'تم نسخ نص الوثيقة إلى الحافظة' : 'Copied to clipboard')
  }

  const handleDownload = () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentTemplate.id}-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(isAr ? 'جاري تنزيل الملف' : 'Downloading file')
  }

  const handleInsertClause = (clauseText: string, clauseTitle: string) => {
    setGeneratedMarkdown((prev) => `${prev.trim()}\n\n${clauseText}\n`)
    toast.success(isAr ? `تم إدراج ${clauseTitle} في المسودة` : `Clause inserted into draft`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-6 overflow-hidden glass-panel border border-border/80 shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="border-b border-border/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-2xs">
                {category === 'contract' ? <FileText className="h-5 w-5" /> : <Scale className="h-5 w-5" />}
              </div>
              <div className="text-start">
                <DialogTitle className="text-base sm:text-lg font-bold">
                  {isAr ? 'محرك أتمتة العقود والمذكرات القضائية' : 'Contract & Pleading Automation Hub'}
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isAr
                    ? 'صياغة نظامية فورية متوافقة مع نظام المعاملات المدنية، نظام العمل، وتصنيفات منصة ناجز'
                    : 'Instant legal drafting compliant with Saudi civil, labor, and judicial procedural laws'}
                </p>
              </div>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                step === 1 ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20' : 'bg-muted/70 text-muted-foreground'
              }`}>
                <span className="h-4 w-4 rounded-full bg-background/20 grid place-items-center text-[10px]">1</span>
                <span>{isAr ? 'نوع المستند' : 'Template'}</span>
              </div>
              <span className="text-muted-foreground/40 font-mono">→</span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                step === 2 ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20' : 'bg-muted/70 text-muted-foreground'
              }`}>
                <span className="h-4 w-4 rounded-full bg-background/20 grid place-items-center text-[10px]">2</span>
                <span>{isAr ? 'البيانات والأطراف' : 'Details'}</span>
              </div>
              <span className="text-muted-foreground/40 font-mono">→</span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                step === 3 ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20' : 'bg-muted/70 text-muted-foreground'
              }`}>
                <span className="h-4 w-4 rounded-full bg-background/20 grid place-items-center text-[10px]">3</span>
                <span>{isAr ? 'المراجعة والاعتماد' : 'Review'}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* STEP 1: SELECT TEMPLATE */}
          {step === 1 && (
            <div className="space-y-6">
              <Tabs value={category} onValueChange={(v) => setCategory(v as DocumentCategory)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="contract" className="gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{isAr ? 'العقود والاتفاقيات التجارية' : 'Commercial Contracts'}</span>
                  </TabsTrigger>
                  <TabsTrigger value="pleading" className="gap-2">
                    <Scale className="h-4 w-4" />
                    <span>{isAr ? 'اللوائح والمذكرات القضائية (ناجز)' : 'Litigation & Court Pleadings'}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contract" className="mt-0 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {Object.values(TEMPLATES)
                      .filter((t) => t.category === 'contract')
                      .map((tmpl) => (
                        <div
                          key={tmpl.id}
                          onClick={() => handleSelectTemplate(tmpl.id)}
                          className="rounded-2xl border border-border/80 bg-card/60 p-4 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs glass-card-hover"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                {isAr ? tmpl.titleAr : tmpl.titleEn}
                              </h4>
                              <Badge variant="outline" className="text-[10px] bg-muted/60">
                                {tmpl.fields.length} {isAr ? 'حقول' : 'fields'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {isAr ? tmpl.descriptionAr : tmpl.descriptionEn}
                            </p>
                          </div>
                          <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-primary font-semibold">
                            <span>{isAr ? 'بدء الصياغة' : 'Start Drafting'}</span>
                            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px]" />
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="pleading" className="mt-0 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {Object.values(TEMPLATES)
                      .filter((t) => t.category === 'pleading')
                      .map((tmpl) => (
                        <div
                          key={tmpl.id}
                          onClick={() => handleSelectTemplate(tmpl.id)}
                          className="rounded-2xl border border-border/80 bg-card/60 p-4 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs glass-card-hover"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                {isAr ? tmpl.titleAr : tmpl.titleEn}
                              </h4>
                              <Badge variant="secondary" className="text-[10px]">
                                {isAr ? 'متوافق مع ناجز' : 'Najiz Ready'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {isAr ? tmpl.descriptionAr : tmpl.descriptionEn}
                            </p>
                          </div>
                          <div className="mt-4 pt-2 border-t flex items-center justify-between text-xs text-primary font-medium">
                            <span>{isAr ? 'إعداد المذكرة' : 'Draft Pleading'}</span>
                            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* STEP 2: QUESTIONNAIRE & REGULATORY SAFEGUARDS */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Fields (2 Columns) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                  <div>
                    <h3 className="font-semibold text-sm">{isAr ? currentTemplate.titleAr : currentTemplate.titleEn}</h3>
                    <p className="text-xs text-muted-foreground">{isAr ? currentTemplate.descriptionAr : currentTemplate.descriptionEn}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs h-7">
                    {isAr ? 'تغيير النموذج' : 'Change Template'}
                  </Button>
                </div>

                {/* Case Link Selector if cases exist */}
                {cases.length > 0 && (
                  <div className="space-y-1.5 bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <Label htmlFor="case-link" className="text-xs font-semibold text-primary">
                      {isAr ? 'ربط مباشر بقضية قائمة (لسحب البيانات تلقائياً):' : 'Link to Existing Case:'}
                    </Label>
                    <Select
                      value={selectedCaseId}
                      onValueChange={(val) => {
                        setSelectedCaseId(val)
                        const c = cases.find((item) => item.id === val)
                        if (c) {
                          setAnswers((prev) => ({
                            ...prev,
                            caseNumber: c.caseNumber || prev.caseNumber || '',
                            courtCircuit: c.court || prev.courtCircuit || '',
                            plaintiffName: c.clientName || prev.plaintiffName || '',
                            defendantName: c.opposingParty || prev.defendantName || '',
                            facts: c.notes || c.title || prev.facts || '',
                          }))
                          toast.success(isAr ? `تم ربط القضية: ${c.title}` : `Linked case: ${c.title}`)
                        }
                      }}
                    >
                      <SelectTrigger id="case-link" className="h-8 text-xs">
                        <SelectValue placeholder={isAr ? 'اختر قضية من السجل...' : 'Select a case...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {cases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title} ({c.caseNumber || 'بدون رقم قيد'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Dynamic Fields */}
                <div className="space-y-3 pt-1">
                  {currentTemplate.fields.map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={f.id} className="text-xs font-medium">
                          {isAr ? f.labelAr : f.labelEn}
                          {f.required && <span className="text-destructive mx-1">*</span>}
                        </Label>
                        {f.helpTextAr && (
                          <span className="text-[10px] text-muted-foreground">{isAr ? f.helpTextAr : f.helpTextEn}</span>
                        )}
                      </div>

                      {f.type === 'text' && (
                        <Input
                          id={f.id}
                          value={answers[f.id] ?? ''}
                          onChange={(e) => handleFieldChange(f.id, e.target.value)}
                          placeholder={isAr ? f.placeholderAr : f.placeholderEn}
                          className="h-9 text-xs"
                        />
                      )}

                      {f.type === 'number' && (
                        <Input
                          id={f.id}
                          type="number"
                          value={answers[f.id] ?? ''}
                          onChange={(e) => handleFieldChange(f.id, e.target.value)}
                          placeholder={isAr ? f.placeholderAr : f.placeholderEn}
                          className="h-9 text-xs"
                        />
                      )}

                      {f.type === 'textarea' && (
                        <Textarea
                          id={f.id}
                          value={answers[f.id] ?? ''}
                          onChange={(e) => handleFieldChange(f.id, e.target.value)}
                          placeholder={isAr ? f.placeholderAr : f.placeholderEn}
                          rows={3}
                          className="text-xs"
                        />
                      )}

                      {f.type === 'select' && f.options && (
                        <Select
                          value={String(answers[f.id] ?? f.defaultValue ?? '')}
                          onValueChange={(val) => handleFieldChange(f.id, val)}
                        >
                          <SelectTrigger id={f.id} className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {f.options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {isAr ? opt.labelAr : opt.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Safeguards Sidebar (1 Column) */}
              <div className="space-y-4">
                <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      {isAr ? 'الفاحص والضمانات النظامية' : 'Regulatory Safeguards'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {isAr
                      ? 'يراقب المحرك مدخلاتك للتحقق من توافقها مع الأنظمة السعودية وتنبيهك للنصوص الآمرة والمواعيد القضائية.'
                      : 'Live regulatory verification monitoring mandatory statutory provisions and court deadlines.'}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {activeSafeguards.length === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{isAr ? 'البيانات المدخلة مطابقة للضوابط النظامية' : 'Inputs conform to statutory standards'}</span>
                      </div>
                    ) : (
                      activeSafeguards.map((s) => (
                        <div
                          key={s.id}
                          className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                            s.type === 'warning'
                              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                              : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                          }`}
                        >
                          <div className="font-semibold text-[11px] flex items-center gap-1.5">
                            <Info className="h-3 w-3 shrink-0" />
                            <span>{s.law}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-90">
                            {isAr ? s.messageAr : s.messageEn}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Local First Privacy Guarantee */}
                <div className="border rounded-xl p-3 bg-card text-[11px] text-muted-foreground flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    {isAr
                      ? 'تتم المعالجة والصياغة محلياً وفق ضوابط حماية البيانات وسيادة المعلومات.'
                      : 'Local-first processing preserving client confidentiality and data sovereignty.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & SMART EDITOR */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
                <div>
                  <h3 className="font-semibold text-sm">
                    {isAr ? `مسودة: ${currentTemplate.titleAr}` : `Draft: ${currentTemplate.titleEn}`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isAr
                      ? 'يمكنك مراجعة وتعديل الصياغة أو تحسينها مباشرة بواسطة المحرر الذكي'
                      : 'Review, edit, or enhance the drafted terms directly with the Smart Editor'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu dir={isAr ? 'rtl' : 'ltr'}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isAr ? 'إدراج بند سعودي نموذجي' : 'Insert Saudi Clause'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="px-3 py-2 border-b text-[11px] font-semibold text-muted-foreground">
                        {isAr ? 'بنود نموذجية متوافقة مع الأنظمة السعودية' : 'Standard Saudi Statutory Clauses'}
                      </div>
                      {SAUDI_STANDARD_CLAUSES.map((clause) => (
                        <DropdownMenuItem
                          key={clause.id}
                          onClick={() => handleInsertClause(clause.clauseText, isAr ? clause.titleAr : clause.titleEn)}
                          className="cursor-pointer flex flex-col items-start gap-0.5 py-2"
                        >
                          <span className="font-medium text-xs text-foreground">
                            {isAr ? clause.titleAr : clause.titleEn}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{clause.law}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs gap-1.5">
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ النص' : 'Copy')}</span>
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 text-xs gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    <span>{isAr ? 'تنزيل Markdown' : 'Download'}</span>
                  </Button>

                  <Button size="sm" onClick={handleSaveToDatabase} disabled={isSaving} className="h-8 text-xs gap-1.5">
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>{isAr ? 'حفظ في ملفات النظام' : 'Save to Sanad'}</span>
                  </Button>
                </div>
              </div>

              {/* Editor */}
              <div className="min-h-[420px]">
                <SmartEditor
                  initialMarkdown={generatedMarkdown}
                  onSave={(md) => {
                    setGeneratedMarkdown(md)
                    toast.success(isAr ? 'تم حفظ التعديلات في المسودة' : 'Draft changes updated')
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="border-t pt-3 flex items-center justify-between sm:justify-between w-full">
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2)}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                <span>{isAr ? 'الرجوع' : 'Back'}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-1.5 text-xs bg-primary text-primary-foreground"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{isAr ? 'جاري الصياغة القانونية...' : 'Generating Draft...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>{isAr ? 'توليد المستند القانوني' : 'Generate Document'}</span>
                  </>
                )}
              </Button>
            )}

            {step === 3 && (
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
                {isAr ? 'إغلاق' : 'Close'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
