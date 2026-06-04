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
  | "random"
  | "sandbox"
  | "wish";

export interface DsaSetting {
  id: DsaSettingId;
  title: string;
  blurb: string;
  /** Hinweise für den Meister, was zu diesem Setting gehört. */
  masterHint: string;
  /** Eröffnungsbild-Tag. */
  openingTag: string;
  /** Nur für eingeloggte Spender*innen freigeschaltet. */
  donorOnly?: boolean;
  /** Spieler gibt vorab einen Freitext-Wunsch ein. */
  requiresWish?: boolean;
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
  {
    id: "sandbox",
    title: "Sandbox-Welterkundung",
    blurb:
      "Offene Reise durch Aventurien. Sprich mit Leuten, lass dich in Tavernen nieder — vielleicht passiert was, vielleicht nicht.",
    masterHint:
      "Dies ist eine SANDBOX-RUNDE — KEIN klassisches Abenteuer mit Auftrag, Akten oder Showdown. Wähle eine Startregion und eine Stadt/Wildnis-Lage und beschreibe sie atmosphärisch. Layard soll Aventurien BEREISEN dürfen: Tavernen, Märkte, Tempel, Reisewege, Gerüchte. NSCs entstehen organisch, Begegnungen sind oft klein und alltagsnah (Reisende, Wirte, Wachen, Pilger, Bauern). Es gibt KEIN festes Ziel. Hin und wieder DARF — muss aber nicht — etwas Spannendes passieren (Diebstahl in der Schenke, Bote mit Gerücht, Streit auf der Straße, ein Räuberüberfall am Wegesrand); zwinge nichts. Akzeptiere, wenn Layard einfach nur reist, redet und beobachtet. Kämpfe sind selten und kurz. KEIN Dramaturgie-Korsett mit fünf Akten, KEIN Mindest-Wendenkanon — die Runde endet nur dann mit [END: …], wenn die Story selbst sauber dorthin kippt oder Layard sie outtime beendet.",
    openingTag: "forest_path",
    donorOnly: true,
  },
  {
    id: "wish",
    title: "Wunsch-Abenteuer",
    blurb:
      "Du beschreibst, was du erleben willst — Tjark prüft auf DSA-Lore und baut so nah wie möglich daran das Abenteuer.",
    masterHint:
      "WUNSCH-ABENTEUER: Layards Wunschtext steht weiter unten im Abschnitt »SPIELERWUNSCH«. Lies ihn als Grundlage und baue das Abenteuer so nah wie möglich an diesem Wunsch — Ort, Ton, Konflikt, Figuren. Andere DSA-Zeitalter (Hadrumal, Dritter Drachenkrieg, Bornland-Bürgerkrieg, Borbarad-Zeit etc.) sind erlaubt, solange Aventurien die Welt bleibt. NICHT erlaubt: andere Welten (Erde, fiktive Planeten), andere Genres (Cyberpunk, Steampunk, SciFi, Superhelden), nicht-aventurische Götter oder Magiesysteme. Passt der Wunsch nicht zur Lore, KIPPE ihn behutsam: behalte den Kern (Stimmung, gewünschte Begegnungen, Tonfall) und übersetze ihn in das passendste aventurische Gegenstück, anstatt ihn abzulehnen. Erkläre als Tjark im allerersten Beitrag (Outtime, 1–2 Sätze, [TJARK] mit »(Outtime) «) kurz, wie du den Wunsch umgesetzt hast und welche Anpassungen du an die Lore vorgenommen hast — DANACH erst startest du regulär mit der Eröffnungsszene.",
    openingTag: "forest_path",
    donorOnly: true,
    requiresWish: true,
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
  /** [AP: <n> | <begründung>] — wird nur zusammen mit `end` ausgewertet. */
  ap: { value: number; reason: string } | null;
  /** Vom Meister vergebene Inventar-Items (Layards Held). */
  itemsAdded: { name: string; description?: string; count?: number }[];
  /** Vom Meister gestrichene Items (per Name / Teilstring / ID). */
  itemsRemoved: string[];
}

const SPEAKER_RE = /^\s*\[(TJARK|BREM|YELVA)\]\s*/i;
const SCENE_RE = /\[SCENE:\s*([a-z0-9_]+)\s*\]/i;
const COMBAT_RE = /\[COMBAT:\s*([a-z0-9_,\s-]+)\]/i;
const CHECK_RE = /\[CHECK:\s*(MU|KL|CH|FF|GE|IN|KK)\s*(?:([+-]\s*\d+))?\s*\]/i;
const OUTTIME_RE = /\[OUTTIME_WARN\]/i;
const END_RE = /\[END:\s*(victory|defeat|aborted)\s*\]/i;
const MOOD_RE = /\[MOOD:\s*([a-z_]+)\s*\]/i;
const AP_RE = /\[AP:\s*(\d{1,4})\s*(?:\|\s*([^\]]+))?\]/i;
const ITEM_PLUS_RE_G = /\[ITEM\+:\s*([^\]]+?)\s*\]/gi;
const ITEM_MINUS_RE_G = /\[ITEM-:\s*([^\]]+?)\s*\]/gi;
/** Entfernt jegliche Marker aus dem reinen Sprechtext einer Zeile. */
function stripMarkers(s: string): string {
  return s
    .replace(SCENE_RE, "")
    .replace(COMBAT_RE, "")
    .replace(CHECK_RE, "")
    .replace(OUTTIME_RE, "")
    .replace(END_RE, "")
    .replace(MOOD_RE, "")
    .replace(AP_RE, "")
    .replace(ITEM_PLUS_RE_G, "")
    .replace(ITEM_MINUS_RE_G, "")
    // Sicherheitsnetz: alle übrigen Pseudo-Marker à la [NPC_PRIEST],
    // [SZENE_TEMPEL], [FOO_BAR] aus dem Sprechtext entfernen — die LLM
    // erfindet sie gelegentlich und sie brechen die Immersion.
    .replace(/\[[A-Z][A-Z0-9_]*(?::[^\]]*)?\]/g, "")
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
  const apMatch = AP_RE.exec(text);
  const ap = apMatch
    ? {
        value: parseInt(apMatch[1], 10),
        reason: (apMatch[2] ?? "").trim().slice(0, 200),
      }
    : null;

  // ITEM+ / ITEM-: mehrere pro Antwort erlaubt.
  const itemsAdded: { name: string; description?: string; count?: number }[] = [];
  for (const m of text.matchAll(ITEM_PLUS_RE_G)) {
    const payload = (m[1] ?? "").trim();
    if (!payload) continue;
    // Format: "Name | Beschreibung" oder "Name ×N | Beschreibung" oder nur "Name"
    const [head, ...descParts] = payload.split("|");
    const description = descParts.join("|").trim() || undefined;
    const headTrim = head.trim();
    const countMatch = /\s+[x×]\s*(\d{1,2})\s*$/i.exec(headTrim);
    const count = countMatch ? Math.max(1, Math.min(99, parseInt(countMatch[1], 10))) : undefined;
    const nameRaw = countMatch && typeof countMatch.index === "number"
      ? headTrim.slice(0, countMatch.index).trim()
      : headTrim;
    const name = nameRaw.slice(0, 60);
    if (!name) continue;
    itemsAdded.push({ name, description: description?.slice(0, 160), count });
    if (itemsAdded.length >= 6) break;
  }
  const itemsRemoved: string[] = [];
  for (const m of text.matchAll(ITEM_MINUS_RE_G)) {
    const payload = (m[1] ?? "").trim().slice(0, 60);
    if (payload) itemsRemoved.push(payload);
    if (itemsRemoved.length >= 6) break;
  }
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
    ap,
    itemsAdded,
    itemsRemoved,
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
  wish_brief?: string | null;
}