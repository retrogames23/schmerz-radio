/**
 * DSA3-3W20-Probe für Talente und Zauber.
 *
 * - Jeder der drei W20 wird gegen eine Eigenschaft gewürfelt.
 * - Der Talent-/Zauberwert (TaW/ZfW) minus Erschwernis bildet den Puffer,
 *   aus dem Überwürfe ausgeglichen werden.
 * - Ist der Puffer schon vor dem Wurf negativ (Erschwernis > Wert), wird
 *   jede der drei Eigenschaften um diesen Betrag gesenkt; der Puffer ist 0.
 * - Doppel-1 gelingt immer, Doppel-20 misslingt immer.
 * - pointsLeft = übrige Punkte (TaP* / ZfP*), bei Misserfolg negativ.
 */
export interface ThreeD20Result {
  rolls: [number, number, number];
  targets: [number, number, number];
  success: boolean;
  pointsLeft: number;
  /** Doppel-1 bzw. Doppel-20. */
  special: "double1" | "double20" | null;
}

export function rollThreeD20Probe(
  attrValues: [number, number, number],
  value: number,
  difficulty: number,
  rolls: [number, number, number] = [d20(), d20(), d20()],
): ThreeD20Result {
  const eff = value - difficulty;
  const penalty = eff < 0 ? -eff : 0;
  let buffer = eff < 0 ? 0 : eff;
  const targets = attrValues.map((a) => a - penalty) as [number, number, number];
  rolls.forEach((r, i) => {
    if (r > targets[i]) buffer -= r - targets[i];
  });
  const ones = rolls.filter((r) => r === 1).length;
  const twenties = rolls.filter((r) => r === 20).length;
  const special = twenties >= 2 ? "double20" : ones >= 2 ? "double1" : null;
  const success = special === "double20" ? false : special === "double1" ? true : buffer >= 0;
  return { rolls, targets, success, pointsLeft: buffer, special };
}

function d20(): number {
  return 1 + Math.floor(Math.random() * 20);
}
