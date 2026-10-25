/**
 * DSA nutzt für alle Spieler*innen dasselbe Meister-Modell.
 */
import { AI_MODEL_DSA_MASTER } from "@/lib/aiModel";

export function getDsaModel(): string {
  return AI_MODEL_DSA_MASTER;
}
