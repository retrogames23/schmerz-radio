REVOKE EXECUTE ON FUNCTION public.record_pub_chat_owner() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_toilet_graffiti_owner() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_pub_chat_identity() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_toilet_graffiti_identity() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_pub_chat_rate_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_graffiti_rate_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;