
CREATE POLICY "Owners can delete their own pub chat messages"
ON public.pub_chat_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pub_chat_message_owners
    WHERE message_id = pub_chat_messages.id
      AND user_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete their own graffiti"
ON public.toilet_graffiti
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.toilet_graffiti_owners
    WHERE graffiti_id = toilet_graffiti.id
      AND user_id = auth.uid()
  )
);
