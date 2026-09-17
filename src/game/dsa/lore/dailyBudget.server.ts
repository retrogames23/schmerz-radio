/**
 * Tages-Notbremse für die KI-Kosten des DSA-Meisters.
 *
 * Zählt die heute protokollierten Meister-Roundtrips (siehe
 * `dsa_model_telemetry`) und meldet, ob das Tagesbudget erschöpft ist.
 * Unterstützer*innen sind davon ausgenommen; alle anderen bekommen eine
 * freundliche Meldung statt eines technischen Fehlers, wenn der
 * OpenRouter-Schlüssel sonst leerlaufen würde.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Maximal protokollierte Meister-Roundtrips pro UTC-Tag für Gratis-Runden. */
export const DAILY_TURN_BUDGET = 400;

/** Cache, damit nicht jede Wende eine Zählabfrage auslöst. */
let cached: { day: string; count: number; at: number } | null = null;
const CACHE_MS = 60_000;

export async function isDailyBudgetReached(): Promise<boolean> {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  if (cached && cached.day === day && Date.now() - cached.at < CACHE_MS) {
    return cached.count >= DAILY_TURN_BUDGET;
  }
  try {
    const { count, error } = await supabaseAdmin
      .from("dsa_model_telemetry")
      .select("id", { count: "exact", head: true })
      .gte("created_at", `${day}T00:00:00Z`);
    if (error) return false; // Telemetrie darf nie das Spiel blockieren
    const n = count ?? 0;
    cached = { day, count: n, at: Date.now() };
    return n >= DAILY_TURN_BUDGET;
  } catch {
    return false;
  }
}
