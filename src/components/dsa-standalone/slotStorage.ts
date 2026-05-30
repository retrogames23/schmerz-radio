import type { DsaCharacterSummary } from "@/game/types";

export type SlotIndex = 1 | 2 | 3;
export const SLOT_INDICES: SlotIndex[] = [1, 2, 3];

const KEY_PREFIX = "dsa.standalone.slot-";

function key(slot: SlotIndex): string {
  return `${KEY_PREFIX}${slot}`;
}

/** Stabile sessionId pro Slot — der Server skopiert intern nach user_id/anon_id. */
export function slotSessionId(slot: SlotIndex): string {
  return `dsa-slot-${slot}`;
}

export function loadSlotCharacter(slot: SlotIndex): DsaCharacterSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(slot));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DsaCharacterSummary;
    if (!parsed || typeof parsed !== "object" || typeof parsed.name !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSlotCharacter(
  slot: SlotIndex,
  character: DsaCharacterSummary | null,
): void {
  if (typeof window === "undefined") return;
  try {
    if (character) {
      window.localStorage.setItem(key(slot), JSON.stringify(character));
    } else {
      window.localStorage.removeItem(key(slot));
    }
  } catch {
    /* Quota / privater Modus — Slot bleibt nur in-Memory. */
  }
}

export function parseSlot(raw: unknown): SlotIndex | null {
  const n = typeof raw === "string" ? Number.parseInt(raw, 10) : Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}