DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pub_chat_text_length') THEN
    ALTER TABLE public.pub_chat_messages ADD CONSTRAINT pub_chat_text_length CHECK (char_length(text) <= 500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'graffiti_text_length') THEN
    ALTER TABLE public.toilet_graffiti ADD CONSTRAINT graffiti_text_length CHECK (char_length(text) <= 300);
  END IF;
END $$;