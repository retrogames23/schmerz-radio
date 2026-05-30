import imgForestPath from "@/assets/dsa/dsa-anreise-forest.jpg";
import imgForestClearing from "@/assets/dsa/dsa-forest-clearing.jpg";
import imgForestNight from "@/assets/dsa/dsa-forest-night.jpg";
import imgMountainPass from "@/assets/dsa/dsa-mountain-pass.jpg";
import imgMountainCave from "@/assets/dsa/dsa-mountain-cave.jpg";
import imgSwamp from "@/assets/dsa/dsa-swamp.jpg";
import imgCoast from "@/assets/dsa/dsa-coast.jpg";
import imgRiverFerry from "@/assets/dsa/dsa-river-ferry.jpg";
import imgCampFire from "@/assets/dsa/dsa-camp-fire.jpg";
import imgCityGate from "@/assets/dsa/dsa-city-gate.jpg";
import imgCityMarket from "@/assets/dsa/dsa-city-market.jpg";
import imgCityAlley from "@/assets/dsa/dsa-city-alley.jpg";
import imgCityTemple from "@/assets/dsa/dsa-city-temple.jpg";
import imgCityPalace from "@/assets/dsa/dsa-city-palace.jpg";
import imgTavernExt from "@/assets/dsa/dsa-tavern-exterior.jpg";
import imgTavernInt from "@/assets/dsa/dsa-tavern-interior.jpg";
import imgTavernBrawl from "@/assets/dsa/dsa-tavern-brawl.jpg";
import imgDungeonDoor from "@/assets/dsa/dsa-ruin-entrance.jpg";
import imgDungeonChamber from "@/assets/dsa/dsa-ruin-chamber.jpg";
import imgDungeonCorridor from "@/assets/dsa/dsa-dungeon-corridor.jpg";
import imgDungeonCrypt from "@/assets/dsa/dsa-dungeon-crypt.jpg";
import imgNpcNoble from "@/assets/dsa/dsa-npc-noble.jpg";
import imgNpcMerchant from "@/assets/dsa/dsa-npc-merchant.jpg";
import imgNpcMage from "@/assets/dsa/dsa-npc-mage.jpg";
import imgCombat from "@/assets/dsa/dsa-anreise-encounter.jpg";
import imgAftermath from "@/assets/dsa/dsa-aftermath.jpg";

/**
 * Pool spezifisch illustrierter Aventurien-Szenen. Der LLM-Meister wählt
 * mit `[SCENE: <tag>]` eines aus. Passt KEIN Tag, wird kein Bild gezeigt
 * (lieber gar kein Bild als ein unpassendes).
 */
export const DSA_SCENE_IMAGES: Record<string, string> = {
  // Wildnis
  forest_path: imgForestPath,
  forest_clearing: imgForestClearing,
  forest_night: imgForestNight,
  mountain_pass: imgMountainPass,
  mountain_cave: imgMountainCave,
  swamp: imgSwamp,
  coast: imgCoast,
  river_ferry: imgRiverFerry,
  camp_fire: imgCampFire,

  // Stadt
  city_gate: imgCityGate,
  city_market: imgCityMarket,
  city_alley: imgCityAlley,
  city_temple: imgCityTemple,
  city_palace: imgCityPalace,

  // Schenke
  tavern_ext: imgTavernExt,
  tavern_int: imgTavernInt,
  tavern_brawl: imgTavernBrawl,

  // Verlies
  dungeon_door: imgDungeonDoor,
  dungeon_corridor: imgDungeonCorridor,
  dungeon_chamber: imgDungeonChamber,
  dungeon_crypt: imgDungeonCrypt,

  // NPCs / Begegnungen
  npc_noble: imgNpcNoble,
  npc_merchant: imgNpcMerchant,
  npc_mage: imgNpcMage,
  combat_intro: imgCombat,
  aftermath: imgAftermath,
};

export const DSA_SCENE_TAGS = Object.keys(DSA_SCENE_IMAGES) as ReadonlyArray<string>;

/**
 * Liefert die zum Tag passende Illustration oder `null`, wenn kein
 * passendes Bild im Pool existiert. Der Aufrufer rendert dann kein Bild.
 */
export function resolveSceneImage(tag: string | null | undefined): string | null {
  if (!tag) return null;
  return DSA_SCENE_IMAGES[tag] ?? null;
}