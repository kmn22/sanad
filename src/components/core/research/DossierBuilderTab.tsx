'use client'

import React from 'react'
import { FileText, Copy, Sparkles, Scale } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ResearchHubState } from './use-research-hub'

export function DossierBuilderTab({
  state,
  onNavigateToDrafting,
}: {
  state: ResearchHubState
  onNavigateToDrafting?: (text: string) => void
}) {
  const {
    dossierTitle,
    setDossierTitle,
    dossierQuestion,
    setDossierQuestion,
    dossierFacts,
    setDossierFacts,
    dossierAnalysis,
    setDossierAnalysis,
    dossierConclusion,
    setDossierConclusion,
    dossierCitations,
    setDossierCitations,
    compileDossierText,
    handleCopyDossier,
  } = state

  return (
    <Card className="border border-border/80 bg-card/60 shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span>مذكرة الرأي والبحث القانوني</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              قم بصياغة مذكرة بحثية متكاملة لعميلك أو لفريق المحامين مستندة إلى النصوص والسوابق المختارة.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyDossier} className="gap-1.5 text-xs">
              <Copy className="w-3.5 h-3.5" />
              نسخ المذكرة كاملة
            </Button>
            {onNavigateToDrafting && (
              <Button
                size="sm"
                onClick={() => onNavigateToDrafting(compileDossierText())}
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                فتح في محرر الصياغة الذكي
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">عنوان الاستشارة أو المذكرة</Label>
            <Input
              value={dossierTitle}
              onChange={(e) => setDossierTitle(e.target.value)}
              placeholder="مثال: مذكرة استشارية بشأن مدى أحقية إنهاء عقد المقاولة بالشرط الفاسخ الصريح"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">المسألة النظامية محل البحث</Label>
            <Input
              value={dossierQuestion}
              onChange={(e) => setDossierQuestion(e.target.value)}
              placeholder="هل يحق للطرف الأول المطالبة بكامل قيمة الشرط الجزائي دون إثبات ضرر مباشر؟"
            />
          </div>
        </div>

        {/* Citations Box */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center justify-between">
            <span>الأسانيد والنصوص النظامية المختارة ({dossierCitations.length})</span>
            {dossierCitations.length > 0 && (
              <button
                onClick={() => setDossierCitations([])}
                className="text-[10px] text-muted-foreground hover:text-rose-500"
              >
                تفريغ القائمة
              </button>
            )}
          </Label>
          {dossierCitations.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground bg-muted/20">
              لم تقم بإدراج أسانيد بعد. انتقل إلى تبويب <strong>المحفوظات والأبحاث</strong> واضغط على &quot;إدراج بالرأي القانوني&quot;.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border bg-muted/30">
              {dossierCitations.map((c, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                >
                  <Scale className="w-3 h-3" />
                  {c}
                  <button
                    onClick={() => setDossierCitations((prev) => prev.filter((_, i) => i !== idx))}
                    className="hover:text-rose-500 ms-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">ملخص الوقائع والسياق</Label>
          <Textarea
            rows={2}
            value={dossierFacts}
            onChange={(e) => setDossierFacts(e.target.value)}
            placeholder="بيان مختصر لعلاقة الأطراف ومحل النزاع أو الاستفسار..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">التحليل والتأصيل القانوني</Label>
          <Textarea
            rows={4}
            value={dossierAnalysis}
            onChange={(e) => setDossierAnalysis(e.target.value)}
            placeholder="تطبيق النصوص النظامية والسوابق القضائية على وقائع المسألة..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">النتيجة والرأي والتوصية الإجرائية</Label>
          <Textarea
            rows={2}
            value={dossierConclusion}
            onChange={(e) => setDossierConclusion(e.target.value)}
            placeholder="خلاصة الرأي القانوني المقترح والخطوات القضائية أو العقدية الواجب اتخاذها..."
          />
        </div>
      </CardContent>
    </Card>
  )
}
