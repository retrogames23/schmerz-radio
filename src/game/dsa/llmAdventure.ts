import { DSA_SCENE_TAGS } from "./sceneImages";
import { ENEMY_STATS } from "./combat";
import { DSA_MOODS, isDsaMood, type DsaMood } from "@/audio/dsaMusic";

/**
 * Typen, Settings und Marker-Parser für die LLM-gesteuerte
 * DSA-Tafelrunde. Bewusst flach gehalten — UI, Server und Prompt
 * benutzen genau diese Typen.
 */

export type DsaSettingId =
  | "city"
  | "wilderness"
  | "epic"
  | "dungeon"
  | "court"
  | "random";

export interface DsaSetting {
  id: DsaSettingId;
  title: string;
  blurb: string;
  /** Hinweise für den Meister, was zu diesem Setting gehört. */
  masterHint: string;
  /** Eröffnungsbild-Tag. */
  openingTag: string;
}

export const DSA_SETTINGS: ReadonlyArray<DsaSetting> = [
  {
    id: "city",
    title: "Stadt-Abenteuer",
    blurb: "Intrigen in Gareth, Punin, Festum oder Al'Anfa. Märkte, Tempel, dunkle Gassen.",
    masterHint:
      "Spielt in einer Aventurien-Stadt deiner Wahl (Mittelreich, Horasreich, Tulamiden, Thorwal-Hafen). Auftraggeber: Tempel, Gildenmeister, Adlige oder zwielichtige Händler. Setze Stadtwache, Gassenkinder, Phex-Geweihte ein. Endkampf ist meist ein Hinterzimmer-Showdown oder Tempel-Showdown.",
    openingTag: "city_gate",
  },
  {
    id: "wilderness",
    title: "Wildnis-Abenteuer",
    blurb: "Reichsforst, Svelltland, Khôm-Rand, Tobrische Steppe — Wege ohne Wirtshaus.",
    masterHint:
      "Spielt unter freiem Himmel — Wald, Sumpf, Hochland, Wüste oder Eis. Begegnungen: Räuber, Goblins, Druiden, Nivesen, Sumpfwürmer. Endkampf an einem Naturheiligtum, an einer Quelle, in einer Höhle.",
    openingTag: "forest_path",
  },
  {
    id: "epic",
    title: "Episches Abenteuer",
    blurb: "Borbarad-Vorzeichen, vergessene Tempel, das Ende einer Welt — höhere Mächte mischen mit.",
    masterHint:
      "Etwas Großes steht bevor: ein Dämonenmal, ein verschollener Hesinde-Tempel, ein Borbarad-Vorbote, ein Tor zu den Niederhöllen. Tonfall: schicksalhaft, mit zwölfgöttlichen Zeichen. Endkampf gegen einen halbmächtigen Feind (Spuk, niederer Dämon, Untoter Magier).",
    openingTag: "city_temple",
  },
  {
    id: "dungeon",
    title: "Dungeon",
    blurb: "Echsenruine, Zwergenstollen, Schwarzmagier-Kerker — ein Bauwerk voller Räume.",
    masterHint:
      "Spielt in einem klassischen Verlies (Ruine, Stollen, Krypta, Schwarzmagier-Keller). Räume mit Rätseln, Fallen, Wachen, einer Schatzkammer. Endkampf gegen den Verliesherrn.",
    openingTag: "dungeon_door",
  },
  {
    id: "court",
    title: "Hof-Intrige",
    blurb: "Empfang am Kaiserhof in Gareth, ein Komplott, ein Gift im Pokal.",
    masterHint:
      "Spielt am Hof eines Barons, Grafen oder Kaisers. Hauptkonflikt ist sozial — Etikette, Verleumdung, Erbstreit, Gift. CH-Proben und KL-Proben überwiegen. Kampf optional und kurz (Duell, Leibwächter).",
    openingTag: "city_palace",
  },
  {
    id: "random",
    title: "Würfel der Götter",
    blurb: "Du überlässt es Tjark — er rollt für dich.",
    masterHint:
      "Wähle das Setting selbst und überrasche die Gruppe. Schreibe in deinem ersten Satz, in welcher Region und Stadt/Wildnis ihr seid.",
    openingTag: "forest_path",
  },
];

export function getSetting(id: string): DsaSetting | null {
  return DSA_SETTINGS.find((s) => s.id === id) ?? null;
}

// ────────────────────────────────────────────────────────────────────
// Marker-Parser
// ────────────────────────────────────────────────────────────────────

export type Speaker = "TJARK" | "BREM" | "YELVA";

export interface SpokenLine {
  speaker: Speaker;
  text: string;
}

export interface CombatRequest {
  enemyIds: string[];
}

