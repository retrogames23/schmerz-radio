-- =========================================================================
-- dsa_group_rooms
-- =========================================================================
CREATE TABLE public.dsa_group_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id uuid NOT NULL,
  name text NOT NULL,
  password_hash text,
  setting text NOT NULL,
  wish_brief text,
  include_npc_companions boolean NOT NULL DEFAULT false,
  max_players smallint NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'lobby',
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  current_image_tag text NOT NULL DEFAULT 'forest_path',
  summary text NOT NULL DEFAULT '',
  turn_idx integer NOT NULL DEFAULT 0,
  collect_started_at timestamptz,
  ap_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================================
-- dsa_group_members
-- =========================================================================
CREATE TABLE public.dsa_group_members (
  room_id uuid NOT NULL REFERENCES public.dsa_group_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  slot smallint NOT NULL DEFAULT 0,
  hero_snapshot jsonb,
  ready boolean NOT NULL DEFAULT false,
  position smallint NOT NULL DEFAULT 0,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX dsa_group_members_user_idx ON public.dsa_group_members(user_id);

-- =========================================================================
-- dsa_group_messages
-- =========================================================================
CREATE TABLE public.dsa_group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.dsa_group_rooms(id) ON DELETE CASCADE,
  idx integer NOT NULL,
  role text NOT NULL,
  author_user_id uuid,
  author_hero_name text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dsa_group_messages_room_idx ON public.dsa_group_messages(room_id, idx);

-- =========================================================================
-- dsa_group_pending_actions
-- =========================================================================
CREATE TABLE public.dsa_group_pending_actions (
  room_id uuid NOT NULL REFERENCES public.dsa_group_rooms(id) ON DELETE CASCADE,
  turn_idx integer NOT NULL,
  user_id uuid NOT NULL,
  hero_name text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, turn_idx, user_id)
);

-- =========================================================================
-- Helper-Funktion (nach Tabellen, damit Referenz auflöst)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_dsa_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dsa_group_members
    WHERE room_id = _room_id AND user_id = _user_id
  )
$$;

-- =========================================================================
-- GRANTs
-- =========================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_group_rooms TO authenticated;
GRANT ALL ON public.dsa_group_rooms TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_group_members TO authenticated;
GRANT ALL ON public.dsa_group_members TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_group_messages TO authenticated;
GRANT ALL ON public.dsa_group_messages TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_group_pending_actions TO authenticated;
GRANT ALL ON public.dsa_group_pending_actions TO service_role;

-- =========================================================================
-- RLS
-- =========================================================================
ALTER TABLE public.dsa_group_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_group_pending_actions ENABLE ROW LEVEL SECURITY;

-- dsa_group_rooms
CREATE POLICY "Lobby rooms visible to authenticated"
ON public.dsa_group_rooms
FOR SELECT
TO authenticated
USING (status = 'lobby' OR public.is_dsa_room_member(id, auth.uid()));

CREATE POLICY "Host can create room"
ON public.dsa_group_rooms
FOR INSERT
TO authenticated
WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Host can delete room"
ON public.dsa_group_rooms
FOR DELETE
TO authenticated
USING (host_user_id = auth.uid());

CREATE POLICY "Service role full access rooms"
ON public.dsa_group_rooms
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- dsa_group_members
CREATE POLICY "Members can view roommates"
ON public.dsa_group_members
FOR SELECT
TO authenticated
USING (public.is_dsa_room_member(room_id, auth.uid()));

CREATE POLICY "Authenticated can join"
ON public.dsa_group_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members update own row"
ON public.dsa_group_members
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can leave or host can kick"
ON public.dsa_group_members
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.dsa_group_rooms r
    WHERE r.id = room_id AND r.host_user_id = auth.uid()
  )
);

CREATE POLICY "Service role full access members"
ON public.dsa_group_members
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- dsa_group_messages
CREATE POLICY "Members read room messages"
ON public.dsa_group_messages
FOR SELECT
TO authenticated
USING (public.is_dsa_room_member(room_id, auth.uid()));

CREATE POLICY "Service role full access messages"
ON public.dsa_group_messages
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- dsa_group_pending_actions
CREATE POLICY "Members read pending actions"
ON public.dsa_group_pending_actions
FOR SELECT
TO authenticated
USING (public.is_dsa_room_member(room_id, auth.uid()));

CREATE POLICY "Members insert own pending action"
ON public.dsa_group_pending_actions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND public.is_dsa_room_member(room_id, auth.uid()));

CREATE POLICY "Service role full access pending"
ON public.dsa_group_pending_actions
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =========================================================================
-- updated_at-Trigger
-- =========================================================================
CREATE TRIGGER dsa_group_rooms_set_updated_at
BEFORE UPDATE ON public.dsa_group_rooms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- Realtime
-- =========================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.dsa_group_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dsa_group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dsa_group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dsa_group_pending_actions;