'use client'

import React, { useState } from 'react'
import { History, Upload, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { LegalDocument } from '@/lib/sanad/types'

export function DocumentVersionsDialog({
  document: doc,
  onUploaded,
}: {
  document: LegalDocument
  onUploaded: () => void
}) {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<Array<{
    id: string
    version: number
    originalName: string
    sizeBytes: number
    note: string | null
    createdAt: string
    uploadedBy?: { name: string | null } | null
  }>>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')

  async function loadVersions() {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${doc.id}/versions`)
      if (res.ok) setVersions(await res.json())
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (note.trim()) fd.append('note', note.trim())
      const res = await fetch(`/api/documents/${doc.id}/versions`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'تعذر رفع الإصدار')
      toast.success(lang === 'ar' ? `تم رفع وتشفير الإصدار v${data.version}` : `Version v${data.version} uploaded`)
      setFile(null)
      setNote('')
      await loadVersions()
      onUploaded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) loadVersions()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-primary hover:bg-primary/10 cursor-pointer">
          <History className="h-3.5 w-3.5" />
          <span>{lang === 'ar' ? 'الإصدارات والملفات المشفرة' : 'Versions & Files'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">{doc.title} — {lang === 'ar' ? 'سجل الإصدارات المشفرة' : 'Encrypted Versions'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-2.5 border-b border-border pb-4">
          <Label className="text-xs font-semibold">
            {lang === 'ar' ? 'رفع إصدار جديد مشفر (PDF, DOCX, TXT, PNG, JPG — حتى 10MB)' : 'Upload new encrypted version'}
          </Label>
          <Input
            type="file"
            accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs"
          />
          <div className="flex gap-2">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={lang === 'ar' ? 'ملاحظة التعديل (اختياري)...' : 'Version note...'}
              className="text-xs h-9"
            />
            <Button type="submit" size="sm" disabled={!file || uploading} className="h-9 gap-1.5 shrink-0 cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploading ? '...' : lang === 'ar' ? 'رفع وتشفير' : 'Upload'}</span>
            </Button>
          </div>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : versions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {lang === 'ar' ? 'لا توجد إصدارات مرفوعة لهذا المستند بعد.' : 'No file versions uploaded yet.'}
            </p>
          ) : (
            versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-2 rounded-xl border border-border p-2.5 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="font-mono text-[10px]">v{v.version}</Badge>
                    <span className="font-semibold truncate">{v.originalName}</span>
                    <span className="text-[10px] text-muted-foreground">({Math.max(1, Math.round(v.sizeBytes / 1024))} KB)</span>
                  </div>
                  {v.note && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{v.note}</p>}
                </div>
                <a
                  href={`/api/documents/${doc.id}/versions/${v.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold hover:bg-muted shrink-0"
                >
                  <Download className="h-3 w-3" />
                  <span>{lang === 'ar' ? 'تنزيل' : 'Download'}</span>
                </a>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
