'use client'

import {
  Send,
  Upload,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PortalView } from '../_lib/use-portal-view'

export function MessagesTab({ v }: { v: PortalView }) {
  const { activeTab, setActiveTab, moreSubScreen, msgText, setMsgText, msgBusy, messagesList, fileInputRef, fileBusy, handleSendChatMessage, handleUploadAttachment } = v
  return (
    <>
      {/* ========================================================
          SCREEN S7: SECURE MESSAGES (الرسائل)
         ======================================================== */}
      {activeTab === 'more' && moreSubScreen === 'messages' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">المراسلات الآمنة مع المكتب</h2>
              <p className="text-xs text-muted-foreground">تواصل لوجستي وتنسيق الإجراءات مباشرة مع فريق العمل</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab('home')}>
              عودة
            </Button>
          </div>

          {/* Pinned Expectation Note */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            📌 <strong>للتوضيح:</strong> الرسائل مخصصة لتنسيق المواعيد والإجراءات اللوجستية، وليست استشارة قانونية جديدة. يرد المكتب عادة خلال يوم عمل واحد.
          </div>

          {/* Message Thread History */}
          <Card className="rounded-2xl border p-4 space-y-3 min-h-[220px] max-h-[340px] overflow-y-auto">
            {messagesList.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'client' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'client'
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[9px] opacity-75 mt-1 block text-left font-mono">
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </Card>

          {/* 3 Quick-Reply Templates */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground font-semibold">ردود سريعة بنقرة واحدة:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSendChatMessage('شكراً! راجعته واعتمدته الآن.')}
                className="px-2.5 py-1.5 rounded-xl border bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs transition-colors cursor-pointer"
              >
                👍 شكراً! راجعته واعتمدته الآن
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage('لدي سؤال بخصوص الموعد، شكراً لمتابعتكم من فضلكم.')}
                className="px-2.5 py-1.5 rounded-xl border bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs transition-colors cursor-pointer"
              >
                ❓ لدي سؤال بخصوص الموعد
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage('يرجى تأجيل الجلسة إن أمكن وتنسيق موعد جديد.')}
                className="px-2.5 py-1.5 rounded-xl border bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs transition-colors cursor-pointer"
              >
                ⏱️ طلب تأجيل الجلسة
              </button>
            </div>
          </div>

          {/* Input Row */}
          <div className="flex items-center gap-2 pt-1">
            <Input
              placeholder="اكتب استفسارك للمكتب هنا..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendChatMessage()
              }}
              className="text-xs h-10 rounded-xl"
            />
            <Button
              onClick={() => handleSendChatMessage()}
              disabled={msgBusy || !msgText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Secure Attachment Box */}
          <div className="pt-2 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleUploadAttachment}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={fileBusy}
                className="text-xs h-8 gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{fileBusy ? 'جاري الرفع...' : 'إرفاق مستند أو صورة (حتى 10MB)'}</span>
              </Button>
            </div>
            <span className="text-[10px] text-muted-foreground">تشفير محلي آمن</span>
          </div>
        </div>
      )}
    </>
  )
}
