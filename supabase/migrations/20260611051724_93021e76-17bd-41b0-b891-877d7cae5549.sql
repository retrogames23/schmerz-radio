CREATE TABLE public.dsa_model_telemetry (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  model TEXT NOT NULL,
  label TEXT,
  round INT,
  max_rounds INT,
  use_tools BOOLEAN,
  prompt_tokens INT,
  completion_tokens INT,
  cached_tokens INT,
  cache_create_tokens INT,
  tool_calls INT,
  fallback BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX dsa_model_telemetry_model_created_idx ON public.dsa_model_telemetry (model, created_at DESC);
GRANT ALL ON public.dsa_model_telemetry TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.dsa_model_telemetry_id_seq TO service_role;
ALTER TABLE public.dsa_model_telemetry ENABLE ROW LEVEL SECURITY;
-- Keine Policies: nur service_role (bypasses RLS) darf zugreifen.