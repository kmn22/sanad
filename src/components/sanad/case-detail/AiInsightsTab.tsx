'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles, Bot, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { type CaseDetail } from './types'

export function AiInsightsTab({ data }: { data: CaseDetail }) {
  const { lang, t } = useLang()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const analyze = async () => {
    setLoading(true)
    try {
      const caseContext = `
        Case Title: ${data.title}
        Type: ${data.caseType}
        Stage: ${data.stage}
        Notes: ${data.notes || 'None'}
        Opposing Party: ${data.opposingParty || 'None'}
        Value: ${data.value || 0}
      `
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: caseContext, type: 'document' })
      })
      const json = await res.json()
      if (json.analysis) {
        setAnalysis(json.analysis)
      } else {
        toast.error('AI Analysis failed.')
      }
    } catch (e) {
      toast.error('AI Analysis failed.')
    }
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Bot className="size-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('ai.analyze_case')}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            قم بتحليل تفاصيل هذه القضية باستخدام الذكاء الاصطناعي لاستخراج ملخص تنفيذي، تحليل للمخاطر المحتملة، وتوصيات للخطوات القادمة.
          </p>
          <Button onClick={analyze} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <Sparkles className="size-4" />
            {t('ai.analyze_case')}
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-2">
            <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
              <Bot className="size-4 text-amber-500" />
              {t('ai.summary')}
            </h4>
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-4 text-sm leading-relaxed text-foreground/90">
                {analysis.summary}
              </CardContent>
            </Card>
          </div>

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
                          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-100">{t('ai.severity_high')}</Badge>
                        ) : risk.severity === 'medium' ? (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100">{t('ai.severity_medium')}</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100">{t('ai.severity_low')}</Badge>
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
