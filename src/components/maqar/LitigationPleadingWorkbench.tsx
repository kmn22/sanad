'use client'

import React, { useMemo, useState } from 'react'
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Download,
  FileSignature,
  FileText,
  Gavel,
  Mail,
  MessageSquare,
  Printer,
  Scale,
  Send,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useLang } from '@/lib/core/i18n'
import {
  calculateProceduralDeadline,
  STATUTORY_DEADLINE_RULES,
  type AlertWindowKey,
  type HearingAlertDispatchReceipt,
  type ProceduralTriggerEvent,
} from '@/lib/litigation/deadline-engine'
import {
  BRIEF_SECTION_DEFINITIONS,
  DEFAULT_SAMPLE_BRIEF,
  type StructuredLegalBrief,
} from '@/lib/litigation/brief-exporter'

export function LitigationPleadingWorkbench() {
  const { lang } = useLang()

  // 1. Procedural Deadline Engine State
  const [selectedEvent, setSelectedEvent] = useState<ProceduralTriggerEvent>(
    'FIRST_INSTANCE_JUDGMENT'
  )
  const [triggerDateStr, setTriggerDateStr] = useState<string>(() => {
    // Default to 23 days ago so it falls inside the T-7D alert window on a 30-day appeal
    const d = new Date(Date.now() - 23 * 24 * 3600_000)
    return d.toISOString().slice(0, 10)
  })
  const [dispatchingAlerts, setDispatchingAlerts] = useState(false)
  const [dispatchReceipt, setDispatchReceipt] =
    useState<HearingAlertDispatchReceipt | null>(null)

  // 2. Structured Brief & Memo Builder State (4 Mandatory Sections)
  const [brief, setBrief] = useState<StructuredLegalBrief>(DEFAULT_SAMPLE_BRIEF)
  const [activeSectionKey, setActiveSectionKey] =
    useState<keyof StructuredLegalBrief['sections']>('partiesAndFacts')
  const [exportingDocx, setExportingDocx] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const calculatedDeadline = useMemo(
    () => calculateProceduralDeadline(selectedEvent, triggerDateStr),
    [selectedEvent, triggerDateStr]
  )

  const handleTriggerAlertDispatch = async (windowKey: AlertWindowKey) => {
    setDispatchingAlerts(true)
    try {
      const res = await fetch('/api/litigation/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DISPATCH_HEARING_ALERTS',
          caseId: 'case-maqar-01',
          caseNumber: brief.caseNumber,
          courtType: brief.courtName,
          hearingDateIso: calculatedDeadline.dueDateIso,
          windowKey,
          channels: ['IN_APP', 'EMAIL', 'WHATSAPP_WEBHOOK', 'SMS_WEBHOOK'],
          recipients: [
            {
              name: brief.counselName || 'المحامي المسؤول',
              email: 'litigation@maqar.sa',
              phone: '+966500000000',
            },
          ],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Dispatch failed')
      setDispatchReceipt(json.receipt as HearingAlertDispatchReceipt)
      toast.success(
        lang === 'ar'
          ? `تم إطلاق إشعارات الجلسة والمهل (${windowKey}) عبر البريد والتنبيه الفوري وWhatsApp/SMS`
          : `Dispatched ${windowKey} alerts across Email, In-App, and SMS/WhatsApp webhooks`
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Alert dispatch failed')
    } finally {
      setDispatchingAlerts(false)
    }
  }

  const handleExportDocx = async () => {
    setExportingDocx(true)
    try {
      const res = await fetch('/api/litigation/brief-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'DOCX', brief }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'DOCX export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `مذكرة-قضائية-${brief.caseNumber}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(
        lang === 'ar'
          ? 'تم تصدير المذكرة بصيغة Word (DOCX) معتمدة للمحاكم'
          : 'Exported court-ready DOCX brief'
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'DOCX export error')
    } finally {
      setExportingDocx(false)
    }
  }

  const handleExportPdfPrint = async () => {
    setExportingPdf(true)
    try {
      const res = await fetch('/api/litigation/brief-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'PDF_HTML', brief }),
      })
      if (!res.ok) throw new Error('PDF generation failed')
      const html = await res.text()
      const printWin = window.open('', '_blank', 'noopener,noreferrer')
      if (!printWin) {
        toast.error(
          lang === 'ar'
            ? 'يرجى السماح بالنوافذ المنبثقة لطباعة/حفظ ملف PDF القضائي'
            : 'Please allow pop-ups to print/save court-ready PDF'
        )
        return
      }
      printWin.document.write(html)
      printWin.document.close()
      setTimeout(() => {
        printWin.focus()
        printWin.print()
      }, 250)
      toast.success(
        lang === 'ar'
          ? 'تم فتح المذكرة بالتنسيق القضائي الجاهز للطباعة والحفظ كـ PDF'
          : 'Opened court-ready PDF print view'
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'PDF export error')
    } finally {
      setExportingPdf(false)
    }
  }

  const updateSection = (
    key: keyof StructuredLegalBrief['sections'],
    value: string
  ) => {
    setBrief((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* 1. Case Timeline & Procedural Statutory Deadline Engine */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#1F7A46]/10 text-[#1F7A46] dark:text-emerald-300 border border-[#1F7A46]/20">
                {lang === 'ar' ? 'محرك المهل النظامية والتنبيهات' : 'Statutory Deadline Engine'}
              </span>
              <span className="text-xs text-[#1F7A46] dark:text-emerald-400 font-semibold">
                • {lang === 'ar' ? 'تنبيهات استباقية (7 أيام / 3 أيام / 24 ساعة)' : 'Proactive T-7d / T-3d / T-24h Alerts'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-foreground mt-1.5 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[#1F7A46] dark:text-emerald-400" />
              <span>
                {lang === 'ar'
                  ? 'حاسبة المواعيد الإجرائية والمهل النظامية وتنبيهات الجلسات'
                  : 'Procedural Deadline Calculator & Automated Hearing Alert Engine'}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(['T_MINUS_7D', 'T_MINUS_3D', 'T_MINUS_24H'] as const).map((win) => (
              <Button
                key={win}
                size="sm"
                variant="outline"
                disabled={dispatchingAlerts}
                onClick={() => handleTriggerAlertDispatch(win)}
                className="h-8 text-xs rounded-xl gap-1.5 cursor-pointer border-border hover:border-[#1F7A46]"
              >
                <BellRing className="h-3.5 w-3.5 text-amber-500" />
                <span>
                  {win === 'T_MINUS_7D'
                    ? 'إشعار T-7 أيام'
                    : win === 'T_MINUS_3D'
                    ? 'إشعار T-3 أيام'
                    : 'إشعار T-24 ساعة'}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Event Selector + Trigger Date + Computed Statutory Window */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5 space-y-3 rounded-xl border border-border bg-muted/40 p-4">
            <label className="block text-xs font-bold text-foreground">
              {lang === 'ar'
                ? 'نوع الإجراء القضائي أو القرار الصادر:'
                : 'Procedural Trigger Event:'}
            </label>
            <select
              value={selectedEvent}
              onChange={(e) =>
                setSelectedEvent(e.target.value as ProceduralTriggerEvent)
              }
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground"
            >
              {Object.values(STATUTORY_DEADLINE_RULES).map((rule) => (
                <option key={rule.event} value={rule.event}>
                  {rule.label[lang]} ({rule.periodDays}{' '}
                  {lang === 'ar' ? 'يوماً' : 'days'})
                </option>
              ))}
            </select>

            <div className="pt-1">
              <label className="block text-xs font-bold text-foreground mb-1">
                {lang === 'ar'
                  ? 'تاريخ استلام صك الحكم / التبليغ الرسمي:'
                  : 'Official Notification / Judgment Delivery Date:'}
              </label>
              <Input
                type="date"
                value={triggerDateStr}
                onChange={(e) => setTriggerDateStr(e.target.value)}
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-[#1F7A46]/25 bg-[#123D24] dark:bg-[#0D2B1A] text-white p-4 flex flex-col justify-between gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold tracking-wide text-emerald-300">
                  {calculatedDeadline.statutoryCitation[lang]}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold mt-0.5">
                  {calculatedDeadline.label[lang]}
                </h3>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  calculatedDeadline.urgency === 'EXPIRED'
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                    : calculatedDeadline.urgency === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                    : calculatedDeadline.urgency === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                    : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                }`}
              >
                {calculatedDeadline.remainingDays > 0
                  ? lang === 'ar'
                    ? `متبقي ${calculatedDeadline.remainingDays} يوم (${calculatedDeadline.remainingHours} ساعة)`
                    : `${calculatedDeadline.remainingDays}d (${calculatedDeadline.remainingHours}h) left`
                  : lang === 'ar'
                  ? 'انتهت المهلة النظامية'
                  : 'Statutory Period Expired'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/15 text-[11px]">
              <div>
                <span className="text-emerald-100/75 block">
                  {lang === 'ar' ? 'الموعد النهائي للإيداع' : 'Final Due Date'}
                </span>
                <strong className="font-mono text-emerald-300">
                  {calculatedDeadline.dueDateIso.slice(0, 10)}
                </strong>
              </div>
              <div>
                <span className="text-emerald-100/75 block">إشعار T-7 أيام</span>
                <strong className="font-mono">
                  {calculatedDeadline.scheduledAlertTimestamps.T_MINUS_7D.slice(0, 10)}
                </strong>
              </div>
              <div>
                <span className="text-emerald-100/75 block">إشعار T-3 أيام</span>
                <strong className="font-mono">
                  {calculatedDeadline.scheduledAlertTimestamps.T_MINUS_3D.slice(0, 10)}
                </strong>
              </div>
              <div>
                <span className="text-emerald-100/75 block">إشعار T-24 ساعة</span>
                <strong className="font-mono text-amber-300">
                  {calculatedDeadline.scheduledAlertTimestamps.T_MINUS_24H.slice(0, 10)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-channel Webhook Receipt */}
        {dispatchReceipt && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {lang === 'ar'
                  ? `سجل إرسال التنبيهات المتعددة القنوات (${dispatchReceipt.windowKey})`
                  : `Multi-Channel Alert Dispatch Log (${dispatchReceipt.windowKey})`}
              </span>
              <span className="font-mono text-[10px]">
                {dispatchReceipt.dispatchedAt.slice(11, 19)} UTC
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {dispatchReceipt.deliveries.map((d) => {
                const channelLabel =
                  d.channel === 'EMAIL'
                    ? lang === 'ar' ? 'البريد الإلكتروني' : 'Email'
                    : d.channel === 'IN_APP'
                    ? lang === 'ar' ? 'تنبيه المنصة' : 'In-App'
                    : d.channel === 'WHATSAPP_WEBHOOK'
                    ? lang === 'ar' ? 'واتساب' : 'WhatsApp'
                    : lang === 'ar' ? 'رسالة نصية' : 'SMS'
                return (
                <div
                  key={d.channel}
                  className="rounded-lg bg-background border border-border p-2.5 text-[11px]"
                >
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span className="flex items-center gap-1">
                      {d.channel === 'EMAIL' && <Mail className="h-3.5 w-3.5 text-[#1F7A46]" />}
                      {d.channel === 'IN_APP' && <BellRing className="h-3.5 w-3.5 text-amber-500" />}
                      {d.channel === 'WHATSAPP_WEBHOOK' && (
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      {d.channel === 'SMS_WEBHOOK' && (
                        <Smartphone className="h-3.5 w-3.5 text-[#1F7A46]" />
                      )}
                      {channelLabel}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      {d.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 leading-snug">
                    {d.detail}
                  </p>
                </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Brief & Memo Builder (صانع المذكرات الترافعية) + Court-Ready DOCX/PDF Export */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-[#1F7A46] dark:text-emerald-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                {lang === 'ar'
                  ? 'صانع المذكرات الترافعية واللوائح الاعتراضية'
                  : 'Structured Pleading Brief & Memo Builder'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === 'ar'
                ? 'محرر هيكلي مقسم وفق الأصول القضائية السعودية مع تصدير فوري بصيغتي Word (DOCX) وPDF المعتمدتين للإيداع في ناجز'
                : 'Structured 4-part pleading editor with court-ready DOCX and printable PDF export'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={exportingPdf}
              onClick={handleExportPdfPrint}
              className="rounded-xl gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Printer className="h-4 w-4 text-[#1F7A46]" />
              <span>
                {exportingPdf
                  ? lang === 'ar'
                    ? 'جاري التجهيز...'
                    : 'Preparing...'
                  : lang === 'ar'
                  ? 'تصدير / طباعة PDF قضائي'
                  : 'Court-Ready PDF'}
              </span>
            </Button>

            <Button
              size="sm"
              disabled={exportingDocx}
              onClick={handleExportDocx}
              className="rounded-xl bg-[#1F7A46] hover:bg-[#176137] text-white gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>
                {exportingDocx
                  ? lang === 'ar'
                    ? 'جاري التوليد...'
                    : 'Generating...'
                  : lang === 'ar'
                  ? 'تصدير Word (DOCX)'
                  : 'Export DOCX'}
              </span>
            </Button>
          </div>
        </div>

        {/* Case & Court Metadata Header Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              {lang === 'ar' ? 'عنوان المذكرة القضائية' : 'Brief Title'}
            </label>
            <Input
              value={brief.title}
              onChange={(e) => setBrief((p) => ({ ...p, title: e.target.value }))}
              className="h-8 text-xs rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              {lang === 'ar' ? 'رقم القضية في ناجز' : 'Case Number'}
            </label>
            <Input
              value={brief.caseNumber}
              onChange={(e) =>
                setBrief((p) => ({ ...p, caseNumber: e.target.value }))
              }
              className="h-8 text-xs rounded-xl font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              {lang === 'ar' ? 'المحكمة المختصة' : 'Court Name'}
            </label>
            <Input
              value={brief.courtName}
              onChange={(e) =>
                setBrief((p) => ({ ...p, courtName: e.target.value }))
              }
              className="h-8 text-xs rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              {lang === 'ar' ? 'الدائرة القضائية' : 'Judicial Circuit'}
            </label>
            <Input
              value={brief.circuitName}
              onChange={(e) =>
                setBrief((p) => ({ ...p, circuitName: e.target.value }))
              }
              className="h-8 text-xs rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              {lang === 'ar' ? 'المدعي' : 'Plaintiff'}
            </label>
            <Input
              value={brief.plaintiffName}
              onChange={(e) =>
                setBrief((p) => ({ ...p, plaintiffName: e.target.value }))
              }
              className="h-8 text-xs rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              {lang === 'ar' ? 'المدعى عليه' : 'Defendant'}
            </label>
            <Input
              value={brief.defendantName}
              onChange={(e) =>
                setBrief((p) => ({ ...p, defendantName: e.target.value }))
              }
              className="h-8 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* 4-Section Pleading Builder Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Section Selector Tabs (4 Canonical Pleading Sections) */}
          <div className="lg:col-span-4 space-y-2">
            {BRIEF_SECTION_DEFINITIONS.map((sec, idx) => {
              const isSelected = activeSectionKey === sec.key
              const charCount = brief.sections[sec.key]?.length || 0
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => setActiveSectionKey(sec.key)}
                  className={`w-full p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1F7A46] bg-[#1F7A46]/10 text-foreground shadow-xs'
                      : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                    <span className="text-[#1F7A46] dark:text-emerald-400">
                      0{idx + 1} • {sec.number}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {charCount} {lang === 'ar' ? 'حرف' : 'chars'}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-foreground">{sec.titleAr}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {sec.titleEn}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Active Section Editor & Live Court-Ready Preview */}
          <div className="lg:col-span-8 space-y-3">
            {BRIEF_SECTION_DEFINITIONS.filter((s) => s.key === activeSectionKey).map(
              (sec) => (
                <div
                  key={sec.key}
                  className="rounded-xl border border-border bg-muted/35 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#1F7A46] dark:text-emerald-400">
                        {sec.number}: {sec.titleAr}
                      </span>
                      <p className="text-[11px] text-muted-foreground">{sec.titleEn}</p>
                    </div>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <textarea
                    value={brief.sections[sec.key]}
                    onChange={(e) => updateSection(sec.key, e.target.value)}
                    rows={9}
                    placeholder={sec.placeholderAr}
                    className="w-full rounded-xl border border-border bg-background p-3.5 text-xs sm:text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-[#1F7A46]/35"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

