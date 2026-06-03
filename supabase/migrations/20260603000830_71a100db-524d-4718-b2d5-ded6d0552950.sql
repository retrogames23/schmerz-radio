-- Hide password_hash from clients; expose only boolean
ALTER TABLE public.dsa_group_rooms
  ADD COLUMN IF NOT EXISTS has_password boolean
  GENERATED ALWAYS AS (password_hash IS NOT NULL) STORED;

REVOKE SELECT (password_hash) ON public.dsa_group_rooms FROM anon, authenticated;

-- Lock down SECURITY DEFINER helpers that should only run via service role / triggers
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.try_increment_cloud_request_count(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_graffiti_expiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_graffiti_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_pub_chat_identity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_pub_chat_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_toilet_graffiti_identity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_pub_chat_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_toilet_graffiti_owner() FROM PUBLIC, anon, authenticated;
