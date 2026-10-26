CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE TABLE public.llm_quarterly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  current_model text NOT NULL,
  recommendation text,
  results jsonb NOT NULL DEFAULT '[]'::jsonb
);
GRANT ALL ON public.llm_quarterly_reports TO service_role;
ALTER TABLE public.llm_quarterly_reports ENABLE ROW LEVEL SECURITY;