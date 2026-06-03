-- Defense-in-depth: widerrufe SELECT auf password_hash für Client-Rollen.
-- Der Server (service_role) behält vollen Zugriff über GRANT ALL und kann
-- damit weiterhin Passwörter beim Beitritt vergleichen.
REVOKE SELECT (password_hash) ON public.dsa_group_rooms FROM authenticated;
REVOKE SELECT (password_hash) ON public.dsa_group_rooms FROM anon;