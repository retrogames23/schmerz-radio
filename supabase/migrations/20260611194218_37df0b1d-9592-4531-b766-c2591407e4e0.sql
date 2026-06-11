-- Hide password_hash from clients; server (service_role) keeps full access.
REVOKE SELECT (password_hash) ON public.dsa_group_rooms FROM authenticated;
REVOKE SELECT (password_hash) ON public.dsa_group_rooms FROM anon;

-- Document the intentional server-only access model for telemetry.
-- (RLS is on; no policies for anon/authenticated means they cannot read or write.
--  service_role bypasses RLS via its GRANT.)
COMMENT ON TABLE public.dsa_model_telemetry IS
  'Server-only telemetry. RLS enabled with no anon/authenticated policies by design; only service_role (edge/server functions) may read or write.';

-- Document the intentional server-only join model for group members.
-- (Joins happen via the /api/public/dsa-group server route using service_role,
--  which enforces password checks and capacity limits before inserting.)
COMMENT ON TABLE public.dsa_group_members IS
  'Inserts are server-only via the dsa-group route (service_role) so password and capacity checks run first. Authenticated users may read their rooms'' members and remove their own membership via existing policies.';
