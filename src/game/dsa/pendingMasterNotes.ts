/**
 * Sammelt Heldenbogen-Änderungen (Umrüsten, Wegwerfen, Porträt) lokal und
 * hängt sie der nächsten regulären Spielereingabe an. So kostet ein
 * Waffenwechsel keine eigene Meisterwende.
 */
const queue: string[] = [];

export function queueMasterNote(note: string): void {
  const n = note.trim();
  if (!n) return;
  queue.push(n.slice(0, 160));
  if (queue.length > 4) queue.shift();
}

/** Leert die Warteschlange und liefert die Notizen als Präfix-Zeile. */
export function drainMasterNotes(): string {
  if (queue.length === 0) return "";
  const s = `[INVENTAR] ${queue.join(" ")}`;
  queue.length = 0;
  return s;
}

/** Würfelt eine DSA3-Eigenschaftsprobe: 1W20 ≤ Wert − Erschwernis. 1 gelingt immer, 20 misslingt immer. */
export function rollAttributeCheck(
  value: number,
  modifier: number,
  roll: number = 1 + Math.floor(Math.random() * 20),
): { roll: number; target: number; success: boolean } {
  const target = value - modifier;
  const success = roll === 1 ? true : roll === 20 ? false : roll <= target;
  return { roll, target, success };
}
