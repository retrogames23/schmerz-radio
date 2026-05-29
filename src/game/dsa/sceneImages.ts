import imgForest from "@/assets/dsa/dsa-anreise-forest.jpg";
import imgEncounter from "@/assets/dsa/dsa-anreise-encounter.jpg";
import imgTavernExt from "@/assets/dsa/dsa-tavern-exterior.jpg";
import imgTavernInt from "@/assets/dsa/dsa-tavern-interior.jpg";
import imgRuinEntrance from "@/assets/dsa/dsa-ruin-entrance.jpg";
import imgRuinChamber from "@/assets/dsa/dsa-ruin-chamber.jpg";

/**
 * Fester Pool generischer Aventurien-Bilder. Der LLM-Meister wählt
 * mit `[SCENE: <tag>]` eines aus; unbekannte Tags fallen auf das
 * Eröffnungsbild des Settings zurück (siehe DSA_SETTINGS).
 *
 * Mehrere Tags zeigen aktuell dasselbe Bild — der Pool wird später
 * mit eigens generierten Illustrationen erweitert, das LLM darf aber
 * schon das ganze Vokabular benutzen.
 */
export const DSA_SCENE_IMAGES: Record<string, string> = {
  // Wildnis
  forest_path: imgForest,
  forest_clearing: imgForest,
  forest_night: imgForest,
  mountain_pass: imgRuinEntrance,
  mountain_cave: imgRuinChamber,
  swamp: imgForest,
  coast: imgTavernExt,
  river_ferry: imgTavernExt,
  camp_fire: imgEncounter,

  // Stadt
  city_gate: imgTavernExt,
  city_market: imgTavernExt,
  city_alley: imgEncounter,
  city_temple: imgRuinChamber,
  city_palace: imgRuinChamber,

  // Schenke
  tavern_ext: imgTavernExt,
  tavern_int: imgTavernInt,
  tavern_brawl: imgTavernInt,

  // Verlies
  dungeon_door: imgRuinEntrance,
  dungeon_corridor: imgRuinEntrance,
  dungeon_chamber: imgRuinChamber,
  dungeon_crypt: imgRuinChamber,

  // NPCs / Begegnungen
  npc_noble: imgTavernInt,
  npc_priest: imgRuinChamber,
  npc_thug: imgEncounter,
  npc_merchant: imgTavernInt,
  npc_mage: imgRuinChamber,
  combat_intro: imgEncounter,
  aftermath: imgForest,
};

export const DSA_SCENE_TAGS = Object.keys(DSA_SCENE_IMAGES) as ReadonlyArray<string>;

export function resolveSceneImage(tag: string | null | undefined, fallback: string): string {
  if (!tag) return fallback;
  return DSA_SCENE_IMAGES[tag] ?? fallback;
}

/** Standard-Fallback wenn weder Tag noch Setting passen. */
export const DEFAULT_SCENE_IMAGE = imgForest;