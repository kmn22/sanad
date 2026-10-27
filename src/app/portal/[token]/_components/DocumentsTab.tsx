'use client'

import {
  Eye,
  FileText,
  PenTool,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function DocumentsTab({ v }: { v: PortalView }) {
  const { initialDocs, activeTab, setSelectedDocForReview, setDocPage, setReachedLastPage } = v
  return (
    <>
      {/* ========================================================
          SCREEN S5: DOCUMENT REVIEW & E-SIGNATURE (المستندات)
         ======================================================== */}
      {activeTab === 'docs' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">العقود والمستندات</h2>
              <p className="text-xs text-muted-foreground">راجع المسودات واعتمدها إلكترونياً بالبصمة الرقمية</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              نظام التعاملات الإلكترونية
            </Badge>
          </div>

          {/* Document List Grouped by Matter with Status Chips */}
          <div className="space-y-3">
            {initialDocs.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm">لا توجد مستندات معلقة للمراجعة في هذا الملف.</p>
              </Card>
            ) : (
              initialDocs.map((doc) => {
                const isSigned = doc.status === 'active' || !!doc.signedDate
                return (
                  <Card key={doc.id} className="rounded-2xl border p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${isSigned ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm">{doc.title}</h4>
                            <Badge className={isSigned ? 'bg-emerald-600 text-white text-[10px]' : 'bg-amber-500 text-white text-[10px]'}>
                              {isSigned ? 'موقّع إلكترونياً' : 'بانتظار مراجعتك'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            نوع المستند: {doc.docType} • آخر تحديث: {new Date(doc.updatedAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-[11px] text-muted-foreground">
                        {isSigned ? `تم الاعتماد بتاريخ ${new Date(doc.signedDate || doc.updatedAt).toLocaleDateString('ar-SA')}` : 'يلزم الاطلاع على كافة الصفحات'}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 gap-1"
                          onClick={() => {
                            setSelectedDocForReview(doc)
                            setDocPage(1)
                            setReachedLastPage(false)
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>مراجعة المستند</span>
                        </Button>

                        {!isSigned && (
                          <Button
                            size="sm"
                            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            onClick={() => {
                              setSelectedDocForReview(doc)
                              setDocPage(1)
                              setReachedLastPage(false)
                            }}
                          >
                            <PenTool className="h-3.5 w-3.5" />
                            <span>اعتماد وتوقيع</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      )}
    </>
  )
}
