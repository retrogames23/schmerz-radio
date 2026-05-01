-- NPC long-term memory: per user + npc, a short note + recent message tail
CREATE TABLE public.npc_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  npc_id TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  recent_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, npc_id)
);

ALTER TABLE public.npc_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own npc memory"
  ON public.npc_memory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own npc memory"
  ON public.npc_memory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own npc memory"
  ON public.npc_memory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own npc memory"
  ON public.npc_memory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access npc memory"
  ON public.npc_memory FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER npc_memory_set_updated_at
BEFORE UPDATE ON public.npc_memory
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_npc_memory_user ON public.npc_memory(user_id);

-- Flurfunk: shared gossip pool per user. Each row is one fact that
-- propagated from `source_npc_id` to listeners in `subjects` (npc ids).
CREATE TABLE public.npc_gossip (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_npc_id TEXT NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  fact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.npc_gossip ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own gossip"
  ON public.npc_gossip FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own gossip"
  ON public.npc_gossip FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own gossip"
  ON public.npc_gossip FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access gossip"
  ON public.npc_gossip FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_npc_gossip_user ON public.npc_gossip(user_id);
CREATE INDEX idx_npc_gossip_subjects ON public.npc_gossip USING GIN(subjects);