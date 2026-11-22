import { NextRequest, NextResponse } from 'next/server';
import { ollamaChat, ollamaChatStream, SAUDI_PROMPTS } from '@/lib/ai/ollama';
import { readJsonLimited, safeErrorResponse } from '@/lib/http';
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace';
import { canWrite, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities';
import { checkAiUsage, incrementUsage } from '@/lib/saas/entitlements';
import { logEvent } from '@/lib/observability'
import { formatDualHijriGregorian } from '@/lib/dates'

export async function POST(req: NextRequest) {
  const stream = req.nextUrl.searchParams.get('stream') === '1';

  try {
    const auth = await getAuthContext();
    if (!auth) return unauthorizedJson();
    const denied = denyUnless(auth, canWrite(auth));
    if (denied) return denied;
    const workspaceId = auth.workspaceId;
    const quota = await checkAiUsage(workspaceId);
    if (!quota.allowed) {
      return NextResponse.json({ error: 'AI usage limit reached for the current plan', code: quota.code }, { status: 403 });
    }
    const { prompt } = await readJsonLimited<{ prompt?: unknown }>(req, 32 * 1024);

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 20_000) {
      return NextResponse.json({ error: 'Prompt must be between 1 and 20000 characters' }, { status: 400 });
    }

    await incrementUsage(workspaceId, 'ai_requests');

    const messages = [
      { role: 'system' as const, content: SAUDI_PROMPTS.draft },
      { role: 'user' as const, content: prompt },
    ];

    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const send = (event: string, data: string) => {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data.replace(/\n/g, '\\n')}\n\n`));
          };
          try {
            for await (const chunk of ollamaChatStream(messages)) {
              send('token', chunk);
            }
            send('done', '');
          } catch (e: any) {
            logEvent('warn', 'Ollama stream failed, sending fallback as one chunk', { req, errMessage: e?.message, route: 'POST /api/ai/draft' });
            send('token', simulateDraft(prompt));
            send('done', '');
          } finally {
            controller.close();
          }
        },
      });
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    let draftContent = '';
    try {
      draftContent = await ollamaChat(messages);
    } catch (sdkError: any) {
      logEvent('warn', 'Ollama failed or unreachable. Falling back to default generated draft.', { req, errMessage: sdkError?.message, route: 'POST /api/ai/draft' });
      draftContent = simulateDraft(prompt);
    }
    return NextResponse.json({ success: true, draft: draftContent });
  } catch (error) {
        return safeErrorResponse(error, req, { route: 'POST /api/ai/draft' });
  }
}

function simulateDraft(prompt: string) {
  const dualToday = formatDualHijriGregorian(new Date(), 'ar')
  const p = prompt.trim()

  if (/أتعاب|محاماة|تمثيل قضائي/.test(p)) {
    return `
# عقد أتعاب محاماة وتمثيل قضائي
**التاريخ:** ${dualToday.combined}

## أطراف العقد
1. **الطرف الأول (مكتب المحاماة):** [اسم المكتب / المحامي المرخص]، ترخيص وزارة العدل رقم: [رقم الترخيص]، وعنوانه: [المدينة — الحي].
2. **الطرف الثاني (الموكّل):** [اسم الموكّل / المنشأة]، هوية وطنية / سجل تجاري رقم: [الرقم]، جوال: [رقم الجوال].

## البند الأول: نطاق العمل القانوني
يتولى الطرف الأول تمثيل الطرف الثاني والمرافعة والمدافعة وتقديم المذكرات في الموضوع الآتي:
(${p})
وذلك أمام الجهات القضائية المختصة في المملكة العربية السعودية وفق أحكام نظام المحاماة ولائحته التنفيذية.

## البند الثاني: الأتعاب وطريقة السداد
1. اتفق الطرفان على تحديد أتعاب الطرف الأول بمبلغ إجمالي قدره ([المبلغ] ريال سعودي) غير شامل لضريبة القيمة المضافة (15%).
2. تُسدد الدفعة المقدمة وقدرها ([المبلغ] ر.س) عند توقيع هذا العقد، والدفعة النهائية عند صدور الحكم الابتدائي.

## البند الثالث: التزامات الموكّل والسرية المهنية
يلتزم الطرف الثاني بتزويد الطرف الأول بالوكالة الشرعية والمستندات الصحيحة، ويلتزم الطرف الأول بالحفاظ على سرية كافة المعلومات والوثائق وفق نظام المحاماة ونظام حماية البيانات الشخصية.

## البند الرابع: الاختصاص القضائي
يخضع هذا العقد للأنظمة السارية في المملكة العربية السعودية، وتختص المحاكم المختصة بمدينة [الرياض / جدة] بالفصل في أي نزاع ينشأ عنه.
`.trim()
  }

  if (/إنذار|إخطار|مطالبة بالسداد|قبل رفع دعوى/.test(p)) {
    return `
# إخطار رسمي بالأداء والسداد قبل قيد الدعوى القضائية
**التاريخ:** ${dualToday.combined}

**الموجّه إليه (المنذَر):** [اسم الطرف المدين / الشركة] — سجل تجاري / هوية رقم: [الرقم]
**الموجّه منه (المنذِر):** مكتب [اسم المحامي] بصفته وكيلاً شرعياً عن [اسم الموكّل] بموجب الوكالة رقم [رقم الوكالة].

## الموضوع: إخطار رسمي أخير بالسداد وفق نظام المحاكم التجارية ونظام المعاملات المدنية
إشارةً إلى العلاقة التعاقدية والمطالبة الموضحة أدناه:
(${p})

وحيث ثبت ترصد المبلغ المستحق في ذمتكم وقدره ([المبلغ] ريال سعودي) رغم حلول أجله؛ فإننا نخطركم رسمياً بضرورة سداد كامل المبلغ خلال مدة أقصاها **(خمسة عشر يوماً)** من تاريخ هذا الإخطار، وإلا سيضطر موكلنا لقيد الدعوى القضائية أمام المحكمة المختصة والمطالبة بالأصل والتعويض عن أتعاب التقاضي.
`.trim()
  }

  if (/عدم إفصاح|سرية|NDA/i.test(p)) {
    return `
# اتفاقية عدم إفصاح وحفظ سرية المعلومات (NDA)
**التاريخ:** ${dualToday.combined}

تم إبرام هذه الاتفاقية بين كل من:
1. **الطرف الأول:** [اسم الطرف الأول]، سجل تجاري / هوية رقم: [الرقم].
2. **الطرف الثاني:** [اسم الطرف الثاني]، سجل تجاري / هوية رقم: [الرقم].

## البند الأول: تعريف المعلومات السرية والغرض
تشمل المعلومات السرية كافة البيانات والمستندات المتبادلة بخصوص: (${p}).

## البند الثاني: التزامات السرية وحماية البيانات الشخصية
يلتزم كل طرف بالمحافظة على سرية المعلومات وعدم الإفصاح عنها لأي طرف ثالث، والالتزام التام بأحكام نظام حماية البيانات الشخصية السعودي (PDPL) الصادر بالمرسوم الملكي رقم (م/19).

## البند الثالث: المدة والاختصاص القضائي
تسري هذه الاتفاقية لمدة ([سنتين]) من تاريخ توقيعها، وتختص محاكم المملكة العربية السعودية بالفصل في أي نزاع ينشأ عن تطبيقها.
`.trim()
  }

  return `
# مسودة مستند قانوني — مقر (Maqar)
**التاريخ:** ${dualToday.combined}

## الموضوع
${p}

## التمهيد
الحمد لله والصلاة والسلام على رسول الله، أما بعد:
فإنه بتاريخ ${dualToday.combined}، تم الاتفاق والتوثيق بين كل من:
1. **الطرف الأول:** [اسم الطرف الأول]، هويته/سجله التجاري: [الرقم].
2. **الطرف الثاني:** [اسم الطرف الثاني]، هويته/سجله التجاري: [الرقم].

## البند الأول: الغرض والالتزامات التعاقدية
اتفق الطرفان على الالتزام بالأحكام الموضحة أعلاه وفقاً للأنظمة السارية في المملكة العربية السعودية، وبما يتفق مع أحكام نظام المعاملات المدنية.

## البند الثاني: الإخطارات والاختصاص القضائي
تُوجّه الإخطارات بين الطرفين كتابةً على العناوين الوطنية الموثقة، وفي حال نشوء أي نزاع يتعذر حله ودياً، تختص المحاكم المختصة في المملكة العربية السعودية بمدينة [الرياض] بالفصل فيه.
`.trim()
}
