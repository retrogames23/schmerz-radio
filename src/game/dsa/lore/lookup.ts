/**
 * Lookup-Tool für den LLM-Meister. Statt alle Detail-Lore (Anreden,
 * Götter-Beinamen, Regionen, Zauber, Waffen, Talente, Monster) in jedem
 * System-Prompt mitzuschleppen, bekommt der Meister nur Faustregeln und
 * darf bei Bedarf via `dsaLore({ topic })` nachschlagen.
 *
 * Vorteile:
 *  - Default-Prompt schrumpft drastisch -> Modell ist nicht überfordert.
 *  - Detailwissen ist trotzdem verfügbar, wenn die Szene es braucht.
 *  - Topic-Enum verhindert Halluzinationen ("topic: Trollberge").
 *
 * EINE Datei, EINE Funktion: `resolveLoreTopic(topic)` liefert kurzen
 * Text (oder leeren String, wenn das Topic nicht existiert).
 */

import { DSA_GODS, type GodBrief, type DsaGodId } from "./gods";
import { DSA_REGIONS, type RegionBrief, type DsaRegionId } from "./regions";
import { DSA_BESTIARY } from "./bestiary";
import { DSA_AUELFEN_BRIEF } from "./auelfen";
import { DSA_BREM_BACKSTORY, DSA_YELVA_BACKSTORY } from "./companions";
import { DSA_CURRENT_AFFAIRS_20HAL } from "./currentAffairs";
import { DSA_ECONOMY_BRIEF } from "./economy";
import { DSA_CALENDAR_BRIEF } from "./calendar";
import { DSA_LANGUAGE_BRIEF } from "./language";
import { SPELLS } from "../rules/spells";
import { WEAPONS } from "../rules/weapons";
import { ARMORS } from "../rules/armor";
import { TALENTS } from "../rules/talents";

// --------- Anreden-Detailwissen (vorher Teil von llmLore.ts) ----------

const ANREDEN_ADEL = `
ANREDEN — ADEL (Mittelreich / Horasreich), vom Niedrigsten zum Höchsten:
  Junker / Edler / Ritter mit Brief und Siegel ........ "Euer Wohlgeboren"
  Baron / Freiherr .................................... "Euer Hochgeboren"
  Comto / Comtessa (horasisch) ........................ "Euer Edelhochgeboren"
  Graf / Landgraf / Markgraf .......................... "Euer Hochwohlgeboren"
    (horasisch für Markgraf alternativ ................ "Euer Erlaucht")
  Fürst ............................................... "Euer Durchlaucht"
  Herzog / kaiserlicher Prinz ......................... "Euer Kaiserliche Hoheit" / "Euer Liebden"
  Kronprinz (Brin) .................................... "Euer Kaiserliche Hoheit"
  Kaiser / König ...................................... "Euer Majestät"
  Einfacher Krieger mit Brief und Siegel .............. "Hochachtbarer Herr/Dame"
  Freier Bürger (Mittelreich) ......................... "Meister/Meisterin", "Herr/Frau"

WICHTIG:
  - Welcher Titel zählt, hängt vom ADRESSATEN ab, NICHT vom Sprecher.
    Ein Geweihter, der einen Ritter anspricht, sagt "Euer Wohlgeboren" —
    die Anrede des Geweihten ("Euer Gnaden", siehe Klerus-Lookup) gilt
    ANDERSHERUM, wenn der Ritter den Geweihten anspricht.
  - Im Zweifel den geringeren, sicheren Titel wählen.
`.trim();

