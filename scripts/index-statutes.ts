/**
 * ============================================================================
 * Maqar (مقر) AI Legal Assistant — Statutory Corpus Indexing Script
 * (`scripts/index-statutes.ts`)
 * ============================================================================
 *
 * Usage:
 *   npx tsx scripts/index-statutes.ts
 *   npm run rag:index
 *
 * Pipeline steps:
 *   1. Loads authoritative Saudi statutory texts (نظام المعاملات المدنية،
 *      نظام العمل، نظام الشركات، نظام حماية البيانات الشخصية، نظام المرافعات الشرعية).
 *   2. Chunks each document structurally by Article & Paragraph (`بالمادة والفقرة`)
 *      preserving `statute_name`, `article_number`, and `promulgation_date`.
 *   3. Computes vector embeddings (`text-embedding-3-small` or deterministic
 *      multilingual embedding vector).
 *   4. Upserts chunks idempotently into PostgreSQL (`KnowledgeResearchItem`
 *      and `statutory_article_chunks` when `pgvector` is installed).
 */

import { PrismaClient, KnowledgeCategory } from '@prisma/client'
import {
  DEFAULT_SAUDI_STATUTORY_DOCUMENTS,
  chunkStatuteByArticles,
  generateStatutoryEmbedding,
  registerStatutoryChunks,
} from '../src/lib/ai/maqar-rag-pipeline'

const prisma = new PrismaClient()

async function runStatutoryIndexingPipeline() {
  console.log('📚 [Maqar RAG Indexer] Starting structural article-level statutory indexing...')

  const allChunks = DEFAULT_SAUDI_STATUTORY_DOCUMENTS.flatMap((doc) =>
    chunkStatuteByArticles(doc)
  )

  console.log(
    `🔹 Parsed ${DEFAULT_SAUDI_STATUTORY_DOCUMENTS.length} Saudi statutes into ${allChunks.length} structural Article/Paragraph chunks.`
  )

  // Resolve an author user for KnowledgeResearchItem persistence if available
  const systemAuthor = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true, workspace: { select: { orgId: true } } },
  })

  let persistedCount = 0

  for (const chunk of allChunks) {
    const { vector, model } = await generateStatutoryEmbedding(chunk.text)
    chunk.embedding = vector

    console.log(
      `   ✓ [${chunk.metadata.statute_name}] ${chunk.metadata.article_number} (${chunk.metadata.promulgation_date}) — dim=${vector.length} (${model})`
    )

    if (systemAuthor) {
      await prisma.knowledgeResearchItem.upsert({
        where: { id: `statute-chunk-${chunk.id}` },
        update: {
          title: `${chunk.metadata.statute_name} — ${chunk.metadata.article_number}`,
          body: chunk.text,
          category: KnowledgeCategory.LEGAL_PRECEDENT,
          tags: [
            chunk.metadata.statute_name,
            chunk.metadata.article_number,
            chunk.metadata.promulgation_date,
            ...(chunk.metadata.paragraph_ref ? [chunk.metadata.paragraph_ref] : []),
          ],
          isPublic: true,
        },
        create: {
          id: `statute-chunk-${chunk.id}`,
          authorId: systemAuthor.id,
          orgId: systemAuthor.workspace?.orgId ?? null,
          title: `${chunk.metadata.statute_name} — ${chunk.metadata.article_number}`,
          body: chunk.text,
          category: KnowledgeCategory.LEGAL_PRECEDENT,
          tags: [
            chunk.metadata.statute_name,
            chunk.metadata.article_number,
            chunk.metadata.promulgation_date,
            ...(chunk.metadata.paragraph_ref ? [chunk.metadata.paragraph_ref] : []),
          ],
          isPublic: true,
        },
      })
      persistedCount++
    }
  }

  const totalInMemory = registerStatutoryChunks(allChunks)
  console.log(
    `✅ [Maqar RAG Indexer] Completed! Indexed ${totalInMemory} article-level chunks (${persistedCount} persisted to PostgreSQL).`
  )
}

runStatutoryIndexingPipeline()
  .catch((err) => {
    console.error('❌ [Maqar RAG Indexer] Fatal error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

