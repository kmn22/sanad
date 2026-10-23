'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bot, User, Loader2, Sparkles, Send, Scale, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'

interface CitedSource {
  id: string
  type: 'statute' | 'case' | 'precedent' | 'term'
  title: string
  reference: string
  snippet: string
}

interface ChatItem {
  role: 'user' | 'ai'
  content: string
  sources?: CitedSource[]
}

const READY_PROMPTS_AR = [
  'ما شروط صحة شرط عدم المنافسة في المادة 83 من نظام العمل؟',
  'متى يحق للمحكمة تخفيض الشرط الجزائي وفق نظام المعاملات المدنية؟',
  'ما الإجراءات الإلزامية قبل قيد الدعوى في المحكمة التجارية؟',
  'لخّص موقف قضايا المكتب المفتوحة والمخاطر الإجرائية الحالية',
]

export function AiSearchChat() {
  const { lang } = useLang()
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: 'ai',
      content:
        'أهلاً بك في مساعد سَنَد السيادي. ابدأ من أحد الأوامر الجاهزة أدناه أو اسأل في الأنظمة السعودية وملفات قضاياك، وستصلك الإجابة مشفوعة بمراجعها النظامية.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (overridePrompt?: string) => {
    const userMessage = (overridePrompt ?? input).trim()
    if (!userMessage || isLoading) return
    if (!overridePrompt) setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      })
      const data = await res.json()

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: data.reply,
            sources: Array.isArray(data.sources) ? data.sources.slice(0, 3) : [],
          },
        ])
      } else {
        toast.error('حدث خطأ في جلب الرد')
      }
    } catch {
      toast.error('فشل الاتصال بالذكاء الاصطناعي')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[460px]">
      <CardHeader className="border-b py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2 text-primary">
          <Bot className="h-4 w-4" />
          <span>{lang === 'ar' ? 'المستشار النظامي والأوامر الجاهزة (RAG)' : 'AI Legal Assistant & Prompts'}</span>
        </CardTitle>
        {messages.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMessages([messages[0]])}
            className="h-7 text-xs gap-1 text-muted-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{lang === 'ar' ? 'محادثة جديدة' : 'Reset'}</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        {/* Ready-Made Legal Prompts ("ابدأ من أمر جاهز") */}
        <div className="px-3.5 py-2 border-b bg-muted/20 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            {lang === 'ar' ? 'أمر جاهز:' : 'Prompt:'}
          </span>
          {READY_PROMPTS_AR.map((p) => (
            <button
              key={p}
              type="button"
              disabled={isLoading}
              onClick={() => sendMessage(p)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-background hover:border-primary hover:text-primary transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1.5`}>
              <div
                className={`max-w-[88%] rounded-xl p-3 text-xs sm:text-sm flex gap-2 items-start leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground border'
                }`}
              >
                {msg.role === 'ai' && <Bot className="h-4 w-4 shrink-0 mt-0.5 text-primary" />}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'user' && <User className="h-4 w-4 shrink-0 mt-0.5 opacity-80" />}
              </div>

              {/* Cited Saudi Legal Sources ("كل نقطة موضّحة بمرجعها") */}
              {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                <div className="max-w-[88%] flex flex-wrap gap-1.5 ps-2">
                  {msg.sources.map((src) => (
                    <Badge
                      key={src.id}
                      variant="outline"
                      title={src.snippet}
                      className="text-[10px] gap-1 bg-background border-primary/30 text-primary font-normal py-0.5"
                    >
                      <Scale className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate max-w-[240px]">{src.reference}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 border rounded-lg p-3 text-xs sm:text-sm flex gap-2 items-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                جاري البحث في الأنظمة السعودية وملفات القضايا...
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-muted/20">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder={
                lang === 'ar'
                  ? 'واصل السؤال أو اطلب استناداً لمادة نظامية...'
                  : 'Ask a follow-up legal question...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              aria-label={lang === 'ar' ? 'إرسال' : 'Send'}
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
