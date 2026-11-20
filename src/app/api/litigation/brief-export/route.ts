import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  generateBriefDocxBuffer,
  generateCourtReadyPdfHtml,
} from '@/lib/litigation/brief-exporter'

const briefExportSchema = z.object({
  format: z.enum(['DOCX', 'PDF_HTML']).default('DOCX'),
  brief: z.object({
    title: z.string().min(3).max(300),
    caseNumber: z.string().min(1).max(100),
    courtName: z.string().min(2).max(200),
    circuitName: z.string().min(2).max(200),
    hearingDate: z.string().optional(),
    plaintiffName: z.string().min(2).max(300),
    defendantName: z.string().min(2).max(300),
    submittedByRole: z
      .enum(['PLAINTIFF', 'DEFENDANT', 'APPELLANT', 'APPELLEE'])
      .default('DEFENDANT'),
    counselName: z.string().optional(),
    licenseNumber: z.string().optional(),
    sections: z.object({
      partiesAndFacts: z.string().min(1),
      formalAndSubstantiveDefenses: z.string().min(1),
      statutoryAndShariaBases: z.string().min(1),
      finalRemedies: z.string().min(1),
    }),
  }),
})

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = briefExportSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid pleading brief payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { format, brief } = parsed.data

    if (format === 'PDF_HTML') {
      const html = generateCourtReadyPdfHtml(brief)
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    const docxBytes = await generateBriefDocxBuffer(brief)
    const safeFilename = `maqar-brief-${brief.caseNumber.replace(/[^a-zA-Z0-9_-]/g, '') || 'case'}.docx`

    return new NextResponse(Buffer.from(docxBytes), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export pleading brief' },
      { status: 500 }
    )
  }
}