const ANREDEN_KLERUS = `
ANREDEN — KLERUS (Zwölfgötter-Geweihte), vom Niedrigsten zum Höchsten:
  Novize ............................................. nur "Bruder"/"Schwester" + Name
  Akoluth / Laienprediger ............................ "Euer Ehren"
  Einfacher Priester / Geweihter ..................... "Euer Gnaden"
  Erzpriester ........................................ "Euer Ehrwürden"
  Prätor / Tempelvorsteher ........................... "Euer Hochwürden"
  Erzprätor / Ordensmeister .......................... "Euer Exzellenz"
  Metropolit ......................................... "Euer Eminenz"
  Hochgeweihter / Patriarch / Matriarchin ............ "Euer Erhabenheit"
    Praios-Bote (besonders) .......................... "Eure Erhabene Weisheit"
    Al'anfanischer Boron-Patriarch ................... "Euer Hochwürdigste Erhabenheit"

WICHTIG:
  - Diese Titel beschreiben, WIE EIN GEWEIHTER ANGESPROCHEN WIRD.
  - Ein Geweihter, der einen Adligen anredet, verwendet dessen Adelstitel
    (siehe "anreden.adel"). "Euer Gnaden" aus dem Mund eines Geweihten an
    einen Ritter/Baron ist FALSCH.
`.trim();

const ANREDEN_MAGIER = `
ANREDEN — GILDENMAGIER (Akademiker der magischen Künste):
  Adeptus minor ...................................... "Gelehrter Herr/Dame"
  Adeptus maior ...................................... "Wohlgelehrter Herr/Dame"
  Magus / Maga ....................................... "Hochgelehrter Herr/Dame"
  Magister ordinarius / extraordinarius .............. "Magister/Magistra"
  Magister magnus .................................... "Hochgelehrter Magister"
  Akademievorstand / Convocatus ...................... "Eure Spektabilität"
  Erzmagus ........................................... "Eure Magnifizienz"

WICHTIG: "Spektabilität" ist AUSSCHLIESSLICH der Titel eines Akademie-
  vorstands, NIE für Geweihte verwenden.
`.trim();

const ANREDEN_AKADEMIKER = `
ANREDEN — WELTLICHE AKADEMIKER (Universitäten, keine Magier):
  Lizentiat .......................................... "Gelehrter Herr/Dame"
  Doktor / Dozent .................................... "Herr/Frau Doktor" / "Wohlgelehrter Herr/Dame"
  Professor .......................................... "Herr/Frau Professor" / "Hochgelehrter Herr/Dame"
  Rektor ............................................. "Eure Spektabilität"
`.trim();

const ANREDEN_REGIONAL = `
ANREDEN — REGIONAL ABWEICHEND:
  TULAMIDENLANDE: "Effendi" (höherer Adel, Tempelvorsteher, Akademieleiter),
    "Sahib"/"Lalla" (einfache Geweihte, niederer Adel, Handwerksmeister).
    Sultan/Emir/Kalif blumig-unterwürfig ("Oh Quell der Weisheit",
    "Sohn der Sonne").
  THORWAL: keine Südtitel. Anrede mit Name und Abstammung ("Alrik, Sohn
    des Alrik"). Anführer = "Hetmann" / "Hetfrau".
  MITTELREICH BÜRGERLICH: "Meister/Meisterin", "Herr/Frau", ländlich auch
    "Gevatter/Gevatterin".
  ZWERGE: Anrede mit Sippe ("Angbar, Sohn des Angrosch, aus der Sippe der
    Brogarim"). "Bei Angroschs Hammer!" als Schwur.
`.trim();

// --------- Helper für Detail-Texte ---------

function godDetail(g: GodBrief): string {
  return [
    `${g.name.toUpperCase()} — ${g.beiname}`,
    `Domäne: ${g.domain}`,
    `Symbol: ${g.symbol}. Farben: ${g.colors}. Fest: ${g.festtag}.`,
    `Liturgie/Kleidung: ${g.liturgie}`,
    `Tabus: ${g.tabus}`,
    `Schattenseite: ${g.schatten}`,
    `Gruß/Anrede: ${g.greetingNote}`,
  ].join("\n");
}

function regionDetail(r: RegionBrief): string {
  return [
    `REGION — ${r.name}`,
    `Hauptorte: ${r.hauptorte}`,
    `Herrschaft (20 Hal): ${r.herrscher}`,
    `Götter vor Ort: ${r.goetter}`,
    `Alltag: ${r.alltag}`,
    `Typische Bedrohung: ${r.bedrohung}`,
    `Sprache/Anrede: ${r.sprache}`,
    `Namensschema: ${r.namen}`,
    `Notiz: ${r.notiz}`,
  ].join("\n");
}

