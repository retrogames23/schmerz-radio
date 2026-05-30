GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_llm_adventures TO authenticated;
GRANT ALL ON public.dsa_llm_adventures TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS dsa_llm_adventures_user_session_conflict_uidx
  ON public.dsa_llm_adventures (user_id, session_id);

CREATE UNIQUE INDEX IF NOT EXISTS dsa_llm_adventures_anon_session_conflict_uidx
  ON public.dsa_llm_adventures (anon_id, session_id);