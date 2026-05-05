
-- 1) Owner-Tabellen
CREATE TABLE public.pub_chat_message_owners (
  message_id uuid PRIMARY KEY REFERENCES public.pub_chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pub_chat_message_owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can read their own pub chat ownership"
  ON public.pub_chat_message_owners FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role full access pub chat owners"
  ON public.pub_chat_message_owners FOR ALL TO public
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TABLE public.toilet_graffiti_owners (
  graffiti_id uuid PRIMARY KEY REFERENCES public.toilet_graffiti(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX toilet_graffiti_owners_user_idx ON public.toilet_graffiti_owners(user_id, created_at);
ALTER TABLE public.toilet_graffiti_owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can read their own graffiti ownership"
  ON public.toilet_graffiti_owners FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role full access graffiti owners"
  ON public.toilet_graffiti_owners FOR ALL TO public
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 2) Migrate vorhandene Daten in die Besitzer-Tabellen
INSERT INTO public.pub_chat_message_owners (message_id, user_id, created_at)
  SELECT id, user_id, created_at FROM public.pub_chat_messages
  ON CONFLICT (message_id) DO NOTHING;

INSERT INTO public.toilet_graffiti_owners (graffiti_id, user_id, created_at)
  SELECT id, user_id, created_at FROM public.toilet_graffiti
  ON CONFLICT (graffiti_id) DO NOTHING;

-- 3) Insert-Policies anpassen, dann user_id aus den öffentlichen Tabellen entfernen
DROP POLICY IF EXISTS "Authenticated users can post pub chat as themselves" ON public.pub_chat_messages;
CREATE POLICY "Authenticated users can post pub chat"
  ON public.pub_chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can write graffiti as themselves" ON public.toilet_graffiti;
CREATE POLICY "Authenticated users can write graffiti"
  ON public.toilet_graffiti FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE public.pub_chat_messages DROP COLUMN user_id;
ALTER TABLE public.toilet_graffiti DROP COLUMN user_id;

-- 4) Trigger: beim Insert automatisch Besitzer eintragen
CREATE OR REPLACE FUNCTION public.record_pub_chat_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.pub_chat_message_owners (message_id, user_id, created_at)
    VALUES (NEW.id, auth.uid(), NEW.created_at)
    ON CONFLICT (message_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_record_pub_chat_owner
  AFTER INSERT ON public.pub_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.record_pub_chat_owner();

CREATE OR REPLACE FUNCTION public.record_toilet_graffiti_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.toilet_graffiti_owners (graffiti_id, user_id, created_at)
    VALUES (NEW.id, auth.uid(), NEW.created_at)
    ON CONFLICT (graffiti_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_record_toilet_graffiti_owner
  AFTER INSERT ON public.toilet_graffiti
  FOR EACH ROW EXECUTE FUNCTION public.record_toilet_graffiti_owner();

-- 5) Realtime-Authorisierung: Subscribe auf bekannte Topics nur für Authenticated
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated may subscribe to pub & toilet streams"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    realtime.topic() IN (
      'pub-chat-stream',
      'toilet-wall-stream',
      'realtime:public:pub_chat_messages',
      'realtime:public:toilet_graffiti'
    )
  );