// --------- Topic-Enum (Liste aller erlaubten Topics) ---------

export const LORE_TOPICS: string[] = [
  // Anreden
  "anreden.adel",
  "anreden.klerus",
  "anreden.magier",
  "anreden.akademiker",
  "anreden.regional",
  // Welt-Kontext
  "welt.tagesgeschehen",
  "welt.wirtschaft",
  "welt.kalender",
  "welt.sprache",
  "welt.auelfen",
  "companions.brem",
  "companions.yelva",
  // Listen
  "liste.goetter",
  "liste.regionen",
  "liste.zauber",
  "liste.waffen",
  "liste.ruestungen",
  "liste.talente",
  "liste.monster",
  // Detail-IDs (dynamisch ergänzt)
  ...Object.keys(DSA_GODS).map((id) => `gott.${id}`),
  ...Object.keys(DSA_REGIONS).map((id) => `region.${id}`),
  ...SPELLS.map((s) => `zauber.${s.id}`),
  ...Object.keys(WEAPONS).map((id) => `waffe.${id}`),
  ...Object.keys(ARMORS).map((id) => `ruestung.${id}`),
  ...TALENTS.map((t) => `talent.${t.id}`),
  ...Object.keys(DSA_BESTIARY).map((id) => `monster.${id}`),
];

/**
 * Löst ein Topic in einen knappen Detail-Text auf. Unbekannte Topics
 * liefern einen Hinweis mit Vorschlägen, statt zu raten — so kann das
 * Modell sich korrigieren.
 */
