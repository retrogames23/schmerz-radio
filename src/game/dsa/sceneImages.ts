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
import imgForestShelter from "@/assets/dsa/dsa-forest-shelter.jpg";
import imgHutExterior from "@/assets/dsa/dsa-hut-exterior.jpg";
import imgHutInterior from "@/assets/dsa/dsa-hut-interior.jpg";
import imgVillageSquare from "@/assets/dsa/dsa-village-square.jpg";
import imgFarmstead from "@/assets/dsa/dsa-farmstead.jpg";
import imgRiverBank from "@/assets/dsa/dsa-river-bank.jpg";
import imgStoneBridge from "@/assets/dsa/dsa-stone-bridge.jpg";
import imgCrossroadsShrine from "@/assets/dsa/dsa-crossroads-shrine.jpg";
import imgTavernRoom from "@/assets/dsa/dsa-tavern-room.jpg";
import imgBlacksmith from "@/assets/dsa/dsa-blacksmith.jpg";
import imgTempleInterior from "@/assets/dsa/dsa-temple-interior.jpg";
import imgWaysideShrine from "@/assets/dsa/dsa-wayside-shrine.jpg";
import imgCaveEntrance from "@/assets/dsa/dsa-cave-entrance.jpg";
import imgSwampPath from "@/assets/dsa/dsa-swamp-path.jpg";
import imgSwampRuin from "@/assets/dsa/dsa-swamp-ruin.jpg";
import imgSnowPass from "@/assets/dsa/dsa-snow-pass.jpg";
import imgGraveyard from "@/assets/dsa/dsa-graveyard.jpg";
import imgShipDeck from "@/assets/dsa/dsa-ship-deck.jpg";
import imgHarbor from "@/assets/dsa/dsa-harbor.jpg";
import imgNpcPriest from "@/assets/dsa/dsa-npc-priest.jpg";
import imgAftermathAlley from "@/assets/dsa/dsa-aftermath-alley.jpg";
import imgAftermathTavern from "@/assets/dsa/dsa-aftermath-tavern.jpg";
import imgAftermathForest from "@/assets/dsa/dsa-aftermath-forest.jpg";
import imgAftermathDungeon from "@/assets/dsa/dsa-aftermath-dungeon.jpg";
import imgCombatAlley from "@/assets/dsa/dsa-combat-alley.jpg";
import imgCombatTavern from "@/assets/dsa/dsa-combat-tavern.jpg";
import imgCombatForest from "@/assets/dsa/dsa-combat-forest.jpg";
import imgCombatDungeon from "@/assets/dsa/dsa-combat-dungeon.jpg";
import imgCityCourtyard from "@/assets/dsa/dsa-city-courtyard.jpg";
import imgNobleHall from "@/assets/dsa/dsa-noble-hall.jpg";
import imgScriptorium from "@/assets/dsa/dsa-scriptorium.jpg";
import imgTownWalls from "@/assets/dsa/dsa-town-walls.jpg";

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
  forest_shelter: imgForestShelter,
  mountain_pass: imgMountainPass,
  mountain_cave: imgMountainCave,
  cave_entrance: imgCaveEntrance,
  snow_pass: imgSnowPass,
  swamp: imgSwamp,
  swamp_path: imgSwampPath,
  swamp_ruin: imgSwampRuin,
  coast: imgCoast,
  river_ferry: imgRiverFerry,
  river_bank: imgRiverBank,
  stone_bridge: imgStoneBridge,
  crossroads_shrine: imgCrossroadsShrine,
  wayside_shrine: imgWaysideShrine,
  camp_fire: imgCampFire,

  // Land & Hütte
  hut_exterior: imgHutExterior,
  hut_interior: imgHutInterior,
  farmstead: imgFarmstead,
  village_square: imgVillageSquare,

  // Stadt
  city_gate: imgCityGate,
  city_market: imgCityMarket,
  city_alley: imgCityAlley,
  city_temple: imgCityTemple,
  city_palace: imgCityPalace,
  city_courtyard: imgCityCourtyard,
  town_walls: imgTownWalls,
  noble_hall: imgNobleHall,
  scriptorium: imgScriptorium,
  temple_interior: imgTempleInterior,
  blacksmith: imgBlacksmith,
  graveyard: imgGraveyard,
  harbor: imgHarbor,
  ship_deck: imgShipDeck,

  // Schenke
  tavern_ext: imgTavernExt,
  tavern_int: imgTavernInt,
  tavern_brawl: imgTavernBrawl,
  tavern_room: imgTavernRoom,

  // Verlies
  dungeon_door: imgDungeonDoor,
  dungeon_corridor: imgDungeonCorridor,
  dungeon_chamber: imgDungeonChamber,
  dungeon_crypt: imgDungeonCrypt,

  // NPCs / Begegnungen
  npc_noble: imgNpcNoble,
  npc_merchant: imgNpcMerchant,
  npc_mage: imgNpcMage,
  npc_priest: imgNpcPriest,
  combat_intro: imgCombat,
  aftermath: imgAftermath,
  combat_alley: imgCombatAlley,
  combat_tavern: imgCombatTavern,
  combat_forest: imgCombatForest,
  combat_dungeon: imgCombatDungeon,
  aftermath_alley: imgAftermathAlley,
  aftermath_tavern: imgAftermathTavern,
  aftermath_forest: imgAftermathForest,
  aftermath_dungeon: imgAftermathDungeon,
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