import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { documentText, type } = await req.json()

    if (!documentText) {
      return NextResponse.json({ error: 'documentText is required' }, { status: 400 })
    }

    let systemPrompt = ''
    if (type === 'ocr_id') {
      systemPrompt = `أنت مساعد قانوني محترف. استخرج البيانات التالية من نص الهوية المدخلة: (الاسم الكامل، رقم الهوية، تاريخ الميلاد، مكان الإصدار). أعد الناتج بصيغة JSON فقط بدون أي نص آخر.`
    } else if (type === 'summarize_judgment') {
      systemPrompt = `أنت محامي سعودي ومستشار قانوني. قم بقراءة نص الحكم القضائي المدخل ولخصه في 3 أقسام:
1. وقائع الدعوى (باختصار)
2. الأسانيد الشرعية والنظامية
3. منطوق الحكم (القرار النهائي)
تأكد من أن اللغة احترافية وقانونية سليمة.`
    } else {
      systemPrompt = `أنت مستشار قانوني سعودي. قم بتحليل المستند التالي واستخراج أهم النقاط القانونية والمخاطر المحتملة.`
    }

    // Call local Ollama Qwen 2.5 14B model
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:14b', // Using the recommended model for Sanad
        prompt: `System: ${systemPrompt}\n\nDocument Text:\n${documentText}`,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate analysis from Ollama')
    }

    const data = await response.json()
    
    return NextResponse.json({ result: data.response })
  } catch (error: any) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json(
      { error: 'Failed to process document analysis', details: error.message },
      { status: 500 }
    )
  }
}
