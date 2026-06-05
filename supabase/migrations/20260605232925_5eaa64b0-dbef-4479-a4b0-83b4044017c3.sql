UPDATE public.dsa_llm_adventures AS a
SET hero_slot = h.slot
FROM public.dsa_heroes AS h
WHERE h.user_id = a.user_id
  AND h.hero->>'name' = a.character_snapshot->>'name'
  AND a.hero_slot <> h.slot;