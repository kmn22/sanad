-- ============================================================================
-- Maqar (مقر) AI Legal Assistant — PostgreSQL `pgvector` + Hybrid Search DDL
-- File: prisma/pgvector_statutory_index.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS statutory_article_chunks (
    id TEXT PRIMARY KEY,
    statute_name TEXT NOT NULL,
    article_number TEXT NOT NULL,
    promulgation_date TEXT NOT NULL,
    paragraph_ref TEXT,
    article_title TEXT,
    content TEXT NOT NULL,
    normalized_content TEXT NOT NULL,
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    -- OpenAI `text-embedding-3-small` 1536-dimensional embedding vector
    embedding vector(1536),
    tsv tsvector GENERATED ALWAYS AS (to_tsvector('arabic', content)) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index for sub-10ms approximate nearest neighbor (ANN) cosine similarity
CREATE INDEX IF NOT EXISTS idx_statutory_chunks_embedding_hnsw
    ON statutory_article_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- GIN index for fast Arabic keyword / BM25 full-text matching
CREATE INDEX IF NOT EXISTS idx_statutory_chunks_tsv_gin
    ON statutory_article_chunks
    USING GIN (tsv);

-- Composite B-Tree index on statute_name + article_number for exact citation lookups
CREATE UNIQUE INDEX IF NOT EXISTS uq_statutory_statute_article_para
    ON statutory_article_chunks (statute_name, article_number, COALESCE(paragraph_ref, 'MAIN'));

