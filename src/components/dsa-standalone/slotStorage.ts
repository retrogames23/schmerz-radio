import type { DsaCharacterSummary } from "@/game/types";

export type SlotIndex = 1 | 2 | 3;
export const SLOT_INDICES: SlotIndex[] = [1, 2, 3];

const KEY_PREFIX = "dsa.standalone.slot-";
const SESSION_KEY_PREFIX = "dsa.standalone.session-";

function key(slot: SlotIndex): string {
  return `${KEY_PREFIX}${slot}`;
}

function sessionKey(slot: SlotIndex): string {
  return `${SESSION_KEY_PREFIX}${slot}`;
}

function isValidSessionId(value: string | null): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Stabile sessionId pro Slot — der Server skopiert intern nach user_id/anon_id.
 * Muss ein UUID sein (DB-Spalte `session_id uuid`). Wir verwenden feste,
 * deterministische UUIDs pro Slot, damit jeder Slot serverseitig sein
 * eigenes Abenteuer führt.
 */
const SLOT_UUIDS: Record<SlotIndex, string> = {
  1: "d5a51071-0000-4000-8000-000000000001",
  2: "d5a51072-0000-4000-8000-000000000002",
  3: "d5a51073-0000-4000-8000-000000000003",
};
export function slotSessionId(slot: SlotIndex): string {
  if (typeof window === "undefined") return SLOT_UUIDS[slot];
  try {
    const stored = window.localStorage.getItem(sessionKey(slot));
    if (isValidSessionId(stored)) return stored;
    const hasLegacyCharacter = !!window.localStorage.getItem(key(slot));
    if (hasLegacyCharacter) return SLOT_UUIDS[slot];
    const fresh = createSessionId();
    window.localStorage.setItem(sessionKey(slot), fresh);
    return fresh;
  } catch {
    return SLOT_UUIDS[slot];
  }
}

export function rotateSlotSessionId(slot: SlotIndex): string {
  const fresh = createSessionId();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(sessionKey(slot), fresh);
    } catch {
      /* Storage gesperrt — die alte Fallback-ID bleibt aktiv. */
    }
  }
  return fresh;
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
      const previous = window.localStorage.getItem(key(slot));
      const storedSession = window.localStorage.getItem(sessionKey(slot));
      if (!previous && !isValidSessionId(storedSession)) {
        window.localStorage.setItem(sessionKey(slot), createSessionId());
      }
      window.localStorage.setItem(key(slot), JSON.stringify(character));
    } else {
      window.localStorage.removeItem(key(slot));
      rotateSlotSessionId(slot);
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