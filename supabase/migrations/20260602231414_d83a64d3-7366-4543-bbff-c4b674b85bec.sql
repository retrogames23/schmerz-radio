
-- Revoke public EXECUTE on SECURITY DEFINER functions; keep only what's needed.

-- Trigger functions: invoked by trigger system, no caller EXECUTE needed.
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_graffiti_expiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_graffiti_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_toilet_graffiti_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_toilet_graffiti_identity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_pub_chat_identity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_pub_chat_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_pub_chat_owner() FROM PUBLIC, anon, authenticated;

-- Server-only RPC functions (called via service_role from server functions).
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.try_increment_cloud_request_count(uuid, integer) FROM PUBLIC, anon, authenticated;

-- is_dsa_room_member is used inside RLS policies; keep EXECUTE for authenticated, revoke from anon/public.
REVOKE EXECUTE ON FUNCTION public.is_dsa_room_member(uuid, uuid) FROM PUBLIC, anon;
