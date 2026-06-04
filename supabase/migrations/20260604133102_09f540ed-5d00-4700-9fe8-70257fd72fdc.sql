GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_group_rooms TO authenticated;
GRANT ALL ON public.dsa_group_rooms TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_group_members TO authenticated;
GRANT ALL ON public.dsa_group_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_group_messages TO authenticated;
GRANT ALL ON public.dsa_group_messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_group_pending_actions TO authenticated;
GRANT ALL ON public.dsa_group_pending_actions TO service_role;