import { DSA_CURRENT_AFFAIRS_20HAL } from "./currentAffairs";
import { buildGodsBlockShort } from "./gods";
import { buildRegionsBlockShortForSetting } from "./regions";
import { buildBestiaryBlock, DSA_BESTIARY } from "./bestiary";
import { getBremShort, getYelvaShort, type DsaRuntimeMode } from "./companions";
import type { DsaSettingId } from "../llmAdventure";

export * from "./gods";
export * from "./regions";
export { DSA_BESTIARY };
export { DSA_AUELFEN_BRIEF } from "./auelfen";
export {
  DSA_BREM_BACKSTORY,
  DSA_YELVA_BACKSTORY,
  DSA_BREM_SHORT,
  DSA_YELVA_SHORT,
  getBremBackstory,
  getYelvaBackstory,
  getBremShort,
  getYelvaShort,
} from "./companions";
export type { DsaRuntimeMode } from "./companions";
export { resolveLoreTopic, LORE_TOPICS, LORE_TOPIC_HINT } from "./lookup";

/** Brem + Yelva Kurzprofile als ein Block — für Solo und Gruppe (mit Begleitern).
 *  Detailbiografien holt sich der Meister via dsaLore({topic:'companions.brem'|'companions.yelva'}). */
export function buildCompanionBackstoriesBlock(mode: DsaRuntimeMode = "e67"): string {
  return [getBremShort(mode), "", getYelvaShort(mode)].join("\n");
}

/**
 * Immer mitgesendeter Lore-Kern — GPT-optimiert.
 */
export function buildCoreLoreAppend(): string {
  return [
    TONE_GUIDELINE,
    "",
    DSA_CURRENT_AFFAIRS_20HAL,
    "",
    buildGodsBlockShort(),
  ].join("\n");
}

const TONE_GUIDELINE = `
### GRUNDSTIMMUNG (WICHTIG)
- **Genre:** Bunte, heldenmythische Low-Fantasy (Tavernenromantik, Wunder der Zwölfgötter, Reisen, Heldentum).
- **Tonalität:** Standardmäßig abenteuerlich, erdverbunden und hoffnungsvoll. NICHT düster, grimdark oder "edgy".
- **Schattenseiten:** Orkkrieg, Inquisition oder Sklavenhandel in Al'Anfa sind existent (Lore-wahr) und dienen als Kulisse, prägen aber nicht den Dauerton.
`.trim();

/** Kontext-Lore, abhängig vom Setting und den verfügbaren Gegnern. */
export function buildContextualLoreBlock(args: {
  setting: DsaSettingId;
  enemyIds?: string[];
}): string {
  const parts = [buildRegionsBlockShortForSetting(args.setting)];
  const bestiary = buildBestiaryBlock(args.enemyIds ?? Object.keys(DSA_BESTIARY));
  if (bestiary) parts.push(bestiary);
  return parts.join("\n\n");
}