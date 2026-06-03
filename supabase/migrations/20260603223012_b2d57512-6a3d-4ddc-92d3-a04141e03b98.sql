ALTER TABLE public.dsa_heroes DROP CONSTRAINT IF EXISTS dsa_heroes_slot_check;
ALTER TABLE public.dsa_heroes ADD CONSTRAINT dsa_heroes_slot_check CHECK (slot >= 1 AND slot <= 6);