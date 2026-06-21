'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Camera, CameraOff, RotateCw, Trash2, Download,
  FileText, Image as ImageIcon, Loader2, Upload, X, CheckCircle2,
  AlertCircle, Lightbulb, Save, Eye, Aperture,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { saveAs } from 'file-saver'
import {
  Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel,
} from 'docx'

interface CapturedPage {
  id: string
  dataUrl: string
  blob: Blob
  rotated: number
  ocrText?: string
  ocrStatus: 'pending' | 'running' | 'done' | 'failed'
}

type OcrLang = 'ara' | 'eng' | 'ara+eng'

export function ScannerView() {
  const { t } = useLang()
  const [pages, setPages] = useState<CapturedPage[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [ocrLang, setOcrLang] = useState<OcrLang>('ara+eng')
  const [ocrRunning, setOcrRunning] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [docTitle, setDocTitle] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Start camera
  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(t('scanner.no_camera'))
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setCameraError(t('scanner.camera_denied'))
      } else if (e.name === 'NotFoundError') {
        setCameraError(t('scanner.no_camera'))
      } else {
        setCameraError(t('scanner.camera_error'))
      }
    }
  }, [facingMode, t])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  // Capture photo
  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      const newPage: CapturedPage = {
        id: `page-${Date.now()}`,
        dataUrl,
        blob,
        rotated: 0,
        ocrStatus: 'pending',
      }
      setPages((p) => [...p, newPage])
      toast.success(`${t('scanner.page')} ${pages.length + 1}`)
    }, 'image/jpeg', 0.9)
  }, [pages.length, t])

  // Rotate page
  const rotatePage = (id: string) => {
    setPages((p) => p.map((page) =>
      page.id === id ? { ...page, rotated: (page.rotated + 90) % 360 } : page
    ))
  }

  // Delete page
  const deletePage = (id: string) => {
    setPages((p) => p.filter((page) => page.id !== id))
  }

  // Upload image
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const blob = new Blob([dataUrl], { type: file.type })
        const newPage: CapturedPage = {
          id: `page-${Date.now()}-${Math.random()}`,
          dataUrl,
          blob: file,
          rotated: 0,
          ocrStatus: 'pending',
        }
        setPages((p) => [...p, newPage])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Run OCR using Tesseract.js
  const runOcr = async () => {
    if (pages.length === 0) return
    setOcrRunning(true)
    setShowTextEditor(true)

    try {
      const { default: Tesseract } = await import('tesseract.js')
      const allText: string[] = []

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        setPages((p) => p.map((pg) =>
          pg.id === page.id ? { ...pg, ocrStatus: 'running' } : pg
        ))

        // Apply rotation if needed by drawing to a temp canvas
        let imageData = page.dataUrl
        if (page.rotated !== 0) {
          const img = new Image()
          img.src = page.dataUrl
          await new Promise((r) => { img.onload = r })
          const c = document.createElement('canvas')
          const ctx = c.getContext('2d')!
          if (page.rotated === 90) {
            c.width = img.height
            c.height = img.width
          } else if (page.rotated === 180) {
            c.width = img.width
            c.height = img.height
          } else if (page.rotated === 270) {
            c.width = img.height
            c.height = img.width
          }
          ctx.translate(c.width / 2, c.height / 2)
          ctx.rotate((page.rotated * Math.PI) / 180)
          ctx.drawImage(img, -img.width / 2, -img.height / 2)
          imageData = c.toDataURL('image/jpeg', 0.9)
        }

        const result = await Tesseract.recognize(imageData, ocrLang, {
          logger: () => {},
        })
        const text = result.data.text.trim()
        allText.push(`${t('scanner.page')} ${i + 1}\n\n${text}`)

        setPages((p) => p.map((pg) =>
          pg.id === page.id ? { ...pg, ocrText: text, ocrStatus: 'done' } : pg
        ))
      }

      setExtractedText(allText.join('\n\n---\n\n'))
      toast.success(t('scanner.ocr_done'))
    } catch (e) {
      console.error('OCR error:', e)
      toast.error(t('scanner.ocr_failed'))
      setPages((p) => p.map((pg) =>
        pg.ocrStatus === 'running' ? { ...pg, ocrStatus: 'failed' } : pg
      ))
    } finally {
      setOcrRunning(false)
    }
  }

  // Export as Word
  const exportWord = async () => {
    const title = docTitle || t('scanner.title')
    const doc = new DocxDocument({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: '' }),
          ...extractedText.split('\n').map((line) =>
            new Paragraph({ children: [new TextRun(line)] })
          ),
        ],
      }],
    })
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${title}.docx`)
    toast.success(t('scanner.export_word'))
  }

  // Export all images as ZIP-like (download each)
  const exportImages = () => {
    pages.forEach((page, i) => {
      // Re-apply rotation for export
      if (page.rotated !== 0) {
        const img = new Image()
        img.src = page.dataUrl
        img.onload = () => {
          const c = document.createElement('canvas')
          const ctx = c.getContext('2d')!
          if (page.rotated === 90 || page.rotated === 270) {
            c.width = img.height
            c.height = img.width
          } else {
            c.width = img.width
            c.height = img.height
          }
          ctx.translate(c.width / 2, c.height / 2)
          ctx.rotate((page.rotated * Math.PI) / 180)
          ctx.drawImage(img, -img.width / 2, -img.height / 2)
          c.toBlob((blob) => {
            if (blob) saveAs(blob, `${docTitle || 'sanad'}-page-${i + 1}.jpg`)
          }, 'image/jpeg', 0.9)
        }
      } else {
        saveAs(page.blob, `${docTitle || 'sanad'}-page-${i + 1}.jpg`)
      }
    })
    toast.success(t('scanner.export_image'))
  }

  // Clear all
  const clearAll = () => {
    if (!confirm(t('common.delete_confirm'))) return
    setPages([])
    setExtractedText('')
    setShowTextEditor(false)
    setDocTitle('')
  }

  // Switch camera
  const switchCamera = () => {
    stopCamera()
    setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'))
    setTimeout(() => startCamera(), 200)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          {t('scanner.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t('scanner.subtitle')}</p>
      </div>

      {/* Tip */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-200">{t('scanner.tip')}</p>
      </div>

      {/* Camera section */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Video preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video max-w-2xl mx-auto">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3">
                <Camera className="h-12 w-12 opacity-50" />
                <p className="text-sm">{cameraError || t('scanner.start_camera')}</p>
                {cameraError && (
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                )}
              </div>
            )}
            {cameraActive && (
              <button
                onClick={capture}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-white border-4 border-primary shadow-lg hover:scale-105 transition-transform"
                title={t('scanner.capture')}
              />
            )}
          </div>

          {/* Hidden canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera controls */}
          <div className="flex flex-wrap gap-2 justify-center">
            {!cameraActive ? (
              <Button onClick={startCamera} size="sm">
                <Camera className="mx-1.5 h-4 w-4" />
                {t('scanner.start_camera')}
              </Button>
            ) : (
              <>
                <Button onClick={capture} size="sm" variant="default">
                  <Aperture className="mx-1.5 h-4 w-4" />
                  {t('scanner.capture')}
                </Button>
                <Button onClick={switchCamera} size="sm" variant="outline">
                  <RotateCw className="mx-1.5 h-4 w-4" />
                  {t('scanner.switch_camera')}
                </Button>
                <Button onClick={stopCamera} size="sm" variant="outline">
                  <CameraOff className="mx-1.5 h-4 w-4" />
                  {t('scanner.stop_camera')}
                </Button>
              </>
            )}

            {/* Upload alternative */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-1.5 h-4 w-4" />
              {t('scanner.upload_instead')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Captured pages */}
      {pages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                {t('scanner.pages')} ({pages.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-rose-600">
                <Trash2 className="mx-1 h-3 w-3" />
                {t('scanner.clear')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pages.map((page, i) => (
                <div key={page.id} className="relative group rounded-lg border border-border overflow-hidden">
                  <img
                    src={page.dataUrl}
                    alt={`Page ${i + 1}`}
                    className="w-full h-32 object-cover"
                    style={{ transform: `rotate(${page.rotated}deg)` }}
                  />
                  <div className="absolute top-1 start-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {t('scanner.page')} {i + 1}
                  </div>
                  {/* OCR status badge */}
                  {page.ocrStatus === 'done' && (
                    <div className="absolute top-1 end-1 bg-emerald-500 text-white rounded-full p-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  )}
                  {page.ocrStatus === 'running' && (
                    <div className="absolute top-1 end-1 bg-amber-500 text-white rounded-full p-0.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  )}
                  {/* Actions */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-1 py-1">
                    <button
                      onClick={() => rotatePage(page.id)}
                      className="text-white p-1 hover:bg-white/20 rounded"
                      title={t('scanner.rotate')}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="text-rose-400 p-1 hover:bg-rose-500/20 rounded"
                      title={t('scanner.delete_page')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pages.length === 0 && !cameraActive && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Camera className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {t('scanner.no_pages')}
          </CardContent>
        </Card>
      )}

      {/* OCR + Export section */}
      {pages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {t('scanner.ocr')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OCR language */}
            <div className="flex items-center gap-3 flex-wrap">
              <Label className="text-xs text-muted-foreground">{t('scanner.language')}:</Label>
              <Select value={ocrLang} onValueChange={(v) => setOcrLang(v as OcrLang)}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ara+eng">{t('scanner.lang.both')}</SelectItem>
                  <SelectItem value="ara">{t('scanner.lang.ar')}</SelectItem>
                  <SelectItem value="eng">{t('scanner.lang.en')}</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={runOcr} disabled={ocrRunning} size="sm" className="ms-auto">
                {ocrRunning ? (
                  <><Loader2 className="mx-1.5 h-4 w-4 animate-spin" />{t('scanner.ocr_running')}</>
                ) : (
                  <><FileText className="mx-1.5 h-4 w-4" />{t('scanner.ocr')}</>
                )}
              </Button>
            </div>

            {/* Extracted text editor */}
            {showTextEditor && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {t('scanner.edit_text')}
                </Label>
                <Textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  rows={8}
                  className="text-sm font-mono"
                  placeholder={t('scanner.ocr_running')}
                />
                <p className="text-[10px] text-muted-foreground">
                  {extractedText.length.toLocaleString('ar-EG')} حرف
                </p>
              </div>
            )}

            {/* Title + Export */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="doc-title" className="text-xs">{t('scanner.title_field')}</Label>
                <Input
                  id="doc-title"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder={t('scanner.title_field')}
                  className="h-8"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={exportWord} disabled={ocrRunning || !extractedText} size="sm" className="flex-1">
                  <FileText className="mx-1.5 h-4 w-4" />
                  Word
                </Button>
                <Button onClick={exportImages} size="sm" variant="outline" className="flex-1">
                  <ImageIcon className="mx-1.5 h-4 w-4" />
                  {t('scanner.export_image')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
