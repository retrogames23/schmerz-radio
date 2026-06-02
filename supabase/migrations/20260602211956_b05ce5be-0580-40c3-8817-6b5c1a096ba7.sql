-- is_dsa_room_member is referenced by RLS policies on dsa_group_* tables.
-- It must be executable by authenticated (and anon, since RLS evaluates as the request role).
GRANT EXECUTE ON FUNCTION public.is_dsa_room_member(uuid, uuid) TO authenticated, anon;

-- try_increment_cloud_request_count is callable from client via supabase.rpc in some flows;
-- safer to allow authenticated to execute it (it's SECURITY DEFINER and scoped by _user_id).
GRANT EXECUTE ON FUNCTION public.try_increment_cloud_request_count(uuid, integer) TO authenticated;