
CREATE TABLE public.marv_state (
  user_id uuid PRIMARY KEY,
  empathy_score integer NOT NULL DEFAULT 0,
  unlocked boolean NOT NULL DEFAULT false,
  oiled boolean NOT NULL DEFAULT false,
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marv_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own marv state"
  ON public.marv_state
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access marv_state"
  ON public.marv_state
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER marv_state_set_updated_at
  BEFORE UPDATE ON public.marv_state
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
