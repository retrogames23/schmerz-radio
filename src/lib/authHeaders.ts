import { supabase } from "@/integrations/supabase/client";

/** Bearer header for the signed-in player (empty for guests). */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
