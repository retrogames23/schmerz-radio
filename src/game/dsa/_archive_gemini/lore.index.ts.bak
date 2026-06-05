import { DSA_CURRENT_AFFAIRS_20HAL } from "./currentAffairs";
import { buildGodsBlockShort } from "./gods";
import { buildRegionsBlockShortForSetting } from "./regions";
import { buildBestiaryBlock, DSA_BESTIARY } from "./bestiary";
import { DSA_BREM_SHORT, DSA_YELVA_SHORT } from "./companions";
import type { DsaSettingId } from "../llmAdventure";

export * from "./gods";
export * from "./regions";
export { DSA_BESTIARY };
export { DSA_AUELFEN_BRIEF } from "./auelfen";
export { DSA_BREM_BACKSTORY, DSA_YELVA_BACKSTORY, DSA_BREM_SHORT, DSA_YELVA_SHORT } from "./companions";
export { resolveLoreTopic, LORE_TOPICS, LORE_TOPIC_HINT } from "./lookup";

/** Brem + Yelva Kurzprofile als ein Block — für Solo und Gruppe (mit Begleitern).
 *  Detailbiografien holt sich der Meister via dsaLore({topic:'companions.brem'|'companions.yelva'}). */
export function buildCompanionBackstoriesBlock(): string {
  return [DSA_BREM_SHORT, "", DSA_YELVA_SHORT].join("\n");
}

/**
 * Immer mitgesendeter Lore-Kern — bewusst schlank gehalten:
 * Tagesgeschehen + knappe Götter-Liste. Wirtschaft, Kalender,
 * Sprache, Auelfen-Detail und Götter-Tabus/Schwüre wandern in
 * dsaLore({topic}). So bleibt der Pflicht-Prompt klein und der
 * Meister wird nicht von Detail-Wissen überrollt.
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
GRUNDSTIMMUNG (WICHTIG):
  DSA3 / Aventurien im Jahr 20 Hal ist eine bunte, heldenmythische Welt:
  Tavernenromantik, Wunder der Zwölfgötter, schillernde Magie, Reisen,
  Freundschaft, Heldentum. Die Grundstimmung ist NICHT düster.
  Schattenseiten (Orkkrieg, Inquisition, Sklavenhandel in Al'Anfa,
  Maraskan-Aufstand) sind LORE-WAHR und dürfen genannt werden, wenn sie
  zur Szene passen — aber sie sind Kulisse, kein Dauerton. Standardstimmung
  ist abenteuerlich, hoffnungsvoll, gelegentlich gefährlich. Edgy/grimdark
  nur, wenn das Abenteuer es ausdrücklich verlangt.
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