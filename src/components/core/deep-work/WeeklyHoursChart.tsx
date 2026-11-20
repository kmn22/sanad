'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2 } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { DeepWorkState } from './use-deep-work'

export function WeeklyHoursChart({ v }: { v: DeepWorkState }) {
  const { lang, weeklyChartData, chartMounted } = v
  return (
    <>
      {/* Weekly hours chart */}
      {chartMounted && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              {lang === 'ar' ? 'ساعات الأسبوع الماضي' : 'Last 7 Days — Hours Breakdown'}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-52 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey={lang === 'ar' ? 'فوترة' : 'Billable'} stackId="a" fill="oklch(0.42 0.09 160)" radius={[0, 0, 0, 0]} />
                <Bar dataKey={lang === 'ar' ? 'تركيز' : 'Focus'} stackId="a" fill="oklch(0.7 0.13 160)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </>
  )
}
