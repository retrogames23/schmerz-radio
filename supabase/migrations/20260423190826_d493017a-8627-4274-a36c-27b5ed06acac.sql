-- Replace the broad SELECT policy with one that requires a specific object name
DROP POLICY IF EXISTS "TTS cache is publicly readable" ON storage.objects;

CREATE POLICY "TTS cache files are publicly readable by name"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'tts-cache'
  AND name IS NOT NULL
  AND name <> ''
);
