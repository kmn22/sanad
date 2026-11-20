import { Lock, KeyRound, History, ShieldCheck, Cpu } from 'lucide-react'
import Link from 'next/link'

const TRUST_CARDS = [
  {
    icon: ShieldCheck,
    title: 'عزل مساحات العمل والملفات السرية',
    desc: 'كل مكتب محاماة يعمل داخل نطاق معزول، مع إمكانية قصر القضايا الحساسة على أعضاء محددين فقط.',
  },
  {
    icon: Lock,
    title: 'تشفير الملفات بـ AES-256-GCM',
    desc: 'المرفقات المرفوعة وخزنة المستندات تُشفّر على القرص بمفاتيح خاصة وتُتحقق سلامتها عند القراءة.',
  },
  {
    icon: KeyRound,
    title: 'تحقق ثنائي TOTP وبوابة OTP للموكل',
    desc: 'مصادقة ثنائية لحسابات المحامين، وروابط بوابة للموكّل محمية برمز تحقق لمرة واحدة وتاريخ انتهاء.',
  },
  {
    icon: History,
    title: 'سجل تدقيق متسلسل ومراقبة PDPL',
    desc: 'تسجيل أمني للعمليات الحساسة وتصاريح الوصول، مع نموذج مخصص لطلبات الخصوصية وإقرار الاستخدام.',
  },
]

export function TrustLayerSection() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#CCD8CE] bg-[#F5F7F5]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-bold text-[#1F7A46] uppercase tracking-wider mb-2">الشفافية التقنية والأمان</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B281F] font-heading">
            حماية عملية مصممة لخصوصية ملفات موكّليك
          </h2>
          <p className="text-sm text-[#4A5D50] mt-2">
            نلتزم بوصف الضوابط الأمنية الموجودة فعلياً في الشيفرة التشغيلية دون مبالغة أو وعود شهادات غير صادرة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST_CARDS.map((card) => (
            <div key={card.title} className="rounded-2xl border border-[#CCD8CE] bg-white p-5 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] grid place-items-center">
                <card.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1B281F] font-heading">{card.title}</h3>
              <p className="text-xs text-[#4A5D50] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#CCD8CE] bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cpu className="w-5 h-5 text-[#1F7A46] shrink-0 mt-0.5" />
            <div className="text-xs text-[#4A5D50] leading-relaxed">
              <strong className="text-[#1B281F] block mb-0.5">شفافية الذكاء الاصطناعي وأدوات القراءة العامة</strong>
              فاحص البنود في هذه الصفحة يعمل بقواعد برمجية محلية سريعة ولا يعتمد على إرسال بياناتك إلى نماذج خارجية، كما تتطلب مخرجات المسودات الداخلية مراجعة محامٍ مرخّص دائماً.
            </div>
          </div>
          <Link
            href="/ai-disclosure"
            className="text-xs font-bold text-[#1F7A46] hover:underline shrink-0"
          >
            اقرأ إفصاح الذكاء الاصطناعي ←
          </Link>
        </div>
      </div>
    </section>
  )
}
