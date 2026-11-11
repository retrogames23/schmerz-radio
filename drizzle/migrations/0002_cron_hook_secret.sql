CREATE TABLE public.internal_hook_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.internal_hook_secrets FROM anon, authenticated;
GRANT ALL ON public.internal_hook_secrets TO service_role;
ALTER TABLE public.internal_hook_secrets ENABLE ROW LEVEL SECURITY;
INSERT INTO public.internal_hook_secrets (name, value)
VALUES ('llm_benchmark', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (name) DO NOTHING;