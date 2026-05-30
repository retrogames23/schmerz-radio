CREATE UNIQUE INDEX IF NOT EXISTS dsa_llm_adventures_user_session_uidx
  ON public.dsa_llm_adventures (user_id, session_id)
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS dsa_llm_adventures_anon_session_uidx
  ON public.dsa_llm_adventures (anon_id, session_id)
  WHERE anon_id IS NOT NULL;