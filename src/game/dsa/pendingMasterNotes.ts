import { TALENTS } from "./rules/talents";
import { rollThreeD20Probe } from "./rules/probe";
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

/**
 * Würfelt eine DSA3-Talentprobe (3W20, TaW als Puffer) und baut die
 * [PROBE]-Zeile, die an den Meister zurückgeht.
 */
export function rollTalentCheck(
  talentId: string,
  attrs: Record<string, number>,
  taw: number,
  modifier: number,
  rolls?: [number, number, number],
): { line: string; success: boolean; pointsLeft: number } {
  const def = TALENTS.find((t) => t.id === talentId);
  if (!def) throw new Error(`unknown talent ${talentId}`);
  const r = rollThreeD20Probe(
    def.probe.map((a) => attrs[a] ?? 10) as [number, number, number],
    taw,
    modifier,
    rolls,
  );
  const mod = modifier === 0 ? "±0" : modifier > 0 ? `+${modifier}` : `${modifier}`;
  const detail = r.rolls.map((v, i) => `${def.probe[i]} ${v}/${r.targets[i]}`).join(", ");
  const special = r.special === "double1" ? " · Doppel-1" : r.special === "double20" ? " · Doppel-20" : "";
  const result = r.success ? `gelungen (TaP* ${Math.max(0, r.pointsLeft)})` : "misslungen";
  return {
    line: `[PROBE] ${def.name} ${mod}: 3W20=${r.rolls.join("/")} (${detail}), TaW ${taw}${special} — ${result}`,
    success: r.success,
    pointsLeft: r.pointsLeft,
  };
}
