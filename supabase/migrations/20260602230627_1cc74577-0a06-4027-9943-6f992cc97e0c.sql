DELETE FROM public.dsa_group_messages a
USING public.dsa_group_messages b
WHERE a.room_id = b.room_id
  AND a.idx = b.idx
  AND a.created_at > b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS dsa_group_messages_room_idx_unique
  ON public.dsa_group_messages (room_id, idx);