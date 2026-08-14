-- ═══════════════════════════════════════════════════════════
-- Aegis AI — pgvector HNSW Index Setup
-- ═══════════════════════════════════════════════════════════

-- HNSW Vector Index for ultra-fast approximate nearest neighbor search
-- Uses cosine distance for semantic similarity
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
ON document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Function for hybrid search combining vector similarity + keyword search
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding vector(1536),
  query_text text,
  workspace_uuid uuid,
  match_count int DEFAULT 10,
  vector_weight float DEFAULT 0.7,
  keyword_weight float DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  page_number int,
  similarity_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.chunk_index,
    dc.page_number,
    (
      vector_weight * (1 - (dc.embedding <=> query_embedding)) +
      keyword_weight * ts_rank_cd(to_tsvector('english', dc.content), plainto_tsquery('english', query_text))
    )::float AS similarity_score
  FROM document_chunks dc
  WHERE dc.workspace_id = workspace_uuid
    AND dc.embedding IS NOT NULL
  ORDER BY similarity_score DESC
  LIMIT match_count;
END;
$$;
