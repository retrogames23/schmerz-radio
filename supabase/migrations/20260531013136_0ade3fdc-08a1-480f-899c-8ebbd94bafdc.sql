-- Helden-Tabelle (Cloud-Mirror für eingeloggte Spieler)
CREATE TABLE public.dsa_heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slot smallint NOT NULL CHECK (slot BETWEEN 1 AND 3),
  hero jsonb NOT NULL,
  ap_total integer NOT NULL DEFAULT 0,
  ap_spent integer NOT NULL DEFAULT 0,
  adventures_played integer NOT NULL DEFAULT 0,
  adventures_won integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slot)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_heroes TO authenticated;
GRANT ALL ON public.dsa_heroes TO service_role;

ALTER TABLE public.dsa_heroes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own dsa heroes"
  ON public.dsa_heroes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own dsa heroes"
  ON public.dsa_heroes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own dsa heroes"
  ON public.dsa_heroes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own dsa heroes"
  ON public.dsa_heroes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role full access dsa heroes"
  ON public.dsa_heroes FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

CREATE TRIGGER dsa_heroes_updated_at
  BEFORE UPDATE ON public.dsa_heroes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Abenteuer-Tabelle: pro Held mehrere Abenteuer + AP-Vergabe
ALTER TABLE public.dsa_llm_adventures
  ADD COLUMN IF NOT EXISTS hero_slot smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ap_awarded integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ap_reason text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS dsa_llm_adventures_user_slot_idx
  ON public.dsa_llm_adventures (user_id, hero_slot, created_at DESC);
CREATE INDEX IF NOT EXISTS dsa_llm_adventures_anon_slot_idx
  ON public.dsa_llm_adventures (anon_id, hero_slot, created_at DESC);