'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileText, CheckCircle2, Trash2, MoreVertical, Eye } from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import { type Invoice } from '@/lib/sanad/types'

export function InvoiceActions({
  inv,
  onPatch,
  onDelete,
  onView,
}: {
  inv: Invoice
  onPatch: (i: Invoice, s: 'sent' | 'paid') => void
  onDelete: (i: Invoice) => void
  onView: (i: Invoice) => void
}) {
  const { t } = useLang()
  const canMarkSent = inv.status === 'draft'
  const canMarkPaid = inv.status === 'sent' || inv.status === 'overdue'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(inv)}>
          <Eye className="h-3.5 w-3.5 mx-1" />
          {t('invoices.view')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {canMarkSent && (
          <DropdownMenuItem onClick={() => onPatch(inv, 'sent')}>
            <FileText className="h-3.5 w-3.5 mx-1" />
            {t('invoices.mark_sent')}
          </DropdownMenuItem>
        )}
        {canMarkPaid && (
          <DropdownMenuItem onClick={() => onPatch(inv, 'paid')}>
            <CheckCircle2 className="h-3.5 w-3.5 mx-1" />
            {t('invoices.mark_paid')}
          </DropdownMenuItem>
        )}
        {(canMarkSent || canMarkPaid) && <DropdownMenuSeparator />}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/40"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="h-3.5 w-3.5 mx-1" />
              {t('invoices.delete')}
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('invoices.delete')}</AlertDialogTitle>
              <AlertDialogDescription>{t('invoices.delete_confirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-700 dark:hover:bg-rose-600"
                onClick={() => onDelete(inv)}
              >
                {t('invoices.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
