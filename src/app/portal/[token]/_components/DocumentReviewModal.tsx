'use client'

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  PenTool,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PortalView } from '../_lib/use-portal-view'

export function DocumentReviewModal({ v }: { v: PortalView }) {
  const { client, selectedDocForReview, setSelectedDocForReview, docPage, setDocPage, docTotalPages, docZoom, setDocZoom, docComments, newCommentText, setNewCommentText, setReachedLastPage, setShowSignModal, handleAddDocComment } = v
  return (
    <>
      {/* ========================================================
          MODAL: S5 DOCUMENT REVIEW & PAGINATED E-SIGN
         ======================================================== */}
      {selectedDocForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-sm truncate max-w-[240px]">{selectedDocForReview.title}</h3>
                  <span className="text-[10px] text-muted-foreground">نوع المحرر: {selectedDocForReview.docType}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocZoom((z) => Math.max(80, z - 10))}
                  className="p-1 rounded-lg border hover:bg-slate-100 cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-mono">{docZoom}%</span>
                <button
                  onClick={() => setDocZoom((z) => Math.min(150, z + 10))}
                  className="p-1 rounded-lg border hover:bg-slate-100 cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedDocForReview(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Document Paginated Paper Canvas Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950 flex flex-col items-center">
              <div
                style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-md bg-white dark:bg-slate-900 shadow-md border rounded-xl p-6 space-y-4 text-xs leading-relaxed transition-transform"
              >
                {/* Official Legal Document Header Simulation */}
                <div className="border-b pb-3 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">المملكة العربية السعودية • وزارة العدل</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedDocForReview.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    بين: {selectedDocForReview.parties || client.name} — مسودة رسمية معدة من محامي القضية
                  </p>
                </div>

                {docPage === 1 && (
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">البند الأول: تمهيد وتعريفات</p>
                    <p>
                      حيث اتفق الطرفان بكامل أهليتهما المعتبرة شرعاً ونظاماً على إسناد المهام والمطالبات المالية وفقاً لأحكام نظام العمل السعودي ونظام المعاملات المدنية الصادر بالمرسوم الملكي.
                    </p>
                    <p>
                      يلتزم الطرف الأول بتقديم سائر البيانات والإفصاحات اللازمة، وتكون كافة المراسلات عبر بوابة سند الرقمية منتجة لآثارها القانونية.
                    </p>
                  </div>
                )}

                {docPage === 2 && (
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">البند الثاني: الالتزامات المالية والتعاقدية</p>
                    <p>
                      تخضع الفواتير المستحقة للأنظمة الضريبية الصادرة عن هيئة الزكاة والضريبة والجمارك (ZATCA)، وتعد الفاتورة المسددة عبر وسائل الدفع المعتمدة مخالصة نهائية لتلك الدفعة.
                    </p>
                    <p>
                      يحق للموكل تقديم الملاحظات النظامية على صياغة أي بند وتعديلها بالتنسيق مع المحامي المباشر.
                    </p>
                  </div>
                )}

                {docPage === 3 && (
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">البند الثالث: الإقرار والتوقيع والإنهاء</p>
                    <p>
                      يعد هذا المحرر وثيقة نافذة بمجرد اعتمادها إلكترونياً بالبصمة الرقمية ورمز OTP، وله الحجية الكاملة في الإثبات وفق نظام التعاملات الإلكترونية ونظام الإثبات في المملكة.
                    </p>
                    <div className="pt-4 border-t text-center space-y-1">
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        ✓ وصلت إلى الصفحة الأخيرة من المستند
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Anchored Comments on Current Page */}
              <div className="w-full max-w-md mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>ملاحظات الصفحة ({docPage}):</span>
                </div>
                {docComments[docPage]?.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs text-muted-foreground">
                    💬 {c}
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder={`إضافة ملاحظة على الصفحة ${docPage}...`}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Button size="sm" onClick={handleAddDocComment} className="text-xs h-8 bg-emerald-600 text-white">
                    إرسال
                  </Button>
                </div>
              </div>
            </div>

            {/* Pagination Controls & Bottom Actions */}
            <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  disabled={docPage <= 1}
                  onClick={() => setDocPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold">
                  صفحة {docPage} من {docTotalPages}
                </span>
                <button
                  disabled={docPage >= docTotalPages}
                  onClick={() => {
                    const next = docPage + 1
                    setDocPage(next)
                    if (next === docTotalPages) setReachedLastPage(true)
                  }}
                  className="p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDocForReview(null)}>
                  إغلاق
                </Button>
                <Button
                  size="sm"
                  disabled
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold"
                  onClick={() => setShowSignModal(true)}
                >
                  <PenTool className="h-3.5 w-3.5" />
                  <span>التوقيع الإلكتروني غير متاح حالياً</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
