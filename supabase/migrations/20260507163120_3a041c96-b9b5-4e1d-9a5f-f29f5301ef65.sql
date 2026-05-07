
-- Length constraints
ALTER TABLE public.pub_chat_messages
  ADD CONSTRAINT pub_chat_text_length CHECK (char_length(text) BETWEEN 1 AND 300);

ALTER TABLE public.toilet_graffiti
  ADD CONSTRAINT graffiti_text_length CHECK (char_length(text) BETWEEN 1 AND 200);

-- Server-side pub chat rate limit (1.5s per user)
CREATE OR REPLACE FUNCTION public.enforce_pub_chat_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  last_at timestamptz;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT MAX(o.created_at) INTO last_at
  FROM public.pub_chat_message_owners o
  WHERE o.user_id = uid
    AND o.created_at > now() - INTERVAL '2 seconds';
  IF last_at IS NOT NULL AND now() - last_at < INTERVAL '1500 milliseconds' THEN
    RAISE EXCEPTION 'pub_chat_rate_limit' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_pub_chat_rate_limit_trg ON public.pub_chat_messages;
CREATE TRIGGER enforce_pub_chat_rate_limit_trg
BEFORE INSERT ON public.pub_chat_messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_pub_chat_rate_limit();

-- Server-side graffiti 48h limit per user
CREATE OR REPLACE FUNCTION public.enforce_graffiti_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  recent_count integer;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT COUNT(*) INTO recent_count
  FROM public.toilet_graffiti_owners o
  WHERE o.user_id = uid
    AND o.created_at > now() - INTERVAL '48 hours';
  IF recent_count > 0 THEN
    RAISE EXCEPTION 'graffiti_rate_limit' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_graffiti_rate_limit_trg ON public.toilet_graffiti;
CREATE TRIGGER enforce_graffiti_rate_limit_trg
BEFORE INSERT ON public.toilet_graffiti
FOR EACH ROW EXECUTE FUNCTION public.enforce_graffiti_rate_limit();
