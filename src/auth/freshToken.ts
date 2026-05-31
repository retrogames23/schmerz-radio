import { supabase } from "@/integrations/supabase/client";

/**
 * Liefert einen garantiert frischen Access-Token. Wenn der gespeicherte
 * Token weniger als 60 Sekunden Restlaufzeit hat (oder bereits abgelaufen
 * ist), wird die Session vorher refreshed. Verhindert „Ungültige Sitzung"-
 * 401er an unseren API-Routen, wenn das Auto-Refresh des Browser-Clients
 * (z. B. wegen Hintergrund-Tab) nicht rechtzeitig gefeuert hat.
 */
export async function getFreshAccessToken(forceRefresh = false): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session?.access_token) return null;

  const expiresAt = session.expires_at ?? 0; // unix seconds
  const nowSec = Math.floor(Date.now() / 1000);
  if (!forceRefresh && expiresAt - nowSec > 60) {
    return session.access_token;
  }

  const { data: refreshed, error } = await supabase.auth.refreshSession();
  if (error || !refreshed.session?.access_token) return null;
  return refreshed.session.access_token;
}