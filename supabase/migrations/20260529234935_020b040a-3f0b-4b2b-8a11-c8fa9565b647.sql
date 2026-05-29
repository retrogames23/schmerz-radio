
-- DSA LLM-Tafelrunde: persistenter Spielstand pro User
CREATE TABLE public.dsa_llm_adventures (
  user_id UUID PRIMARY KEY,
  setting TEXT NOT NULL,
  character_snapshot JSONB NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NOT NULL DEFAULT '',
  current_image_tag TEXT NOT NULL DEFAULT 'forest_path',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','victory','defeat','aborted')),
  offtopic_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_llm_adventures TO authenticated;
GRANT ALL ON public.dsa_llm_adventures TO service_role;

ALTER TABLE public.dsa_llm_adventures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own dsa adventure"
  ON public.dsa_llm_adventures FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own dsa adventure"
  ON public.dsa_llm_adventures FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own dsa adventure"
  ON public.dsa_llm_adventures FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own dsa adventure"
  ON public.dsa_llm_adventures FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access dsa adventures"
  ON public.dsa_llm_adventures FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER set_dsa_llm_adventures_updated_at
  BEFORE UPDATE ON public.dsa_llm_adventures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
