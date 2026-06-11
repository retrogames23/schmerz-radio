/**
 * Persistente Kosten-Telemetrie für DSA-Meister-Calls. Schreibt pro
 * Roundtrip in `public.dsa_model_telemetry` (service-role-only). Fehler
 * werden geschluckt — Telemetrie darf niemals einen Spielcall killen.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface ModelTelemetryRow {
  model: string;
  label?: string | null;
  round: number | null;
  maxRounds: number;
  useTools: boolean;
  promptTokens: number | null;
  completionTokens: number | null;
  cachedTokens: number | null;
  cacheCreateTokens: number | null;
  toolCalls: number;
  fallback: boolean;
}

export async function recordModelTelemetry(row: ModelTelemetryRow): Promise<void> {
  try {
    await supabaseAdmin.from("dsa_model_telemetry").insert({
      model: row.model,
      label: row.label ?? null,
      round: row.round,
      max_rounds: row.maxRounds,
      use_tools: row.useTools,
      prompt_tokens: row.promptTokens,
      completion_tokens: row.completionTokens,
      cached_tokens: row.cachedTokens,
      cache_create_tokens: row.cacheCreateTokens,
      tool_calls: row.toolCalls,
      fallback: row.fallback,
    });
  } catch (e) {
    console.warn("[dsa-telemetry] insert failed", e);
  }
}