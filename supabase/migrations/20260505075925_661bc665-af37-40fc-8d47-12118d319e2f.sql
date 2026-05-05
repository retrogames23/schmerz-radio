CREATE OR REPLACE FUNCTION public.set_graffiti_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_anonymous AND NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + INTERVAL '48 hours';
  END IF;
  RETURN NEW;
END;
$function$;