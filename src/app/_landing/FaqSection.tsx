'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'

export function FaqSection() {
  // FAQ Accordion Open States
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <>
        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-3 py-1 mb-2">
              الأسئلة الشائعة
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">كل ما يدور في ذهنك عن سَنَد</h2>
            <p className="text-slate-400 text-sm">إجابات واضحة ومباشرة حول الأمان والتوافق والترخيص</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'هل بيانات ومذكرات قضايا موكلي آمنة ومحمية من التسريب؟',
                a: 'نعم تماماً. بُني سَنَد وفق معمارية السيادة المحلية (Local-First). قواعد بياناتك وملفات الموكلين تُحفظ محلياً على جهازك ومحطة عملك مع تشفير تام، ولا يتم إرسال أي أسرار مهنية أو مسودات قضايا إلى خوادم خارجية عامة، بما يحافظ على أمانة السر المهني المقررة في نظام المحاماة السعودي.',
              },
              {
                q: 'كيف تتوافق الفواتير الصادرة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA)؟',
                a: 'ميزة الفوترة الحالية تجريبية للاستخدام الداخلي ولا تمثل حلاً معتمداً أو مدمجاً مع منصة فاتورة. يجب التحقق من متطلبات ZATCA بواسطة مختص قبل إصدار أي فاتورة ضريبية.',
              },
              {
                q: 'ما المقصود بـ "الضمانات النظامية الفورية" أثناء الصياغة؟',
                a: 'عند صياغة أي عقد (مثل عقد عمل أو اتفاقية سرية أو مقاولة)، يقوم محرك الصياغة بمقارنة الشروط المدخلة مع أحكام نظام المعاملات المدنية ونظام العمل. على سبيل المثال: إذا وضعت شرط جزائي يتجاوز الضرر المتوقع أو شرط عدم منافسة يخالف المادة 83، يعرض النظام تنبيهاً باللون الأصفر أو الأخضر مع السند النظامي الدقيق لتعديله فوراً.',
              },
              {
                q: 'هل يمكنني استخدام سَنَد أثناء انقطاع الإنترنت أو داخل قاعات المحاكم؟',
                a: 'نعم، المنصة تدعم العمل دون اتصال بالإنترنت (Offline Capability). يمكنك استعراض ملفات القضايا، تدوين الملاحظات، وإعداد مسودات اللوائح في أي وقت ومن أي مكان.',
              },
              {
                q: 'هل يتوفر حساب تجريبي لاختبار كافة المزايا قبل الاشتراك؟',
                a: 'نعم، نوفر وصولاً تجريبياً فورياً (Sandbox) بنقرة زر واحدة دون الحاجة لإدخال أي بطاقة بنكية. يمكنك تجربة محرك الصياغة والفوترة والاطلاع على النماذج فوراً.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/5 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
    </>
  )
}
