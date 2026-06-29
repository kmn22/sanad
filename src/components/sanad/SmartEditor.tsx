'use client'

import React, { useEffect, useState } from 'react'
import {
  MDXEditor,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  UndoRedo,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditorMethods,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { Button } from '@/components/ui/button'
import { Wand2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'

interface SmartEditorProps {
  initialMarkdown: string
  onSave: (markdown: string) => void
  readOnly?: boolean
}

export function SmartEditor({ initialMarkdown, onSave, readOnly = false }: SmartEditorProps) {
  const { t, lang } = useLang()
  const [markdown, setMarkdown] = useState(initialMarkdown)
  const [isImproving, setIsImproving] = useState(false)
  const editorRef = React.useRef<MDXEditorMethods>(null)

  // AI Function to improve text
  const handleAIImprove = async () => {
    if (!editorRef.current) return
    const currentText = editorRef.current.getMarkdown()
    if (!currentText.trim()) {
      toast.error('المستند فارغ!')
      return
    }

    setIsImproving(true)
    const loadingToast = toast.loading('جاري الصياغة القانونية بالذكاء الاصطناعي...')

    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Improve the following legal text formally in Arabic:\n\n${currentText}`,
          docType: 'general'
        })
      })

      const data = await response.json()
      if (data.draft) {
        editorRef.current.setMarkdown(data.draft)
        setMarkdown(data.draft)
        toast.success('تمت إعادة الصياغة بنجاح', { id: loadingToast })
      } else {
        toast.error('حدث خطأ أثناء الصياغة', { id: loadingToast })
      }
    } catch (err) {
      toast.error('فشل الاتصال بالذكاء الاصطناعي', { id: loadingToast })
    } finally {
      setIsImproving(false)
    }
  }

  return (
    <div className={`border rounded-lg bg-card overflow-hidden flex flex-col ${readOnly ? 'opacity-80 pointer-events-none' : ''}`}>
      {!readOnly && (
        <div className="bg-muted border-b flex items-center justify-between px-2 py-1 gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
            onClick={handleAIImprove}
            disabled={isImproving}
          >
            {isImproving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 mr-1" />}
            {lang === 'ar' ? 'تحسين بالذكاء الاصطناعي' : 'AI Improve'}
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => onSave(editorRef.current?.getMarkdown() || '')}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {lang === 'ar' ? 'حفظ المستند' : 'Save Doc'}
          </Button>
        </div>
      )}
      
      <div className="min-h-[300px] p-2 prose dark:prose-invert max-w-none text-right dir-rtl">
        <MDXEditor
          ref={editorRef}
          markdown={markdown}
          readOnly={readOnly}
          onChange={(v) => setMarkdown(v)}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <div className="flex items-center gap-1">
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                </div>
              )
            })
          ]}
        />
      </div>
    </div>
  )
}
