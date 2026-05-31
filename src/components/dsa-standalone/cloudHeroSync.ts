import { supabase } from "@/integrations/supabase/client";
import type { DsaHero } from "@/game/types";
import { upgradeToHero } from "@/game/dsa/advancement";
import type { SlotIndex } from "./slotStorage";

/**
 * Cloud-Sync der Standalone-Slots für eingeloggte Spielende. Hero-Daten
 * liegen serverseitig in `dsa_heroes` (per RLS auf user_id beschränkt).
 * LocalStorage bleibt als Offline-Cache und für anonyme Spielende
 * erhalten — die Cloud ist die Wahrheit, sobald jemand eingeloggt ist.
 */

interface DsaHeroRow {
  slot: number;
  hero: unknown;
  ap_total: number | null;
  ap_spent: number | null;
  adventures_played: number | null;
  adventures_won: number | null;
}

function rowToHero(row: DsaHeroRow): DsaHero | null {
  const raw = row.hero;
  if (!raw || typeof raw !== "object") return null;
  const upgraded = upgradeToHero(raw as DsaHero);
  if (!upgraded) return null;
  // Server-Mirror der Zähler gewinnt — falls die JSON aus einer alten
  // Speicherung kommt.
  return {
    ...upgraded,
    apTotal: row.ap_total ?? upgraded.apTotal ?? 0,
    apSpent: row.ap_spent ?? upgraded.apSpent ?? 0,
    adventuresPlayed: row.adventures_played ?? upgraded.adventuresPlayed ?? 0,
    adventuresWon: row.adventures_won ?? upgraded.adventuresWon ?? 0,
  };
}

export async function cloudFetchAllHeroes(): Promise<
  Record<SlotIndex, DsaHero | null>
> {
  const out: Record<SlotIndex, DsaHero | null> = { 1: null, 2: null, 3: null };
  const { data, error } = await supabase
    .from("dsa_heroes")
    .select("slot, hero, ap_total, ap_spent, adventures_played, adventures_won");
  if (error || !data) return out;
  for (const row of data as DsaHeroRow[]) {
    if (row.slot === 1 || row.slot === 2 || row.slot === 3) {
      out[row.slot as SlotIndex] = rowToHero(row);
    }
  }
  return out;
}

export async function cloudFetchHero(slot: SlotIndex): Promise<DsaHero | null> {
  const { data, error } = await supabase
    .from("dsa_heroes")
    .select("slot, hero, ap_total, ap_spent, adventures_played, adventures_won")
    .eq("slot", slot)
    .maybeSingle();
  if (error || !data) return null;
  return rowToHero(data as DsaHeroRow);
}

export async function cloudUpsertHero(
  userId: string,
  slot: SlotIndex,
  hero: DsaHero,
): Promise<void> {
  const { error } = await supabase
    .from("dsa_heroes")
    .upsert(
      {
        user_id: userId,
        slot,
        hero: hero as unknown as Record<string, unknown>,
        ap_total: hero.apTotal ?? 0,
        ap_spent: hero.apSpent ?? 0,
        adventures_played: hero.adventuresPlayed ?? 0,
        adventures_won: hero.adventuresWon ?? 0,
      },
      { onConflict: "user_id,slot" },
    );
  if (error) console.warn("cloudUpsertHero failed", error);
}

export async function cloudDeleteHero(slot: SlotIndex): Promise<void> {
  const { error } = await supabase
    .from("dsa_heroes")
    .delete()
    .eq("slot", slot);
  if (error) console.warn("cloudDeleteHero failed", error);
}

/**
 * Liefert die SessionId des derzeit aktiven Abenteuers für (user, slot),
 * damit alle Geräte denselben Spielstand fortsetzen statt jeweils ein
 * neues Abenteuer zu starten. `null` heißt: kein aktives Abenteuer in
 * der Cloud — lokale SessionId bleibt gültig.
 */
export async function cloudFetchActiveSessionId(
  slot: SlotIndex,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("dsa_llm_adventures")
    .select("session_id, updated_at")
    .eq("hero_slot", slot)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const sid = (data as { session_id?: string }).session_id;
  return typeof sid === "string" ? sid : null;
}

export async function cloudDeleteSlotAdventures(slot: SlotIndex): Promise<void> {
  const { error } = await supabase
    .from("dsa_llm_adventures")
    .delete()
    .eq("hero_slot", slot);
  if (error) console.warn("cloudDeleteSlotAdventures failed", error);
}