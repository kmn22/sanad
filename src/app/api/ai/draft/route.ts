import { NextRequest, NextResponse } from 'next/server';
import { ollamaChat, ollamaChatStream, SAUDI_PROMPTS } from '@/lib/ai/ollama';
import { readJsonLimited, safeErrorResponse } from '@/lib/http';

export async function POST(req: NextRequest) {
  const stream = req.nextUrl.searchParams.get('stream') === '1';

  try {
    const { prompt } = await readJsonLimited<{ prompt?: unknown }>(req, 32 * 1024);

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 20_000) {
      return NextResponse.json({ error: 'Prompt must be between 1 and 20000 characters' }, { status: 400 });
    }

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
            console.warn('Ollama stream failed, sending fallback as one chunk:', e?.message);
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
      console.warn('Ollama failed or unreachable. Falling back to default generated draft.', sdkError.message);
      draftContent = simulateDraft(prompt);
    }
    return NextResponse.json({ success: true, draft: draftContent });
  } catch (error) {
    console.error('AI Draft Route failed:', error);
    return safeErrorResponse(error);
  }
}

function simulateDraft(prompt: string) {
  return `
# مستند قانوني مصاغ بالذكاء الاصطناعي
**التاريخ:** ${new Date().toISOString().slice(0, 10)}

## الموضوع
بناءً على طلبكم: "${prompt}"

## التمهيد
الحمد لله والصلاة والسلام على رسول الله، أما بعد:
فإنه في يوم [اليوم] الموافق [التاريخ]، تم الاتفاق بين كل من:
1. الطرف الأول: [اسم الطرف الأول]، هويته/سجله التجاري: [الرقم].
2. الطرف الثاني: [اسم الطرف الثاني]، هويته: [الرقم].

## البند الأول: الغرض والالتزامات
اتفق الطرفان على الالتزام بجميع الأحكام الواردة في هذا العقد وفقاً للأنظمة المعمول بها في المملكة العربية السعودية، وتحديداً [النظام ذو الصلة].

## البند الثاني: الاختصاص القضائي
في حال نشوء أي نزاع -لا سمح الله- حول تفسير أو تنفيذ هذا العقد، يتم حله ودياً، وفي حال تعذر ذلك، تختص المحاكم السعودية بمدينة [المدينة] بالنظر فيه.

*هذه مسودة تم إنشاؤها تلقائياً لأغراض العرض التوضيحي.*
`.trim();
}
