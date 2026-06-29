import { NextRequest, NextResponse } from 'next/server';
import { ollamaChat } from '@/lib/ai/ollama';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt content is required' }, { status: 400 });
    }

    // Poor-man's RAG: Fetch recent cases to use as context
    const cases = await prisma.legalCase.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        title: true,
        caseType: true,
        stage: true,
        notes: true,
        client: {
          select: { name: true }
        }
      }
    });

    // Format context
    let contextStr = "إليك ملخص لأحدث القضايا في قاعدة بيانات المحامي:\n\n";
    cases.forEach(c => {
      contextStr += `- قضية: ${c.title} (النوع: ${c.caseType}, الحالة: ${c.stage}, العميل: ${c.client?.name})\n`;
      if (c.notes) contextStr += `  ملاحظات: ${c.notes}\n`;
    });

    const systemPrompt = `أنت مساعد قانوني (AI Assistant) يعمل داخل نظام لإدارة مكاتب المحاماة في السعودية يسمى "سند".
يجب عليك الإجابة على استفسارات المحامي بالاعتماد على "السياق" (Context) الذي يمثل بيانات القضايا المخزنة في نظامه.
إذا لم تكن الإجابة موجودة في السياق، أخبر المحامي بذلك، ولكن قدم له نصيحة عامة كزميل.
يجب أن تكون إجاباتك مختصرة واحترافية وباللغة العربية.

السياق الحالي:
${contextStr}
`;

    let replyContent = '';

    try {
      replyContent = await ollamaChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);
    } catch (sdkError: any) {
      console.warn("Ollama failed or unreachable in RAG. Falling back.", sdkError.message);
      replyContent = `عذراً، لم أتمكن من الاتصال بالنموذج المحلي للذكاء الاصطناعي.\n\nولكن بناءً على قاعدة بياناتك، لديك ${cases.length} قضايا حديثة مسجلة.`;
    }

    return NextResponse.json({ success: true, reply: replyContent });
  } catch (error: any) {
    console.error("AI RAG Route failed:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
