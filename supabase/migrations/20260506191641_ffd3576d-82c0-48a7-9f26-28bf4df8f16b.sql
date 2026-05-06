-- Drop existing realtime.messages policies for these channels and recreate aligned versions
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'realtime' AND tablename = 'messages'
      AND policyname IN (
        'Anon can subscribe to public live channels',
        'Authenticated can subscribe to public live channels',
        'Authenticated users can read realtime messages'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON realtime.messages', pol.policyname);
  END LOOP;
END$$;

CREATE POLICY "Anon can subscribe to public live channels"
ON realtime.messages
FOR SELECT
TO anon
USING (
  realtime.topic() IN ('pub-chat-stream', 'toilet-wall-stream')
);

CREATE POLICY "Authenticated can subscribe to public live channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() IN ('pub-chat-stream', 'toilet-wall-stream')
);