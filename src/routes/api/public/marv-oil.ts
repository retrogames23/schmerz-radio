import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Markiert MARV-9 als „geölt" für den eingeloggten Spieler. Verändert
 * NICHT den Empathie-Score — nur den `oiled`-Flag im `marv_state`.
 */
function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/marv-oil")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabasePub = process.env.SUPABASE_PUBLISHABLE_KEY;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabasePub || !serviceKey) {
          return json(500, { error: "Auth nicht konfiguriert." });
        }
        const authHeader = request.headers.get("authorization") ?? "";
        const userToken = authHeader.replace(/^Bearer\s+/i, "");
        if (!userToken) return json(401, { error: "Anmeldung erforderlich." });

        const userClient = createClient(supabaseUrl, supabasePub, {
          global: { headers: { Authorization: `Bearer ${userToken}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: u, error: authErr } =
          await userClient.auth.getUser(userToken);
        const uid = u?.user?.id;
        if (authErr || !uid) return json(401, { error: "Ungültiges Token." });

        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: existing } = await admin
          .from("marv_state")
          .select("empathy_score, unlocked, message_count")
          .eq("user_id", uid)
          .maybeSingle();
        await admin.from("marv_state").upsert(
          {
            user_id: uid,
            empathy_score: existing?.empathy_score ?? 0,
            unlocked: existing?.unlocked ?? false,
            message_count: existing?.message_count ?? 0,
            oiled: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        return json(200, { ok: true });
      },
    },
  },
});