export type EndKind = "victory" | "defeat" | "aborted";

export interface ParsedMasterTurn {
  lines: SpokenLine[];
  sceneTag: string | null;
  combat: CombatRequest | null;
  check: { attr: string; modifier: number } | null;
  outtimeWarn: boolean;
  end: EndKind | null;
  /** Optionaler Mood-Hinweis vom Meister an den Musik-Player. */
  mood: DsaMood | null;
}

const SPEAKER_RE = /^\s*\[(TJARK|BREM|YELVA)\]\s*/i;
const SCENE_RE = /\[SCENE:\s*([a-z0-9_]+)\s*\]/i;
const COMBAT_RE = /\[COMBAT:\s*([a-z0-9_,\s-]+)\]/i;
const CHECK_RE = /\[CHECK:\s*(MU|KL|CH|FF|GE|IN|KK)\s*(?:([+-]\s*\d+))?\s*\]/i;
const OUTTIME_RE = /\[OUTTIME_WARN\]/i;
const END_RE = /\[END:\s*(victory|defeat|aborted)\s*\]/i;
const MOOD_RE = /\[MOOD:\s*([a-z_]+)\s*\]/i;

/** Entfernt jegliche Marker aus dem reinen Sprechtext einer Zeile. */
function stripMarkers(s: string): string {
  return s
    .replace(SCENE_RE, "")
    .replace(COMBAT_RE, "")
    .replace(CHECK_RE, "")
    .replace(OUTTIME_RE, "")
    .replace(END_RE, "")
    .replace(MOOD_RE, "")
    .trim();
}

export function parseMasterTurn(raw: string): ParsedMasterTurn {
  const text = raw.trim();

  // Globale Marker (irgendwo im Text)
  const sceneMatch = SCENE_RE.exec(text);
  const combatMatch = COMBAT_RE.exec(text);
  const checkMatch = CHECK_RE.exec(text);
  const endMatch = END_RE.exec(text);
  const outtime = OUTTIME_RE.test(text);
  const moodMatch = MOOD_RE.exec(text);
  const mood: DsaMood | null =
    moodMatch && isDsaMood(moodMatch[1].toLowerCase()) ? (moodMatch[1].toLowerCase() as DsaMood) : null;

  const sceneTag =
    sceneMatch && DSA_SCENE_TAGS.includes(sceneMatch[1].toLowerCase())
      ? sceneMatch[1].toLowerCase()
      : null;

  let combat: CombatRequest | null = null;
  if (combatMatch) {
    const ids = combatMatch[1]
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((id) => id.length > 0 && id in ENEMY_STATS);
    if (ids.length > 0) combat = { enemyIds: ids };
  }

  const check = checkMatch
    ? {
        attr: checkMatch[1].toUpperCase(),
        modifier: checkMatch[2] ? parseInt(checkMatch[2].replace(/\s+/g, ""), 10) : 0,
      }
    : null;

  const end = endMatch
    ? (endMatch[1].toLowerCase() as EndKind)
    : null;

  // Zeilen aufsplitten — Speaker-Marker leitet eine neue Zeile ein.
  const lines: SpokenLine[] = [];
  let current: SpokenLine | null = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      if (current) {
        lines.push(current);
        current = null;
      }
      continue;
    }
    const m = SPEAKER_RE.exec(line);
    if (m) {
      if (current) lines.push(current);
      const speaker = m[1].toUpperCase() as Speaker;
      const rest = stripMarkers(line.replace(SPEAKER_RE, ""));
      current = { speaker, text: rest };
    } else if (current) {
      const cleaned = stripMarkers(line);
      if (cleaned) current.text = `${current.text} ${cleaned}`.trim();
    } else {
      // Keine Sprecher-Markierung am Anfang — default TJARK.
      const cleaned = stripMarkers(line);
      if (cleaned) current = { speaker: "TJARK", text: cleaned };
    }
  }
  if (current) lines.push(current);

  // Leere Sprechzeilen filtern.
  const finalLines = lines.filter((l) => l.text.length > 0);

  return {
    lines: finalLines,
    sceneTag,
    combat,
    check,
    outtimeWarn: outtime,
    end,
    mood,
  };
}

export { DSA_MOODS };

/** Was der Server pro Wende speichert. */
export interface StoredTurn {
  role: "user" | "assistant" | "system";
  content: string;
}

/** Status-Spalte der Tabelle. */
export type AdventureStatus = "active" | "victory" | "defeat" | "aborted";

export interface AdventureRow {
  setting: DsaSettingId;
  character_snapshot: import("@/game/types").DsaCharacterSummary;
  messages: StoredTurn[];
  summary: string;
  current_image_tag: string;
  status: AdventureStatus;
  offtopic_streak: number;
  updated_at: string;
}