-- Add per-game-instance scope to DSA LLM adventures.
ALTER TABLE public.dsa_llm_adventures
  ADD COLUMN IF NOT EXISTS session_id UUID;

-- Backfill any legacy rows with a generated session id so the new PK is valid.
UPDATE public.dsa_llm_adventures
  SET session_id = gen_random_uuid()
  WHERE session_id IS NULL;

ALTER TABLE public.dsa_llm_adventures
  ALTER COLUMN session_id SET NOT NULL,
  ALTER COLUMN session_id SET DEFAULT gen_random_uuid();

-- Swap primary key from user_id to (user_id, session_id).
ALTER TABLE public.dsa_llm_adventures
  DROP CONSTRAINT IF EXISTS dsa_llm_adventures_pkey;

ALTER TABLE public.dsa_llm_adventures
  ADD CONSTRAINT dsa_llm_adventures_pkey PRIMARY KEY (user_id, session_id);
