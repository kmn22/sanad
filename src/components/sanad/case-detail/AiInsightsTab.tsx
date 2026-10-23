'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles, Bot, ShieldAlert, Users, Copy, Check, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { type CaseDetail } from './types'

export function AiInsightsTab({ data }: { data: CaseDetail }) {
  const { lang, t } = useLang()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const caseContext = `
عنوان القضية: ${data.title}
نوع القضية: ${data.caseType}
المرحلة الإجرائية: ${data.stage}
العميل: ${data.clientName}
الخصم: ${data.opposingParty || 'غير محدد'}
المحكمة: ${data.court || 'غير محددة'}
قيمة المطالبة: ${data.value || 0} ريال سعودي
الوقائع والملاحظات: ${data.notes || 'لا توجد ملاحظات إضافية'}
      `.trim()
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: caseContext, type: 'litigation' }),
      })
      const json = await res.json()
      if (json.analysis) {
        setAnalysis(json.analysis)
        toast.success(lang === 'ar' ? 'اكتملت دراسة القضية وتحليل المخاطر' : 'Case study completed')
      } else {
        toast.error(json.error || 'AI Analysis failed.')
      }
    } catch {
      toast.error('AI Analysis failed.')
    }
    setLoading(false)
  }

  const copyCaseStudyMemo = () => {
    if (!analysis) return
    const memo = [
      `مذكرة دراسة قضية: ${data.title}`,
      `العميل: ${data.clientName} | الخصم: ${data.opposingParty || '—'} | المحكمة: ${data.court || '—'}`,
      '',
      'أولاً — الملخص التنفيذي وتكييف الدعوى:',
      analysis.summary,
      '',
      'ثانياً — المخاطر النظامية والإجرائية المحتملة:',
      ...(analysis.risks || []).map((r: any, i: number) => `${i + 1}. [${r.severity}] ${r.description}`),
      '',
      'ثالثاً — التوصيات والخطوات الإجرائية لتحرير الدعوى:',
      ...(analysis.recommendations || []).map((rec: string, i: number) => `${i + 1}. ${rec}`),
    ].join('\n')
    navigator.clipboard.writeText(memo)
    setCopied(true)
    toast.success(lang === 'ar' ? 'تم نسخ مذكرة دراسة القضية' : 'Case study copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 space-y-4">
      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Bot className="size-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {lang === 'ar' ? 'دراسة القضية وتقييم الموقف النظامي' : t('ai.analyze_case')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            ادرس قضيتك قبل رفعها أو أثناء الترافع لاستخراج التكييف النظامي، المخاطر الإجرائية، وتوصيات تحرير اللائحة مكتملة الأركان.
          </p>
          <Button onClick={analyze} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 cursor-pointer">
            <Sparkles className="size-4" />
            {lang === 'ar' ? 'ابدأ دراسة القضية بالذكاء الاصطناعي' : t('ai.analyze_case')}
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="animate-spin text-amber-500">
            <Sparkles className="size-8" />
          </div>
          <p className="text-sm font-medium animate-pulse">{t('ai.analyzing')}</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
              <Bot className="size-4 text-amber-500" />
              {t('ai.summary')}
            </h4>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" onClick={copyCaseStudyMemo} className="h-7 text-xs gap-1">
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? 'تم النسخ' : 'نسخ مذكرة الدراسة'}
              </Button>
              <Button size="sm" variant="ghost" onClick={analyze} className="h-7 text-xs gap-1">
                <RefreshCw className="size-3.5" />
                إعادة التحليل
              </Button>
            </div>
          </div>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 text-sm leading-relaxed text-foreground/90">
              {analysis.summary}
            </CardContent>
          </Card>

          {analysis.entities && analysis.entities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
                <Users className="size-4 text-primary" />
                {lang === 'ar' ? 'الأطراف والصفات المستخرجة' : 'Extracted Parties'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.entities.map((ent: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs py-1 px-2.5">
                    <strong>{ent.name}</strong>
                    {ent.role ? ` — ${ent.role}` : ''}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.risks && analysis.risks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-rose-500" />
                {t('ai.risks')}
              </h4>
              <div className="space-y-2">
                {analysis.risks.map((risk: any, i: number) => (
                  <Card key={i} className="border-rose-500/20">
                    <CardContent className="p-3 flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {risk.severity === 'high' ? (
                          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-100">
                            {t('ai.severity_high')}
                          </Badge>
                        ) : risk.severity === 'medium' ? (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100">
                            {t('ai.severity_medium')}
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100">
                            {t('ai.severity_low')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{risk.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                {t('ai.recommendations')}
              </h4>
              <Card>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm items-start">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
