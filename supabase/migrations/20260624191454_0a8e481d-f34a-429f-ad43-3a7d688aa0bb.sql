CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.dsa_rulebook_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  page_start integer NOT NULL,
  page_end integer NOT NULL,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  content_hash text NOT NULL,
  token_estimate integer,
  embedding vector(1536) NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, content_hash)
);

GRANT ALL ON public.dsa_rulebook_chunks TO service_role;

ALTER TABLE public.dsa_rulebook_chunks ENABLE ROW LEVEL SECURITY;

CREATE INDEX dsa_rulebook_chunks_embedding_idx
  ON public.dsa_rulebook_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX dsa_rulebook_chunks_source_idx
  ON public.dsa_rulebook_chunks (source);

CREATE OR REPLACE FUNCTION public.match_dsa_rulebook(
  query_embedding vector(1536),
  match_count integer DEFAULT 5,
  source_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source text,
  page_start integer,
  page_end integer,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.source,
    c.page_start,
    c.page_end,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.dsa_rulebook_chunks c
  WHERE source_filter IS NULL OR c.source = source_filter
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

REVOKE ALL ON FUNCTION public.match_dsa_rulebook(vector, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.match_dsa_rulebook(vector, integer, text) FROM anon;
REVOKE ALL ON FUNCTION public.match_dsa_rulebook(vector, integer, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.match_dsa_rulebook(vector, integer, text) TO service_role;