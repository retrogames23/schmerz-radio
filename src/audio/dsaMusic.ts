import intro01 from "@/assets/music/dsa/intro_01.mp3";
import calmTravel01 from "@/assets/music/dsa/calm_travel_01.mp3";
import calmTravel02 from "@/assets/music/dsa/calm_travel_02.mp3";
import tavernRest01 from "@/assets/music/dsa/tavern_rest_01.mp3";
import dialogue01 from "@/assets/music/dsa/dialogue_01.mp3";
import mystery01 from "@/assets/music/dsa/mystery_01.mp3";
import tenseInvestigation01 from "@/assets/music/dsa/tense_investigation_01.mp3";
import dread01 from "@/assets/music/dsa/dread_01.mp3";
import combat01 from "@/assets/music/dsa/combat_01.mp3";
import combat02 from "@/assets/music/dsa/combat_02.mp3";
import bossFight01 from "@/assets/music/dsa/boss_fight_01.mp3";
import chase01 from "@/assets/music/dsa/chase_01.mp3";
import ritual01 from "@/assets/music/dsa/ritual_01.mp3";
import victory01 from "@/assets/music/dsa/victory_01.mp3";
import grief01 from "@/assets/music/dsa/grief_01.mp3";
import joyful01 from "@/assets/music/dsa/ausgelassen_froehlich_01.mp3";

/**
 * Stimmungs-Manifest für die LLM-Tafelrunde. Jeder Mood kennt einen Pool
 * von Tracks (1–2). Am Ende eines laufenden Tracks wählt der MusicPlayer
 * einen neuen Track aus dem Pool des aktuell zugewiesenen Moods —
 * niemals mittendrin. Fallbacks (defeat, wonder) zeigen auf benachbarte
 * Moods, da Tjark sie selten setzt.
 */
export const DSA_MOODS = [
  "intro",
  "calm_travel",
  "tavern_rest",
  "dialogue",
  "mystery",
  "tense_investigation",
  "dread",
  "combat",
  "boss_fight",
  "chase",
  "ritual",
  "victory",
  "grief",
  "defeat",
  "wonder",
  "joyful",
] as const;

export type DsaMood = (typeof DSA_MOODS)[number];

export function isDsaMood(value: unknown): value is DsaMood {
  return typeof value === "string" && (DSA_MOODS as readonly string[]).includes(value);
}

export const DSA_MOOD_TRACKS: Record<DsaMood, string[]> = {
  intro: [intro01],
  calm_travel: [calmTravel01, calmTravel02],
  tavern_rest: [tavernRest01],
  dialogue: [dialogue01],
  mystery: [mystery01],
  tense_investigation: [tenseInvestigation01],
  dread: [dread01],
  combat: [combat01, combat02],
  boss_fight: [bossFight01],
  chase: [chase01],
  ritual: [ritual01],
  victory: [victory01],
  grief: [grief01],
  // Fallbacks für seltene Moods, für die kein eigener Track existiert.
  defeat: [grief01],
  wonder: [mystery01, ritual01],
  joyful: [joyful01],
};

/** Liefert einen zufälligen Track aus dem Pool, möglichst nicht `avoidSrc`. */
export function pickMoodTrack(mood: DsaMood, avoidSrc: string | null): string {
  const pool = DSA_MOOD_TRACKS[mood] ?? DSA_MOOD_TRACKS.calm_travel;
  if (pool.length === 1) return pool[0];
  const candidates = avoidSrc ? pool.filter((s) => s !== avoidSrc) : pool;
  const list = candidates.length > 0 ? candidates : pool;
  return list[Math.floor(Math.random() * list.length)];
}