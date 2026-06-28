import { NextRequest, NextResponse } from 'next/server';
import { ollamaChat } from '@/lib/ai/ollama';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt content is required' }, { status: 400 });
    }

    let draftContent = '';

    try {
      draftContent = await ollamaChat([
        { role: 'system', content: 'أنت محامٍ محترف ومستشار قانوني سعودي. قم بصياغة العقود والمستندات القانونية باحترافية عالية مع الالتزام بالأنظمة السعودية (مثل نظام العمل، نظام المعاملات المدنية، أو نظام الشركات). قم بإرجاع نص المستند مباشرة بتنسيق Markdown متوافق، بدون أي مقدمات أو شروحات إضافية.' },
        { role: 'user', content: prompt }
      ]);
    } catch (sdkError: any) {
      console.warn("Ollama failed or unreachable. Falling back to default generated draft.", sdkError.message);
      
      // Fallback: Default draft text
      draftContent = simulateDraft(prompt);
    }

    return NextResponse.json({ success: true, draft: draftContent });
  } catch (error: any) {
    console.error("AI Draft Route failed:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
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
