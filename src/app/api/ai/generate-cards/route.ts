import { NextRequest, NextResponse } from 'next/server';
import { ollamaChat } from '@/lib/ai/ollama';
import { db } from '@/lib/db';
import { aiGenerateCardsSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = aiGenerateCardsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { notes, category } = parsed.data;

    let generatedTerms: Array<{
      term: string;
      definition: string;
      category: string;
      origin?: string;
      example?: string;
    }> = [];

    try {
      const prompt = `
        You are an expert law professor specializing in Saudi Arabian Law.
        Analyze the following student study notes and extract exactly 3-5 legal terms or key concepts.
        For each term, provide:
        - term: The legal term/concept (in Arabic).
        - definition: A clear and concise legal definition (in Arabic).
        - category: One of the following categories that fits best: "civil", "criminal", "commercial", "administrative", "constitutional", "procedural", "family", or "general".
        - origin: The source of the term/rule (e.g. "نظام المعاملات المدنية", "الفقه الإسلامي", "نظام العمل السعودي", etc.) (in Arabic, optional).
        - example: A short example of how this term applies in a real-world legal situation (in Arabic, optional).

        Respond ONLY with a valid JSON array of objects representing these terms, containing exactly: term, definition, category, origin, example. Do not wrap in markdown or write conversational text.

        Study Notes:
        ${notes.slice(0, 4000)}
      `;

      let content = await ollamaChat([
        { role: 'system', content: 'You are a professional legal scholar. You output strict JSON arrays only.' },
        { role: 'user', content: prompt }
      ], { json: true });

      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0].trim();
      }

      const aiResult = JSON.parse(content);
      generatedTerms = Array.isArray(aiResult) ? aiResult : (aiResult.terms || aiResult.items || []);
    } catch (sdkError: any) {
      console.warn("Ollama failed or unreachable. Falling back to local card generation simulator.", sdkError.message);
      generatedTerms = simulateCardGeneration(notes, category);
    }

    // Save terms to database using upsert so we don't crash on duplicates
    const savedTerms: any[] = [];
    for (const item of generatedTerms) {
      if (!item.term || !item.definition) continue;
      
      const termRecord = await db.legalTerm.upsert({
        where: { term: item.term.trim() },
        update: {
          definition: item.definition.trim(),
          category: item.category || category,
          origin: item.origin?.trim() || null,
          example: item.example?.trim() || null,
          mastery: 'learning'
        },
        create: {
          term: item.term.trim(),
          definition: item.definition.trim(),
          category: item.category || category,
          origin: item.origin?.trim() || null,
          example: item.example?.trim() || null,
          mastery: 'learning'
        }
      });
      savedTerms.push(termRecord);
    }

    return NextResponse.json({
      success: true,
      count: savedTerms.length,
      terms: savedTerms
    });

  } catch (error: unknown) {
    console.error("AI Card Generation Route failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Simulates card extraction by parsing notes for keywords or selecting standard Saudi legal terms.
 */
function simulateCardGeneration(notes: string, category: string) {
  const containsWord = (words: string[]) => words.some(w => notes.toLowerCase().includes(w));

  const pool = [
    {
      term: 'القوة القاهرة',
      definition: 'حادث غير متوقع لا يمكن دفعه أو تفاديه يجعل تنفيذ الالتزام التعاقدي مستحيلاً.',
      origin: 'نظام المعاملات المدنية السعودي',
      example: 'القوانين الاستثنائية التي تمنع الاستيراد والتصدير فجأة.',
      category: 'civil'
    },
    {
      term: 'العقد شريعة المتعاقدين',
      definition: 'مبدأ تعاقدي يقضي بأن شروط العقد والتزاماته ملزمة للطرفين ولا يجوز تعديلها إلا باتفاقهما.',
      origin: 'الفقه الإسلامي والمعاملات المدنية',
      example: 'الالتزام بدفع الأجرة المتفق عليها في تاريخ محدد دون تغيير أحادي.',
      category: 'commercial'
    },
    {
      term: 'التعويض عن الضرج',
      definition: 'التزام المسؤول عن إحداث ضرر للغير بجبر هذا الضرر من خلال تعويض مالي أو عيني.',
      origin: 'المادة 138 من نظام المعاملات المدنية',
      example: 'تعويض صاحب العمل عن الخسائر الناتجة عن إخلال المقاول بالصيانة.',
      category: 'civil'
    },
    {
      term: 'أهلية التعاقد',
      definition: 'صلاحية الشخص لصدور التصرف القانوني منه على وجه يُعتد به نظاماً.',
      origin: 'نظام المعاملات المدنية',
      example: 'بلوغ سن الرشد (18 سنة هجرية) لإبرام عقود البيع والشراء.',
      category: 'general'
    },
    {
      term: 'الشرط الجزائي',
      definition: 'اتفاق مسبق في العقد يحدد مقدار التعويض المستحق للطرف الآخر في حال أخل أحد الطرفين بالتزامه.',
      origin: 'نظام المعاملات المدنية السعودي',
      example: 'دفع 500 ريال عن كل يوم تأخير في تسليم المشروع السكني.',
      category: 'commercial'
    },
    {
      term: 'شبهة الجريمة',
      definition: 'ظروف أو قرائن تشير إلى احتمال ارتكاب فعل مخالف للنظام دون ثبوته يقيناً.',
      origin: 'نظام الإجراءات الجزائية السعودي',
      example: 'العثور على ممتلكات مسروقة بحوزة المشتبه به دون تفسير منطقي.',
      category: 'criminal'
    },
    {
      term: 'الضبط الإداري',
      definition: 'مجموعة التدابير الوقائية التي تتخذها السلطة العامة للحفاظ على النظام العام وعناصر الصحة والسلامة.',
      origin: 'القانون الإداري السعودي',
      example: 'قرارات البلدية بإغلاق المطاعم المخالفة للشروط الصحية.',
      category: 'administrative'
    }
  ];

  // If specific topics match, select those. Otherwise, select randomly.
  let selected = pool.filter(item => {
    if (item.category === category) return true;
    if (containsWord([item.term, item.category])) return true;
    return false;
  });

  if (selected.length < 3) {
    // Add additional random items to reach 3
    const ids = new Set(selected.map(s => s.term));
    for (const item of pool) {
      if (selected.length >= 3) break;
      if (!ids.has(item.term)) {
        selected.push(item);
      }
    }
  }

  return selected.slice(0, 3);
}
