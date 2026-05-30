
ALTER TABLE public.dsa_llm_adventures DROP CONSTRAINT dsa_llm_adventures_pkey;
ALTER TABLE public.dsa_llm_adventures ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.dsa_llm_adventures ADD COLUMN anon_id text;
ALTER TABLE public.dsa_llm_adventures ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.dsa_llm_adventures ADD PRIMARY KEY (id);
ALTER TABLE public.dsa_llm_adventures
  ADD CONSTRAINT dsa_llm_adventures_owner_check
  CHECK ((user_id IS NOT NULL) <> (anon_id IS NOT NULL));
CREATE UNIQUE INDEX dsa_llm_adventures_user_session_uq
  ON public.dsa_llm_adventures (user_id, session_id)
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX dsa_llm_adventures_anon_session_uq
  ON public.dsa_llm_adventures (anon_id, session_id)
  WHERE anon_id IS NOT NULL;
CREATE INDEX dsa_llm_adventures_anon_id_idx
  ON public.dsa_llm_adventures (anon_id)
  WHERE anon_id IS NOT NULL;
