import { createClient } from "@supabase/supabase-js";

/** Verifies the bearer token of a request; returns the user id or null.
 *  Paid AI/voice endpoints (except the solo DSA adventure) require a signed-in user. */
export async function getRequestUserId(request: Request): Promise<string | null> {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const url = process.env.SUPABASE_URL;
  const pub = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !pub) return null;
  const client = createClient(url, pub, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  return error || !data?.user?.id ? null : data.user.id;
}

export function authRequiredResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Bitte melde dich an, um diese Funktion zu nutzen.", code: "auth_required" }),
    { status: 401, headers: { "Content-Type": "application/json" } },
  );
}
