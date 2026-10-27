'use client'

import {
  PenTool,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PortalView } from '../_lib/use-portal-view'

export function SignatureModal({ v }: { v: PortalView }) {
  const { selectedDocForReview, showSignModal, setShowSignModal, stepUpOtp, setStepUpOtp, signerName, setSignerName, agreedToTerms, setAgreedToTerms, signingBusy, canvasRef, startDrawing, draw, clearSignature, handleFinalizeSignature } = v
  return (
    <>
      {/* ========================================================
          MODAL: STEP-UP AUTH & CANVAS SIGNATURE PAD
         ======================================================== */}
      {showSignModal && selectedDocForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">التوقيع الإلكتروني والاعتماد الموثق</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowSignModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">اسم الموقّع القانوني الكامل:</label>
                <Input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Step-up Auth OTP Rule */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-700 dark:text-emerald-300">
                    رمز التأكيد الفوري (Step-Up OTP):
                  </label>
                  <button
                    type="button"
                    onClick={() => setStepUpOtp('123456')}
                    className="text-[10px] text-emerald-600 underline font-mono cursor-pointer"
                  >
                    رمز تجريبي (123456)
                  </button>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="أدخل الرمز للتأكيد"
                  value={stepUpOtp}
                  onChange={(e) => setStepUpOtp(e.target.value)}
                  className="text-xs h-9 font-mono tracking-widest text-center"
                />
              </div>

              {/* Touch/Mouse HTML5 Canvas Signature Pad */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold">رسم التوقيع باللمس أو القلم:</label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[10px] text-rose-500 underline cursor-pointer"
                  >
                    مسح التوقيع
                  </button>
                </div>
                <div className="border-2 border-dashed border-emerald-400 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    className="w-full h-[110px] touch-none cursor-crosshair"
                  />
                </div>
              </div>

              {/* Legal Acknowledgment */}
              <label className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600"
                />
                <span className="text-[10px] leading-relaxed text-emerald-950 dark:text-emerald-200">
                  أقر أنا <strong>{signerName}</strong> باطلاعي الكامل على بنود هذا المستند، وأوافق على توقيعه إلكترونياً بما ينتج كافة آثاره القانونية الملزمة بموجب نظام التعاملات الإلكترونية السعودي.
                </span>
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowSignModal(false)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                disabled={!agreedToTerms || signingBusy}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold"
                onClick={handleFinalizeSignature}
              >
                {signingBusy ? 'جاري توثيق البصمة...' : 'تأكيد التوقيع والاعتماد'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
