'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { MoreVertical, Edit, Trash2, Link, GripVertical, Users, Scale } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { PRIORITY_COLORS, formatDate, formatSAR, daysUntil, type LegalCase } from '@/lib/sanad/types'

export function CaseCard({
  c,
  dragging,
  onClick,
  onEdit,
  onDelete,
  onDraftPleading,
}: {
  c: LegalCase
  dragging?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDraftPleading?: () => void
}) {
  const { lang, t } = useLang()
  const days = c.dueDate ? daysUntil(c.dueDate) : null
  const overdue = days !== null && days < 0

  const copyPortalLink = async () => {
    if (!c.clientId) {
      toast.error(lang === 'ar' ? 'يجب ربط الملف بعميل قبل إنشاء رابط البوابة' : 'Link matter to a client before generating portal link')
      return
    }
    const response = await fetch('/api/portal-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: c.clientId, caseId: c.id, sendEmail: false }),
    })
    const result = await response.json()
    if (!response.ok) {
      toast.error(result.error || (lang === 'ar' ? 'تعذر إنشاء رابط بوابة العميل' : 'Failed to create client portal link'))
      return
    }
    await navigator.clipboard.writeText(result.url)
    toast.success(lang === 'ar' ? 'تم إنشاء ونسخ رابط بوابة العميل الآمن' : 'Client portal link generated and copied')
  }

  return (
    <Card
      className={`group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all relative rounded-xl border border-border/70 bg-card shadow-2xs glass-card-hover ${
        dragging ? 'shadow-xl rotate-1 ring-2 ring-primary/30' : ''
      }`}
      onClick={(e) => {
        // Only trigger click if not clicking the action menu
        if (!(e.target as HTMLElement).closest('[data-action-menu]')) onClick?.()
      }}
    >
      <CardContent className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm font-semibold leading-tight flex-1 text-foreground group-hover:text-primary transition-colors">
            {c.title}
          </p>
          {onEdit && onDelete && (
            <div data-action-menu className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={lang === 'ar' ? 'خيارات الملف' : 'Matter actions'}
                    className="h-6 w-6 p-0 rounded-full"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-panel">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-3.5 w-3.5 me-2" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  {onDraftPleading && (
                    <DropdownMenuItem onClick={onDraftPleading}>
                      <Scale className="h-3.5 w-3.5 me-2 text-primary" />
                      {lang === 'ar' ? 'صياغة مذكرة / استشارة' : 'Draft Memo / Pleading'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={copyPortalLink}>
                    <Link className="h-3.5 w-3.5 me-2" />
                    {lang === 'ar' ? 'نسخ رابط العميل' : 'Copy Portal Link'}
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-rose-600 focus:text-rose-600">
                        <Trash2 className="h-3.5 w-3.5 me-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-panel">
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.delete_confirm')}</AlertDialogTitle>
                        <AlertDialogDescription>{c.title}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('comp.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-rose-600 hover:bg-rose-700">
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {!onEdit && <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 mt-0.5" />}
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" /> {c.client?.name || c.clientName}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[c.priority]?.color}`}>
            {t(`prio.${c.priority}`)}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
            {t(`ctype.${c.caseType}`)}
          </Badge>
        </div>
        {c.dueDate && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">{t('cases.due')} {formatDate(c.dueDate, lang)}</span>
            {overdue ? (
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">{t('dash.d_overdue', { n: Math.abs(days!) })}</span>
            ) : days! <= 7 ? (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{t('dash.d_left', { n: days ?? 0 })}</span>
            ) : null}
          </div>
        )}
        {c.value && c.value > 0 && (
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 pt-1">{formatSAR(c.value, lang)}</p>
        )}
      </CardContent>
    </Card>
  )
}
