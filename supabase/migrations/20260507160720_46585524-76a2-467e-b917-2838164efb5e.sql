UPDATE public.profiles SET donation_unlocked = true WHERE user_id = 'a0fe3fbf-5e39-47af-af0c-9b205e1bdccd';
INSERT INTO public.donations (user_id, email, amount_cents, currency, stripe_session_id, stripe_payment_intent)
VALUES ('a0fe3fbf-5e39-47af-af0c-9b205e1bdccd', 'stephan.doerner@posteo.de', 300, 'eur', 'manual-pi_3TUM6OLrpKo8PzRr08aPdLwH', 'pi_3TUM6OLrpKo8PzRr08aPdLwH')
ON CONFLICT DO NOTHING;