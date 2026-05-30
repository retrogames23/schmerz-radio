
-- Replace pub chat identity trigger: no more email local-part exposure
CREATE OR REPLACE FUNCTION public.enforce_pub_chat_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_claims jsonb;
  is_anon boolean;
  uid uuid;
  nick text;
BEGIN
  jwt_claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  is_anon := COALESCE((jwt_claims->>'is_anonymous')::boolean, true);
  uid := auth.uid();

  IF NOT is_anon AND uid IS NOT NULL THEN
    nick := 'Bewohner-' || upper(substr(md5(uid::text), 1, 4));
    NEW.display_name := nick;
    NEW.is_anonymous := false;
  ELSE
    NEW.is_anonymous := true;
    IF NEW.shift_number IS NULL OR NEW.shift_number < 1 THEN
      RAISE EXCEPTION 'shift_number required for anonymous pub chat';
    END IF;
    NEW.display_name := 'Layard · Schicht ' || NEW.shift_number::text;
  END IF;

  RETURN NEW;
END;
$function$;

-- Replace toilet graffiti identity trigger: no more email local-part exposure
CREATE OR REPLACE FUNCTION public.enforce_toilet_graffiti_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_claims jsonb;
  is_anon boolean;
  uid uuid;
  nick text;
BEGIN
  jwt_claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  is_anon := COALESCE((jwt_claims->>'is_anonymous')::boolean, true);
  uid := auth.uid();

  IF NOT is_anon AND uid IS NOT NULL THEN
    nick := 'Bewohner-' || upper(substr(md5(uid::text), 1, 4));
    NEW.display_name := nick;
    NEW.is_anonymous := false;
  ELSE
    NEW.is_anonymous := true;
    IF NEW.display_name !~ '^Layard · Schicht [0-9]{1,4}$' THEN
      NEW.display_name := 'Layard · Schicht ?';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Retroactively pseudonymise existing non-anonymous rows
UPDATE public.pub_chat_messages m
SET display_name = 'Bewohner-' || upper(substr(md5(o.user_id::text), 1, 4))
FROM public.pub_chat_message_owners o
WHERE o.message_id = m.id
  AND m.is_anonymous = false;

UPDATE public.toilet_graffiti g
SET display_name = 'Bewohner-' || upper(substr(md5(o.user_id::text), 1, 4))
FROM public.toilet_graffiti_owners o
WHERE o.graffiti_id = g.id
  AND g.is_anonymous = false;
