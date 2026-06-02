-- Revoke EXECUTE on internal SECURITY DEFINER & trigger functions from anon/authenticated/PUBLIC.
-- These functions are only invoked server-side (service role) or as triggers; nothing in the
-- app calls them via PostgREST as anon or authenticated users.

DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.set_updated_at()',
    'public.try_increment_cloud_request_count(uuid, integer)',
    'public.move_to_dlq(text, text, bigint, jsonb)',
    'public.enqueue_email(text, jsonb)',
    'public.read_email_batch(text, integer, integer)',
    'public.delete_email(text, bigint)',
    'public.is_dsa_room_member(uuid, uuid)',
    'public.handle_new_user()',
    'public.set_graffiti_expiry()',
    'public.record_pub_chat_owner()',
    'public.record_toilet_graffiti_owner()',
    'public.enforce_toilet_graffiti_identity()',
    'public.enforce_pub_chat_rate_limit()',
    'public.enforce_graffiti_rate_limit()',
    'public.enforce_pub_chat_identity()'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
  END LOOP;
END $$;