import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowDown,
  ArrowLeft,
  ShieldCheck,
  FolderKanban,
  MessageSquareShare,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react'

const WORKSPACE_HIGHLIGHTS = [
  {
    id: 'cases',
    badge: 'تنظيم القضايا والملفات',
    title: 'إدارة القضايا والجلسات وعزل الملفات السرية',
    desc: 'لوحة متابعة واضحة للمهام والجلسات القادمة، مع تقييد القضايا الحساسة وخزنة مستندات مشفرة بـ AES-256-GCM.',
    icon: FolderKanban,
    points: ['لوحة قضايا ومهام مرتبة', 'إصدارات موثقة للمستندات'],
  },
  {
    id: 'portal',
    badge: 'تجربة احترافية للموكّل',
    title: 'بوابة موكّل خاصة برمز تحقق OTP ومشاركة واتساب',
    desc: 'أرسل رابط المتابعة الآمن لموكّلك بنقرة عبر واتساب ليطّلع على مستجدات قضيته بمصطلحات واضحة ويرفع المستندات المطلوبة.',
    icon: MessageSquareShare,
    points: ['دخول موثق برمز OTP وصلاحية زمنية', 'تقليص اتصالات المتابعة اليومية'],
  },
  {
    id: 'compliance',
    badge: 'التراخيص والوكالات والأتعاب',
    title: 'متتبع الوكالات والتراخيص وساعات العمل والأتعاب',
    desc: 'تنبيهات استباقية قبل انتهاء رخصة المحاماة والوكالات والعقود، مع مؤقت ساعات عمل وبيانات أتعاب واضحة للموكّل.',
    icon: CalendarClock,
    points: ['تنبيهات التراخيص والوكالات والإقامات', 'حاسبة وقت وبيانات أتعاب داخلية'],
  },
]

export function HeroSection() {
  return (
    <section className="pt-12 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl text-center relative">
      {/* Maqar Identity Badge */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1B281F] text-xs sm:text-sm font-bold mb-6 shadow-2xs">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A46]" />
        <span className="text-[#1F7A46] font-black">«مقر»</span>
        <span className="text-[#566A5C]">|</span>
        <span>للمحامي المستقل ومكاتب المحاماة الصغيرة في السعودية (١–١٠ مقاعد)</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-[#1B281F] leading-[1.22] mb-5 font-heading">
        مكتبك القانوني الرقمي وبوابة موكّليك — <br className="hidden sm:inline" />
        <span className="text-[#1F7A46]">
          بسعر واضح وبلا تعقيد المؤسسات
        </span>
      </h1>

      {/* Subtitle Line */}
      <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#4A5D50] leading-relaxed mb-8 font-normal">
        نظّم قضاياك ومستنداتك المشفرة، تابع انتهاء الوكالات والتراخيص، وامنح موكّليك بوابة خاصة برمز تحقق OTP ومشاركة واتساب بنقرة واحدة — من ١٩٩ ر.س شهرياً.
      </p>

      {/* Primary CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto mb-12">
        <Link href="/register" className="w-full sm:w-auto" data-testid="hero-cta-register">
          <Button
            size="lg"
            className="w-full sm:w-auto h-12 px-8 bg-[#1F7A46] hover:bg-[#165832] text-white text-base font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>ابدأ تجربة ١٤ يوماً مجاناً</span>
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </Link>
        <a href="#checker" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-12 px-6 border-[#CCD8CE] bg-white hover:bg-[#E8EFE9] text-[#1B281F] text-base font-semibold transition-all cursor-pointer"
          >
            <span>جرّب أداة قراءة العقود مجاناً</span>
            <ArrowDown className="w-4 h-4 mr-2 text-[#4A5D50]" />
          </Button>
        </a>
      </div>

      {/* Truthful 3-Card Product Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right">
        {WORKSPACE_HIGHLIGHTS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#CCD8CE] p-6 flex flex-col justify-between shadow-xs hover:border-[#1F7A46] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE]">
                    {item.badge}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h2 className="text-lg font-extrabold text-[#1B281F] font-heading leading-snug">
                  {item.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
                  {item.desc}
                </p>

                <ul className="space-y-1.5 pt-1">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-1.5 text-xs font-semibold text-[#1B281F]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A46] shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* Honest Security Micro-line */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#566A5C]">
        <ShieldCheck className="w-4 h-4 text-[#1F7A46]" />
        <span>عزل بيانات لكل مكتب • تشفير AES-256-GCM للملفات • تحقق ثنائي TOTP MFA</span>
      </div>
    </section>
  )
}
