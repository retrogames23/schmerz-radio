/**
 * Pro-NPC Geduld-Counter im Free-Mode. Persistiert in localStorage,
 * pro User (oder „anon"). Bei 0 wird das Eingabefeld für 1h gesperrt.
 */

const MAX_PATIENCE = 30;
const LOCK_MS = 60 * 60 * 1000;

export interface PatienceState {
  remaining: number;
  lockedUntil: number; // ms epoch, 0 = nicht gesperrt
}

function key(userId: string | null, npcId: string): string {
  return `npcPatience:${userId ?? "anon"}:${npcId}`;
}

function safeRead(k: string): PatienceState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return null;
    const obj = JSON.parse(raw) as PatienceState;
    if (
      typeof obj?.remaining === "number" &&
      typeof obj?.lockedUntil === "number"
    ) {
      return obj;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function safeWrite(k: string, v: PatienceState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore quota errors */
  }
}

export function getPatience(
  userId: string | null,
  npcId: string,
): PatienceState {
  const k = key(userId, npcId);
  const now = Date.now();
  const cur = safeRead(k);
  if (!cur) {
    return { remaining: MAX_PATIENCE, lockedUntil: 0 };
  }
  // Lock abgelaufen → reset
  if (cur.lockedUntil && cur.lockedUntil <= now) {
    const fresh: PatienceState = { remaining: MAX_PATIENCE, lockedUntil: 0 };
    safeWrite(k, fresh);
    return fresh;
  }
  return cur;
}

export function consumePatience(
  userId: string | null,
  npcId: string,
): PatienceState {
  const k = key(userId, npcId);
  const cur = getPatience(userId, npcId);
  if (cur.lockedUntil) return cur;
  const next: PatienceState =
    cur.remaining <= 1
      ? { remaining: 0, lockedUntil: Date.now() + LOCK_MS }
      : { remaining: cur.remaining - 1, lockedUntil: 0 };
  safeWrite(k, next);
  return next;
}

export const PATIENCE_MAX = MAX_PATIENCE;
export const PATIENCE_LOCK_MS = LOCK_MS;