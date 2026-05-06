-- Make the intentional anon Realtime subscription explicit for the two
-- public live channels (pub chat + toilet graffiti). The underlying tables
-- already have public SELECT policies; this mirrors that intent at the
-- realtime.messages layer so future scanners and reviewers see it clearly.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime'
      AND tablename = 'messages'
      AND policyname = 'Anon can subscribe to public live channels'
  ) THEN
    DROP POLICY "Anon can subscribe to public live channels" ON realtime.messages;
  END IF;
END$$;

CREATE POLICY "Anon can subscribe to public live channels"
ON realtime.messages
FOR SELECT
TO anon
USING (
  realtime.topic() IN (
    'pub_chat_messages',
    'toilet_graffiti',
    'public:pub_chat_messages',
    'public:toilet_graffiti'
  )
);
