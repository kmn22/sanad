'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  UserCheck,
  Building2,
  Scale,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import type { Client, LegalCase } from '@/lib/sanad/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  cases: LegalCase[]
}

interface ConflictResult {
  hasDirectConflict: boolean
  hasPotentialConflict: boolean
  matchedClients: Client[]
  matchedOpposingCases: LegalCase[]
  matchedDirectCases: LegalCase[]
}

export function ConflictCheckModal({ open, onOpenChange, clients, cases }: Props) {
  const { lang } = useLang()
  const [searchTerm, setSearchTerm] = useState('')
  const [searched, setSearched] = useState(false)
  const [result, setResult] = useState<ConflictResult | null>(null)

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const query = searchTerm.trim().toLowerCase()
    if (!query) return

    // 1. Check if name matches any existing client (Direct representation conflict)
    const matchedClients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.company && c.company.toLowerCase().includes(query)) ||
        (c.nationalId && c.nationalId.includes(query))
    )

    // 2. Check if name matches an opposing party in any active/closed case
    const matchedOpposingCases = cases.filter(
      (c) => c.opposingParty && c.opposingParty.toLowerCase().includes(query)
    )

    // 3. Check if name matches a case client title or party
    const matchedDirectCases = cases.filter(
      (c) => c.clientName.toLowerCase().includes(query) || c.title.toLowerCase().includes(query)
    )

    const hasDirectConflict = matchedClients.length > 0 || matchedDirectCases.length > 0
    const hasPotentialConflict = matchedOpposingCases.length > 0

    setResult({
      hasDirectConflict,
      hasPotentialConflict,
      matchedClients,
      matchedOpposingCases,
      matchedDirectCases,
    })
    setSearched(true)
  }

  const handleReset = () => {
    setSearchTerm('')
    setSearched(false)
    setResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto glass-panel border border-border/80 rounded-2xl p-6" dir="rtl">
        <DialogHeader className="border-b border-border/80 pb-4 text-right">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {lang === 'ar' ? 'فحص تضارب المصالح المهني' : 'Conflict of Interest Check'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {lang === 'ar'
                  ? 'التحقق الاستباقي قبل قبول الوكالة أو الاستشارة وفق ميثاق قواعد سلوك المحامين ونظام المحاماة السعودي.'
                  : 'Pre-engagement verification against client and case history under Saudi Bar Association ethics.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search Input Box */}
        <form onSubmit={handleCheck} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ar' ? 'اسم الطرف، المنشأة، أو السجل التجاري / الهوية:' : 'Party Name, Company, or CR / National ID:'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: شركة الفيصلية، أو 1010123456...' : 'e.g. Al Faisaliah, or CR...'}
                  className="pr-9 h-11 text-sm bg-background/60"
                  autoFocus
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 h-11 cursor-pointer">
                {lang === 'ar' ? 'إجراء الفحص' : 'Run Check'}
              </Button>
            </div>
          </div>
        </form>

        {/* Results Display */}
        {searched && result && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* Status Callout Banner */}
            {result.hasDirectConflict ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{lang === 'ar' ? 'تحذير مهني: تعارض مصالح مباشر محتمل!' : 'Direct Conflict of Interest Detected!'}</span>
                </div>
                <p className="text-xs leading-relaxed text-rose-200/90">
                  {lang === 'ar'
                    ? 'هذا الطرف مقيد كعميل حالي للمكتب أو سبق تمثيله في قضية قائمة. يمتنع على المحامي قبول الوكالة ضده وفقاً للمادة 14 من نظام المحاماة.'
                    : 'This entity is already registered as an active client or represented in an existing matter.'}
                </p>
              </div>
            ) : result.hasPotentialConflict ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{lang === 'ar' ? 'تنبيه: سابقة نزاع مع هذا الطرف (طرف خصم سابق)' : 'Prior Adversarial Relationship Found'}</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-200/90">
                  {lang === 'ar'
                    ? 'هذا الطرف كان خصماً لموكل سابق في إحدى قضايا المكتب. يرجى التأكد من عدم استخدام أي معلومات سرية حصل عليها المكتب أثناء الخصومة السابقة.'
                    : 'This party was previously an opposing party in a firm case. Verify no confidential overlap exists.'}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{lang === 'ar' ? 'شهادة فحص: لا يوجد أي تضارب مصالح مسجل ✓' : 'Clear: No Conflicts of Interest Detected ✓'}</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-200/90">
                  {lang === 'ar'
                    ? 'لم يتم العثور على أي تمثيل قانوني أو استشارة سابقة لهذا الطرف في سجلات الموكلين والقضايا النشطة والتاريخية بالمكتب.'
                    : 'No past or active representation records found for this party.'}
                </p>
              </div>
            )}

            {/* Matched Details Breakdown */}
            {(result.matchedClients.length > 0 || result.matchedOpposingCases.length > 0 || result.matchedDirectCases.length > 0) && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {lang === 'ar' ? 'سجلات التطابق المرصودة:' : 'Matched Firm Records:'}
                </h4>

                {/* Direct Clients */}
                {result.matchedClients.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-border/70 bg-card/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <div>
                        <strong className="text-foreground block">{c.name}</strong>
                        <span className="text-[11px] text-muted-foreground">{c.company || c.type} • سجل/هوية: {c.nationalId || '—'}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-rose-500/40 text-rose-400 bg-rose-500/10 text-[10px]">
                      {lang === 'ar' ? 'موكل مسجل' : 'Registered Client'}
                    </Badge>
                  </div>
                ))}

                {/* Opposing Cases */}
                {result.matchedOpposingCases.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-border/70 bg-card/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-500" />
                      <div>
                        <strong className="text-foreground block">{c.title}</strong>
                        <span className="text-[11px] text-muted-foreground">الخصم: {c.opposingParty} • المحكمة: {c.court || '—'}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px]">
                      {lang === 'ar' ? 'طرف خصم سابق' : 'Prior Opponent'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="border-t border-border/80 pt-4 flex sm:justify-between items-center gap-2">
          {searched && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground">
              {lang === 'ar' ? 'فحص طرف آخر' : 'Check Another'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
