'use client'

import React from 'react'
import { Scale, Building2, Gavel, Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ResearchHubState } from './use-research-hub'

export function StatutesRepositoryTab({ state }: { state: ResearchHubState }) {
  const { setSearchQuery, setActiveTab } = state

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="hover:border-blue-500/40 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-500" />
            <span>نظام المعاملات المدنية</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">مرسوم ملكي رقم (م/191) - 721 مادة</p>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>ينظم العقود، الضمان، الشرط الجزائي، المسؤولية التقصيرية، والملكية الشائعة.</p>
          <div className="pt-2 flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">نافذ ومعتمد</Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => {
                setSearchQuery('المعاملات المدنية')
                setActiveTab('saved')
              }}
            >
              <Search className="w-3 h-3" />
              تصفح المواد المحفوظة
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:border-blue-500/40 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>نظام الشركات الجديد</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">مرسوم ملكي رقم (م/132)</p>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>استحدث شركة المساهمة المبسطة، اتفاقيات الشركاء، وحوكمة الشركات العائلية.</p>
          <div className="pt-2 flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">المنظومة التجارية</Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => {
                setSearchQuery('الشركات')
                setActiveTab('saved')
              }}
            >
              <Search className="w-3 h-3" />
              تصفح المواد المحفوظة
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:border-blue-500/40 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gavel className="w-4 h-4 text-purple-500" />
            <span>نظام الإثبات ونظام المرافعات</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">مرسوم ملكي رقم (م/43)</p>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>قواعد الإثبات بالقرائن، حجية الدليل الرقمي، واستجواب الخصوم واليمين الحاسمة.</p>
          <div className="pt-2 flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">القضاء الإجرائي</Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => {
                setSearchQuery('الإثبات')
                setActiveTab('saved')
              }}
            >
              <Search className="w-3 h-3" />
              تصفح المواد المحفوظة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
