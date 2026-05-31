ALTER TABLE public.dsa_heroes
  ADD COLUMN IF NOT EXISTS chronicle jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS npcs jsonb NOT NULL DEFAULT '[]'::jsonb;