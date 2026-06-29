'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, User, Loader2, Sparkles, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'

export function AiSearchChat() {
  const { t, lang } = useLang()
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'أهلاً بك! أنا مساعدك القانوني الذكي. يمكنني البحث في قضاياك السابقة والإجابة على أي استفسار.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      })
      const data = await res.json()
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }])
      } else {
        toast.error('حدث خطأ في جلب الرد')
      }
    } catch (e) {
      toast.error('فشل الاتصال بالذكاء الاصطناعي')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-base flex items-center gap-2 text-primary">
          <Bot className="h-4 w-4" />
          {lang === 'ar' ? 'بحث ذكي (RAG)' : 'AI Search (RAG)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm flex gap-2 items-start ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-foreground border'
              }`}>
                {msg.role === 'ai' && <Bot className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'user' && <User className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 border rounded-lg p-3 text-sm flex gap-2 items-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري البحث الدلالي في قضاياك...
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t bg-muted/20">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2"
          >
            <Input 
              placeholder={lang === 'ar' ? 'اسأل عن قضاياك السابقة...' : 'Ask about your cases...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
