ALTER TABLE public.pub_chat_messages
  ADD CONSTRAINT pub_chat_messages_text_len CHECK (char_length(text) <= 2000);

ALTER TABLE public.toilet_graffiti
  ADD CONSTRAINT toilet_graffiti_text_len CHECK (char_length(text) <= 500);