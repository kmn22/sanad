# سند (Sanad) — لوحة العمليات اليومية للقانون السعودي

**رابط العرض المباشر:** https://sanad.tail963524.ts.net
**اعتماد العرض التوضيحي:** أي بريد إلكتروني + كلمة المرور `admin`

---

## 🇸🇦 الملخص التنفيذي

**سند** هو لوحة عمليات يومية متكاملة للمحامين السعوديين وطلاب القانون، تجمع بين إدارة القضايا، تتبع الامتثال، الفوترة الإلكترونية ZATCA، وتحليل المستندات بالذكاء الاصطناعي — كل ذلك بواجهة عربية أصيلة من اليمين إلى اليسار، تعمل على الخادم المحلي بدون اعتماد على خدمات سحابية أجنبية.

### المشكلة
المحامي السعودي يدير يومياً: عقود، قضايا، فواتير، تجديدات إقامة، مواعيد جلسات، استشارات طلابية — موزعة على عشرة تطبيقات منفصلة (Excel، WhatsApp، Najiz، Qiwa، ZATCA). لا توجد لوحة واحدة تجمع التزاماته اليومية مع الأنظمة السعودية المُحدّثة.

### الحل
لوحة واحدة، بالعربية، تتبع كل شيء: من تذكير تجديد إقامة الموظف، إلى تحليل عقد بالذكاء الاصطناعي مقابل نظام المعاملات المدنية، إلى توليد فاتورة ZATCA متوافقة.

---

## ⭐ ما يميز سند

| الميزة | التفاصيل |
|---|---|
| **عربي أصيل RTL** | ليست ترجمة — صُممت للمحامي السعودي بمصطلحاته (إقامة، GOSI، ZATCA، نجز) |
| **ذكاء اصطناعي محلي** | يعمل على نموذج Qwen 2.5 14B محلياً عبر Ollama — لا تذهب بيانات العملاء لخوادم أجنبية |
| **بث مباشر للنتائج** | إجابات الذكاء الاصطناعي تظهر كلمة بكلمة (SSE Streaming) |
| **PWA قابل للتثبيت** | يعمل على الهاتف والمكتب، دعم جزئي للعمل بدون إنترنت |
| **وضعان: محامي + طالب** | بنك مصطلحات، بطاقات مراجعة، قاعدة قضايا قابلة للاستذكار |
| **نشر سيادي** | يعمل على خادم منزلي عبر Tailscale Funnel — لا حاجة لـ AWS أو Vercel |

---

## 🛠 التقنيات

- **Next.js 16** (App Router + Server Actions + RSC)
- **TypeScript** عبر القاعدة كاملة
- **Prisma + SQLite** — قاعدة بيانات بسيطة قابلة للنسخ الاحتياطي
- **Ollama + Qwen 2.5 14B** — ذكاء اصطناعي محلي
- **Recharts** — 5 رسومات بيانية للوحة التحكم
- **Tailwind + shadcn/ui** — تصميم متسق
- **Tailscale Funnel** — نشر سيادي بشهادة HTTPS تلقائية

---

## 📊 الأرقام

- ~12,000 سطر من TypeScript/TSX
- 33 نقطة API
- 15 شاشة وظيفية (محامي 11 + طالب 4)
- 5 رسومات تحليلية على لوحة التحكم
- 8 لغات في النظام (عربي/إنجليزي + 6 لغات أخرى مُهيّأة)

---

## 📸 لقطات الشاشة

> _ضع لقطات الشاشة هنا — راجع `/screenshots/` بعد التقاطها._

- لوحة التحكم اليومية مع الرسوم البيانية
- لوحة القضايا (Kanban)
- ماسح المستندات + تحليل الذكاء الاصطناعي
- وضع الطالب — بنك المصطلحات
- العرض على الجوال

---

# 🇬🇧 English Summary

**Sanad** is a daily operations dashboard for Saudi lawyers and law students, unifying case management, compliance tracking, ZATCA invoicing, and AI document analysis — all in an Arabic-first RTL interface running on local infrastructure with no foreign cloud dependencies.

### Problem
A Saudi lawyer juggles cases, contracts, residency renewals, court hearings, and student consultations across 10 disconnected tools (Excel, WhatsApp, Najiz, Qiwa, ZATCA). No single dashboard ties their day to Saudi regulatory updates.

### Solution
One Arabic-native dashboard tracking everything from a driver's residency expiry reminder to AI contract analysis grounded in the Saudi Civil Transactions Law (Royal Decree M/191), to a ZATCA-compliant invoice draft.

### Differentiation
- **Arabic-native, not translated** — built around Saudi legal terminology
- **Local AI (Qwen 2.5 14B via Ollama)** — client data never leaves the machine
- **Token-by-token streaming** — AI responses feel instant
- **Installable PWA** with partial offline support
- **Dual mode** — lawyer + law student views
- **Sovereign deployment** — runs on a home server via Tailscale Funnel, no AWS/Vercel needed

### Stack
Next.js 16, TypeScript, Prisma+SQLite, Ollama (Qwen 2.5 14B), Recharts, Tailwind+shadcn, Tailscale Funnel.

### Demo
**URL:** https://sanad.tail963524.ts.net
**Credentials:** any email + password `admin`
