-- Donation codes table for Stripe-based Cloud unlock
CREATE TABLE public.donation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  email TEXT NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_donation_codes_code ON public.donation_codes(code);
CREATE INDEX idx_donation_codes_session ON public.donation_codes(stripe_session_id);

-- Enable RLS but grant NO policies to authenticated/anon — only service role can access
ALTER TABLE public.donation_codes ENABLE ROW LEVEL SECURITY;

-- Updated-at trigger
CREATE TRIGGER trg_donation_codes_updated_at
BEFORE UPDATE ON public.donation_codes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();