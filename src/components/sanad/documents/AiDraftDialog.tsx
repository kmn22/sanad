'use client'

import { useState } from 'react'
import { Sparkles, Bot, CheckCircle2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { SmartEditor } from '../SmartEditor'
import type { LegalCase } from '@/lib/sanad/types'

export function AiDraftDialog({
  cases: _cases,
  onSaved: _onSaved,
}: {
  cases: LegalCase[]
  onSaved: () => void
}) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setDraft('')
    try {
      const res = await fetch('/api/ai/draft?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok || !res.body) throw new Error('stream failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // SSE frames are separated by blank lines
        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? ''
        for (const frame of frames) {
          const eventLine = frame.split('\n').find((l) => l.startsWith('event:'))
          const dataLine = frame.split('\n').find((l) => l.startsWith('data:'))
          if (!eventLine || !dataLine) continue
          const event = eventLine.slice(6).trim()
          const data = dataLine.slice(5).replace(/\\n/g, '\n')
          if (event === 'token') {
            acc += data
            setDraft(acc)
          } else if (event === 'done') {
            setLoading(false)
            return
          }
        }
      }
      if (!acc) toast.error('Draft generation failed')
    } catch {
      toast.error('Draft generation failed')
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('تم النسخ بنجاح')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-amber-800 dark:text-amber-300 border-amber-300 hover:bg-amber-50">
          <Sparkles className="mx-1.5 h-4 w-4" /> {t('ai.generate_draft')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="size-5 text-amber-500" />
            {t('ai.generate_draft')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 min-h-0 overflow-y-auto">
          {!draft && !loading && (
            <div className="space-y-3">
              <Label>{t('docs.f_notes')} (Prompt)</Label>
              <Textarea 
                placeholder={t('ai.prompt_placeholder')} 
                rows={4} 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button onClick={generate} disabled={!prompt.trim()} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                <Sparkles className="size-4 me-2" />
                توليد المسودة
              </Button>
            </div>
          )}

          {loading && !draft && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="animate-spin text-amber-500">
                <Sparkles className="size-8" />
              </div>
              <p className="text-sm font-medium animate-pulse">جاري الاتصال بالنموذج وفق الأنظمة السعودية...</p>
            </div>
          )}

          {loading && draft && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <Sparkles className="size-4 animate-pulse" />
                <span>يكتب النموذج المسودة الآن…</span>
              </div>
              <div
                className="prose prose-sm max-w-none rounded-md bg-amber-50/40 border border-amber-200 p-4 whitespace-pre-wrap text-sm leading-7 font-mono"
                dir="rtl"
              >
                {draft}
                <span className="inline-block w-2 h-4 bg-amber-500 animate-pulse align-middle ms-1" />
              </div>
            </div>
          )}

          {draft && !loading && (
            <div className="space-y-4 animate-in fade-in h-full flex flex-col">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">تمت الصياغة بنجاح</Badge>
                <Button size="sm" variant="secondary" onClick={copyToClipboard} className="h-8">
                  {copied ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Copy className="size-4 me-1.5" />}
                  {copied ? 'تم النسخ' : 'نسخ النص'}
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SmartEditor 
                  initialMarkdown={draft} 
                  onSave={(val) => { 
                    setDraft(val)
                    navigator.clipboard.writeText(val)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                    toast.success('تم الحفظ والنسخ بنجاح')
                  }} 
                />
              </div>
              <Button onClick={() => setDraft('')} variant="outline" className="w-full">
                توليد مسودة أخرى
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
