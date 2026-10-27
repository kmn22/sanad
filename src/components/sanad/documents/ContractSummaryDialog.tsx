'use client'

import { useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  SAMPLE_SUPPLY_CONTRACT_TEXT,
  SAMPLE_SUPPLY_CONTRACT_SUMMARY,
  buildDeterministicContractSummary,
  type ContractSummaryResult,
} from '@/lib/ai/contract-summarizer'

export function ContractSummaryDialog() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(SAMPLE_SUPPLY_CONTRACT_TEXT)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ContractSummaryResult | null>(SAMPLE_SUPPLY_CONTRACT_SUMMARY)

  async function summarize() {
    if (text.trim().length < 20) {
      toast.error(lang === 'ar' ? 'أدخل نص العقد أولاً' : 'Enter contract text first')
      return
    }
    setLoading(true)
    let next: ContractSummaryResult = buildDeterministicContractSummary(text)
    try {
      const res = await fetch('/api/ai/summarize-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: text }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.clauses)) next = data
      }
    } catch {}
    setResult(next)
    setLoading(false)
    toast.success(lang === 'ar' ? 'تم استخراج ملخص العقد والمخاطر' : 'Contract summary extracted')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span>{lang === 'ar' ? 'تلخيص عقد طويل (AI)' : 'Summarize Contract'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{lang === 'ar' ? 'تلخيص العقود واستخراج البنود والالتزامات والمخاطر' : 'AI Contract Summarizer'}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {lang === 'ar' ? 'نص العقد المراد تلخيصه:' : 'Contract Text:'}
            </Label>
            <Textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-xs leading-relaxed"
              placeholder={lang === 'ar' ? 'الصق نص العقد الكامل هنا...' : 'Paste contract text...'}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setText(SAMPLE_SUPPLY_CONTRACT_TEXT)
                setResult(SAMPLE_SUPPLY_CONTRACT_SUMMARY)
              }}
              className="text-xs"
            >
              {lang === 'ar' ? 'تحميل نموذج عقد توريد' : 'Load Sample Contract'}
            </Button>
            <Button type="button" size="sm" onClick={summarize} disabled={loading} className="gap-1.5 cursor-pointer">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{loading ? (lang === 'ar' ? 'جارٍ التلخيص...' : 'Summarizing...') : (lang === 'ar' ? 'استخرج الملخّص والمخاطر' : 'Summarize')}</span>
            </Button>
          </div>

          {result && (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="rounded-xl bg-muted/40 border border-border p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{result.executiveSummary.headline}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {result.executiveSummary.attentionCount} {lang === 'ar' ? 'تحتاج انتباهاً' : 'need attention'}
                  </Badge>
                </div>
                {result.executiveSummary.alerts.map((a, idx) => (
                  <div key={idx} className="rounded-lg bg-background p-2.5 border border-border text-xs">
                    <strong>{a.title} ({a.clauseRef}):</strong> {a.detail}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {result.clauses.map((c) => (
                  <div key={c.number} className="rounded-xl border border-border p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{c.number}. {c.title}</span>
                      <Badge variant="secondary" className="text-[10px]">{c.tagLabel}</Badge>
                    </div>
                    <p className="text-muted-foreground">{c.summary}</p>
                    <p className="text-[11px] text-primary font-mono">{c.statuteRef}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
