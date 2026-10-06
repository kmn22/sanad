'use client'

import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Building2,
  Users,
  Scale,
  Briefcase,
  User,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

export function LawyerOnboardingWizard({ isOpen, onClose, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Profile
  const [lawyerName, setLawyerName] = useState('')
  const [lawyerPhone, setLawyerPhone] = useState('')
  const [barNumber, setBarNumber] = useState('')

  // Step 2: Firm Details
  const [firmName, setFirmName] = useState('')
  const [mojLicense, setMojLicense] = useState('')
  const [city, setCity] = useState('الرياض')

  // Step 3: Invite Colleagues
  const [colleagueEmail, setColleagueEmail] = useState('')
  const [colleagueRole, setColleagueRole] = useState('lawyer')
  const [invitedList, setInvitedList] = useState<Array<{ email: string; role: string }>>([])

  // Step 4: Practice Areas
  const [practiceAreas, setPracticeAreas] = useState<string[]>([
    'قضايا عمالية',
    'منازعات تجارية',
  ])

  // Step 5: First Matter Creation
  const [caseTitle, setCaseTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [courtName, setCourtName] = useState('المحكمة العامة بالرياض')
  const [hearingDate, setHearingDate] = useState('')

  const availablePracticeAreas = [
    'منازعات تجارية',
    'قضايا عمالية',
    'نزاعات عقارية',
    'أحوال شخصية وتركات',
    'قضايا إدارية ولجان شبه قضائية',
    'صياغة عقود واستشارات شركات',
  ]

  const totalSteps = 5

  const toggleArea = (area: string) => {
    if (practiceAreas.includes(area)) {
      setPracticeAreas(practiceAreas.filter((a) => a !== area))
    } else {
      setPracticeAreas([...practiceAreas, area])
    }
  }

  const handleAddColleague = () => {
    if (!colleagueEmail || !colleagueEmail.includes('@')) {
      toast.error('أدخل بريداً إلكترونياً صحيحاً')
      return
    }
    setInvitedList([...invitedList, { email: colleagueEmail.trim(), role: colleagueRole }])
    setColleagueEmail('')
    toast.success('تمت إضافة الزميل لقائمة الدعوات')
  }

  const handleFinish = () => {
    localStorage.setItem('sanad_lawyer_onboarding_completed', 'true')
    toast.success('مرحباً بك في سند! تم إعداد مساحة عملك بنجاح.')
    if (onComplete) onComplete()
    onClose()
  }

  const handleSkip = () => {
    localStorage.setItem('sanad_lawyer_onboarding_completed', 'true')
    toast.info('تم تخطي معالج التهيئة. يمكنك تعديل بياناتك لاحقاً من الإعدادات.')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 text-slate-900 dark:text-slate-100">
        {/* Header & Step Tracker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                س
              </div>
              <div>
                <h3 className="font-bold text-base">معالج تهيئة مكتب المحاماة</h3>
                <span className="text-xs text-muted-foreground">خطوة {currentStep} من {totalSteps}</span>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              تخطي الآن
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Profile */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h4 className="font-bold text-base flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                <span>البيانات المهنية للمحامي الممارس</span>
              </h4>
              <p className="text-xs text-muted-foreground">تستخدم هذه البيانات في إعداد الخطابات وصحف الدعاوى الرسمية</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">اسم المحامي الكامل:</label>
                <Input
                  placeholder="المحامي / فهد السليمان"
                  value={lawyerName}
                  onChange={(e) => setLawyerName(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">رقم الجوال لتلقي التنبيهات الحرجة:</label>
                <Input
                  placeholder="+966 50 XXX XXXX"
                  value={lawyerPhone}
                  onChange={(e) => setLawyerPhone(e.target.value)}
                  className="text-xs h-10 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">رقم رخصة المحاماة (وزارة العدل):</label>
                <Input
                  placeholder="مثال: 421098"
                  value={barNumber}
                  onChange={(e) => setBarNumber(e.target.value)}
                  className="text-xs h-10 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Firm Details */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h4 className="font-bold text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <span>بيانات مكتب أو شركة المحاماة</span>
              </h4>
              <p className="text-xs text-muted-foreground">تظهر هذه الهوية في بوابة الموكل وفواتير زاتكا ZATCA الضريبية</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">اسم المنشأة القانونية:</label>
                <Input
                  placeholder="مكتب السليمان للمحاماة والاستشارات القانونية"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">رقم الترخيص المهني / السجل التجاري:</label>
                <Input
                  placeholder="مثال: 1010XXXXXX"
                  value={mojLicense}
                  onChange={(e) => setMojLicense(e.target.value)}
                  className="text-xs h-10 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">المدينة / المقر الرئيسي:</label>
                <Input
                  placeholder="الرياض / جدة / الدمام"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-xs h-10"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Invite Colleagues */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>دعوة فريق العمل والمساعدين</span>
                </h4>
                <p className="text-xs text-muted-foreground">يمكنك إضافة زملائك وتحديد أدوارهم وصلاحياتهم (خطوة اختيارية)</p>
              </div>
              <Badge variant="outline" className="text-[10px]">اختياري</Badge>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="colleague@lawfirm.sa"
                value={colleagueEmail}
                onChange={(e) => setColleagueEmail(e.target.value)}
                className="text-xs h-10 flex-1 font-mono"
              />
              <select
                value={colleagueRole}
                onChange={(e) => setColleagueRole(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border rounded-xl px-3 text-xs"
              >
                <option value="lawyer">محامٍ مشارك</option>
                <option value="paralegal">مساعد قانوني</option>
                <option value="trainee">محامٍ متدرب</option>
              </select>
              <Button size="sm" onClick={handleAddColleague} className="bg-emerald-600 text-white text-xs">
                إضافة
              </Button>
            </div>

            {invitedList.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {invitedList.map((inv, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <span className="font-mono">{inv.email}</span>
                    <Badge variant="secondary" className="text-[10px]">{inv.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Practice Areas */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h4 className="font-bold text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-600" />
                <span>مجالات الممارسة والتخصص</span>
              </h4>
              <p className="text-xs text-muted-foreground">اختر التخصصات لتخصيص قوالب العقود وحساب المدد النظامية المناسبة</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {availablePracticeAreas.map((area) => {
                const selected = practiceAreas.includes(area)
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`p-3 rounded-2xl border text-right font-medium transition-all cursor-pointer ${
                      selected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/50'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{area}</span>
                      {selected && <Check className="h-4 w-4 text-emerald-600" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 5: First Matter Creation */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h4 className="font-bold text-base flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-600" />
                <span>إنشاء أول ملف قضية وموكل</span>
              </h4>
              <p className="text-xs text-muted-foreground">ابدأ العمل مباشرة بتسجيل أول التزام قانوني في جدولك</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">موضوع الدعوى أو العقد:</label>
                <Input
                  placeholder="مثال: دعوى مطالبة بأجور ومستحقات عقد عمل"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">اسم الموكل أو الشركة:</label>
                <Input
                  placeholder="مثال: شركة التطوير الحديث"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">المحكمة المختصة:</label>
                  <Input
                    placeholder="المحكمة العمالية"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className="text-xs h-10"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">تاريخ الجلسة القادمة:</label>
                  <Input
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className="text-xs h-10 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="text-xs"
          >
            السابق
          </Button>

          {currentStep < totalSteps ? (
            <Button
              size="sm"
              onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-bold"
            >
              <span>التالي</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleFinish}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-bold shadow-md shadow-emerald-900/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>إتمام التهيئة وفتح لوحة العمليات</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
