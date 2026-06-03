-- Sicherheitspatch: Heldennamen-Injection und Passwort-Bypass in Gruppenräumen verhindern
-- 1) Direkte INSERT/UPDATE auf dsa_group_members durch authentifizierte Nutzer entfernen.
--    Alle Schreibzugriffe gehen ausschließlich über die Server-Route /api/public/dsa-group
--    (Service-Role), die Passwort prüft und Heldennamen sanitisiert.
DROP POLICY IF EXISTS "Authenticated can join" ON public.dsa_group_members;
DROP POLICY IF EXISTS "Members update own row" ON public.dsa_group_members;

-- 2) Realtime: explizit Mitgliedern erlauben, ihre Raum-Topics zu abonnieren.
--    Wir nutzen zwar nur postgres_changes (durch Tabellen-RLS abgedeckt), aber
--    eine ausdrückliche Allowlist für Broadcast/Presence-Topics verhindert
--    künftige Drift, falls jemand auf broadcast umstellt.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'realtime' AND c.relname = 'messages') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Members can subscribe to their dsa group room" ON realtime.messages';
    EXECUTE $POL$
      CREATE POLICY "Members can subscribe to their dsa group room"
      ON realtime.messages
      FOR SELECT
      TO authenticated
      USING (
        realtime.topic() LIKE 'dsa_group_%'
        AND public.is_dsa_room_member(
          NULLIF(regexp_replace(realtime.topic(), '^dsa_group_(room|spiel)_', ''), '')::uuid,
          auth.uid()
        )
      )
    $POL$;
  END IF;
EXCEPTION WHEN undefined_function OR undefined_table OR insufficient_privilege THEN
  -- Falls die realtime.topic() Helper-Funktion noch nicht existiert oder
  -- wir keine Rechte haben, ignorieren — Tabellen-RLS schützt weiterhin.
  NULL;
END $$;