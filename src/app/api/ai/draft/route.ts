import { NextRequest, NextResponse } from 'next/server';
import { ollamaChat, ollamaChatStream, SAUDI_PROMPTS } from '@/lib/ai/ollama';
import { readJsonLimited, safeErrorResponse } from '@/lib/http';
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace';
import { canWrite, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities';
import { checkAiUsage, incrementUsage } from '@/lib/saas/entitlements';
import { logEvent } from '@/lib/observability'

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
