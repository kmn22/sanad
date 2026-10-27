'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquareWarning } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

type FeedbackType = 'bug' | 'suggestion' | 'question' | 'other'

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'bug', label: 'مشكلة / خطأ' },
  { value: 'suggestion', label: 'اقتراح تحسين' },
  { value: 'question', label: 'سؤال' },
  { value: 'other', label: 'أخرى' },
]

/**
 * Beta feedback entry point shown in the authenticated top bar. Submits to
 * POST /api/feedback (workspace + user scoped) and surfaces in /admin.
 */
export function FeedbackButton({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('suggestion')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (message.trim().length < 5) {
      toast.error('اكتب وصفاً أوضح (5 أحرف على الأقل).')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim(), pagePath: pathname }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'تعذر إرسال الملاحظة')
      toast.success('شكراً لك — وصلت ملاحظتك لفريق سَنَد وسنراجعها خلال النسخة التجريبية.')
      setMessage('')
      setType('suggestion')
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر إرسال الملاحظة')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={compact ? 'h-8 w-8 p-0' : 'h-8 gap-1.5 px-2 text-amber-700 dark:text-amber-400 hover:text-amber-800'}
        onClick={() => setOpen(true)}
        title="أبلغ عن مشكلة أو اقترح تحسيناً"
        data-testid="feedback-button"
      >
        <MessageSquareWarning className="h-3.5 w-3.5" />
        {!compact && <span className="hidden md:inline text-xs font-medium">ملاحظات Beta</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>أبلغ عن مشكلة أو اقترح تحسيناً</DialogTitle>
            <DialogDescription>
              سَنَد في مرحلة تجريبية. ملاحظتك تصل مباشرةً لفريق المنصة مع رابط الصفحة الحالية، ولا تتضمن أي بيانات من ملفات قضاياك.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  type === item.value ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={4000}
            placeholder="صف ما حدث أو ما تقترحه — وإن أمكن، الخطوات التي أدت إليه."
            className="text-sm"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span dir="ltr" className="font-mono">{pathname}</span>
            <span>{message.length}/4000</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={sending}>إلغاء</Button>
            <Button size="sm" onClick={submit} disabled={sending || message.trim().length < 5}>
              {sending ? 'جارٍ الإرسال…' : 'إرسال الملاحظة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
