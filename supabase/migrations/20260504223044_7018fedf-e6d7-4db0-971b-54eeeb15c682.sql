-- =========================================================
-- Pub chat messages (live chat between players in the pub)
-- =========================================================
CREATE TABLE public.pub_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  seat_index SMALLINT,
  shift_number INTEGER,
  text TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT pub_chat_text_len CHECK (char_length(text) BETWEEN 1 AND 240),
  CONSTRAINT pub_chat_name_len CHECK (char_length(display_name) BETWEEN 1 AND 60)
);

CREATE INDEX idx_pub_chat_messages_created_at ON public.pub_chat_messages (created_at DESC);

ALTER TABLE public.pub_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pub chat"
  ON public.pub_chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post pub chat as themselves"
  ON public.pub_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- Toilet graffiti (persistent text on the toilet wall)
-- =========================================================
CREATE TABLE public.toilet_graffiti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  text TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  rotation REAL NOT NULL DEFAULT 0,
  color_index SMALLINT NOT NULL DEFAULT 0,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT graffiti_text_len CHECK (char_length(text) BETWEEN 1 AND 140),
  CONSTRAINT graffiti_name_len CHECK (char_length(display_name) BETWEEN 1 AND 60),
  CONSTRAINT graffiti_x_range CHECK (x >= 0 AND x <= 100),
  CONSTRAINT graffiti_y_range CHECK (y >= 0 AND y <= 100)
);

CREATE INDEX idx_toilet_graffiti_created_at ON public.toilet_graffiti (created_at DESC);
CREATE INDEX idx_toilet_graffiti_expires_at ON public.toilet_graffiti (expires_at);

ALTER TABLE public.toilet_graffiti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-expired graffiti"
  ON public.toilet_graffiti
  FOR SELECT
  USING (expires_at IS NULL OR expires_at > now());

CREATE POLICY "Authenticated users can write graffiti as themselves"
  ON public.toilet_graffiti
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Auto-set expires_at = now() + 24h for anonymous graffiti
CREATE OR REPLACE FUNCTION public.set_graffiti_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_anonymous AND NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_graffiti_expiry_trigger
  BEFORE INSERT ON public.toilet_graffiti
  FOR EACH ROW
  EXECUTE FUNCTION public.set_graffiti_expiry();

-- =========================================================
-- Realtime publication
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.pub_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.toilet_graffiti;