import { DSA_CURRENT_AFFAIRS_20HAL } from "./currentAffairs";
import { DSA_ECONOMY_BRIEF } from "./economy";
import { DSA_CALENDAR_BRIEF } from "./calendar";
import { DSA_LANGUAGE_BRIEF } from "./language";
import { buildGodsBlock } from "./gods";
import { buildRegionsBlockForSetting } from "./regions";
import { buildBestiaryBlock, DSA_BESTIARY } from "./bestiary";
import type { DsaSettingId } from "../llmAdventure";

export * from "./gods";
export * from "./regions";
export { DSA_BESTIARY };

/** Immer mitgesendeter Lore-Kern (Tagesgeschehen, Wirtschaft, Kalender, Sprache, Götter). */
export function buildCoreLoreAppend(): string {
  return [
    DSA_CURRENT_AFFAIRS_20HAL,
    "",
    DSA_ECONOMY_BRIEF,
    "",
    DSA_CALENDAR_BRIEF,
    "",
    DSA_LANGUAGE_BRIEF,
    "",
    buildGodsBlock(),
  ].join("\n");
}

/** Kontext-Lore, abhängig vom Setting und den verfügbaren Gegnern. */
export function buildContextualLoreBlock(args: {
  setting: DsaSettingId;
  enemyIds?: string[];
}): string {
  const parts = [buildRegionsBlockForSetting(args.setting)];
  const bestiary = buildBestiaryBlock(args.enemyIds ?? Object.keys(DSA_BESTIARY));
  if (bestiary) parts.push(bestiary);
  return parts.join("\n\n");
}