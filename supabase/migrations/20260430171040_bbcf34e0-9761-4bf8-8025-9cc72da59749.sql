
-- 1. Remove user-facing UPDATE on profiles (privilege escalation fix)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Add explicit service-role-only write policies for tts-cache bucket
DROP POLICY IF EXISTS "Service role can write tts-cache" ON storage.objects;
CREATE POLICY "Service role can write tts-cache"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'tts-cache' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can update tts-cache" ON storage.objects;
CREATE POLICY "Service role can update tts-cache"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'tts-cache' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'tts-cache' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can delete tts-cache" ON storage.objects;
CREATE POLICY "Service role can delete tts-cache"
ON storage.objects
FOR DELETE
USING (bucket_id = 'tts-cache' AND auth.role() = 'service_role');

-- 3. Fix mutable search_path on email-queue helper functions
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