export function resolveLoreTopic(topic: string): string {
  const t = topic.trim().toLowerCase();

  // Statische Brocken
  switch (t) {
    case "anreden.adel": return ANREDEN_ADEL;
    case "anreden.klerus": return ANREDEN_KLERUS;
    case "anreden.magier": return ANREDEN_MAGIER;
    case "anreden.akademiker": return ANREDEN_AKADEMIKER;
    case "anreden.regional": return ANREDEN_REGIONAL;
    case "welt.tagesgeschehen": return DSA_CURRENT_AFFAIRS_20HAL;
    case "welt.wirtschaft": return DSA_ECONOMY_BRIEF;
    case "welt.kalender": return DSA_CALENDAR_BRIEF;
    case "welt.sprache": return DSA_LANGUAGE_BRIEF;
    case "welt.auelfen": return DSA_AUELFEN_BRIEF;
    case "companions.brem": return DSA_BREM_BACKSTORY;
    case "companions.yelva": return DSA_YELVA_BACKSTORY;
  }

  // Indizes
  if (t === "liste.goetter") {
    return "Verfügbare Götter (für gott.<id>): " +
      (Object.values(DSA_GODS) as GodBrief[])
        .map((g) => `${g.id} (${g.name})`)
        .join(", ");
  }
  if (t === "liste.regionen") {
    return "Verfügbare Regionen (für region.<id>): " +
      (Object.values(DSA_REGIONS) as RegionBrief[])
        .map((r) => `${r.id} (${r.name})`)
        .join(", ");
  }
  if (t === "liste.zauber") {
    return "Verfügbare Zauber (für zauber.<id>): " +
      SPELLS.map((s) => `${s.id} (${s.name})`).join(", ");
  }
  if (t === "liste.waffen") {
    return "Verfügbare Waffen (für waffe.<id>): " +
      Object.values(WEAPONS).map((w) => `${w.id} (${w.name})`).join(", ");
  }
  if (t === "liste.ruestungen") {
    return "Verfügbare Rüstungen/Schilde (für ruestung.<id>): " +
      Object.values(ARMORS).map((a) => `${a.id} (${a.name})`).join(", ");
  }
  if (t === "liste.talente") {
    return "Verfügbare Talente (für talent.<id>): " +
      TALENTS.map((tl) => `${tl.id} (${tl.name})`).join(", ");
  }
  if (t === "liste.monster") {
    return "Verfügbare Monster (für monster.<id>): " +
      Object.keys(DSA_BESTIARY).join(", ");
  }

  // Detail-Lookups mit Prefix
  const dotIdx = t.indexOf(".");
  if (dotIdx > 0) {
    const kind = t.slice(0, dotIdx);
    const id = t.slice(dotIdx + 1);
    if (kind === "gott") {
      const g = DSA_GODS[id as DsaGodId];
      return g ? godDetail(g) : `Unbekannter Gott '${id}'. Versuche "liste.goetter".`;
    }
    if (kind === "region") {
      const r = DSA_REGIONS[id as DsaRegionId];
      return r ? regionDetail(r) : `Unbekannte Region '${id}'. Versuche "liste.regionen".`;
    }
    if (kind === "zauber") {
      const s = SPELLS.find((sp) => sp.id === id);
      return s
        ? `${s.name} — Probe ${s.probe.join("/")}, Kosten ${s.cost} AsP, ${s.target}, Reichweite ${s.range}.\nWirkung: ${s.effect}\nHauszauber für: ${s.schools.join(", ") || "—"}`
        : `Unbekannter Zauber '${id}'. Versuche "liste.zauber".`;
    }
    if (kind === "waffe") {
      const w = WEAPONS[id];
      return w
        ? `${w.name} — TP ${w.tp}, AT${w.at >= 0 ? "+" : ""}${w.at}, PA${w.pa >= 0 ? "+" : ""}${w.pa}, ${w.hands}-händig, Reichweite ${w.reach}, ${w.kind}.`
        : `Unbekannte Waffe '${id}'. Versuche "liste.waffen".`;
    }
    if (kind === "ruestung") {
      const a = ARMORS[id];
      if (!a) return `Unbekannte Rüstung '${id}'. Versuche "liste.ruestungen".`;
      return a.kind === "shield"
        ? `${a.name} (Schild) — PA+${a.paBonus ?? 0}.`
        : `${a.name} — RS ${a.rs}.`;
    }
    if (kind === "talent") {
      const tl = TALENTS.find((tt) => tt.id === id);
      return tl
        ? `${tl.name} — Probe ${tl.probe.join("/")}. Kategorie: ${tl.category}.`
        : `Unbekanntes Talent '${id}'. Versuche "liste.talente".`;
    }
    if (kind === "monster") {
      const m = DSA_BESTIARY[id];
      return m ? `${id}: ${m}` : `Unbekanntes Monster '${id}'. Versuche "liste.monster".`;
    }
  }

  return `Unbekanntes Topic '${topic}'. Erlaubte Präfixe: anreden.*, welt.*, companions.*, liste.*, gott.<id>, region.<id>, zauber.<id>, waffe.<id>, ruestung.<id>, talent.<id>, monster.<id>.`;
}

/**
 * Kompakte Topic-Übersicht für den System-Prompt — listet nur die
 * Hauptkategorien, nicht jede ID einzeln (das macht "liste.*" zur Laufzeit).
 */
export const LORE_TOPIC_HINT = `
Verfügbare Topics für dsaLore({ topic }):
  ANREDEN: anreden.adel, anreden.klerus, anreden.magier, anreden.akademiker, anreden.regional
  WELT:    welt.tagesgeschehen, welt.wirtschaft, welt.kalender, welt.sprache, welt.auelfen
  GEFÄHRTEN: companions.brem, companions.yelva
  INDIZES: liste.goetter, liste.regionen, liste.zauber, liste.waffen, liste.ruestungen, liste.talente, liste.monster
  DETAIL:  gott.<id>, region.<id>, zauber.<id>, waffe.<id>, ruestung.<id>, talent.<id>, monster.<id>
           — wenn du eine <id> nicht kennst, ruf zuerst die passende liste.* auf.
`.trim();