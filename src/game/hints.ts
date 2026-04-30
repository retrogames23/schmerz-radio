/**
 * "Stuck?"-Hint-System nach Vorbild von Return to Monkey Island.
 *
 * Pro offene Quest existiert ein Eintrag mit drei Hinweis-Stufen:
 *   1. Andeutung — erinnert nur an das Thema.
 *   2. Richtung  — nennt Ort/Person/Item konkret.
 *   3. Lösung    — sagt exakt, was als Nächstes zu tun ist.
 *
 * i18n-Hinweis: Alle Texte hier sind ganze Sätze. UI-Strings stehen in
 * `HINTS_UI_TEXT`. Keine String-Konkatenation in der Komponente.
 */

import type { GameApi } from "./types";

export interface HintQuest {
  /** Stabile ID, z.B. "act1.b3Authorization". */
  id: string;
  /** Kurzer Titel für die Quest-Auswahl. */
  title: string;
  /** Genau drei Stufen — vage → konkreter → exakte Anweisung. */
  hints: [string, string, string];
  /** Sortierung: kleiner = wichtiger / Default-Vorauswahl. */
  priority: number;
  /** Quest gilt als offen, wenn dieses Prädikat true ist. */
  isActive: (api: GameApi) => boolean;
  /** Quest verschwindet aus der Liste, wenn dieses Prädikat true ist. */
  isResolved: (api: GameApi) => boolean;
}

/**
 * Hilfsfunktion: Quest ist "echt offen" — aktiv und noch nicht erledigt.
 */
function open(active: boolean, resolved: boolean) {
  return active && !resolved;
}

/**
 * Quest-Inventar. Reihenfolge ist nur Lesbarkeits-Hilfe; Sortierung
 * erfolgt über `priority`. Beim Ergänzen neuer Akte: hier eintragen,
 * UI muss nicht angefasst werden.
 */
export const HINT_QUESTS: HintQuest[] = [
  // ── Akt I: Eröffnung ──────────────────────────────────────────────
  {
    id: "act1.callLeitstelle",
    title: "Das Klopfen aus 2615",
    priority: 10,
    isActive: (a) => a.hasFlag("knockingHeard") || a.hasFlag("doorbellRang"),
    isResolved: (a) => a.hasFlag("calledLeitstelle"),
    hints: [
      "Aus einer Wohnung in deinem Stockwerk dringen Geräusche, die nicht zum Tagesablauf passen.",
      "Such die Wohnung 2615 auf — und überlege, wer dafür zuständig ist, wenn du dort nicht selbst eingreifen kannst.",
      "Geh in die Wohnung 2613 (Philippe), nutze sein Sprechgerät und ruf die Leitstelle/Insa an, damit sie Sanitäter schickt.",
    ],
  },
  {
    id: "act1.paramedicsReport",
    title: "Sanitäter-Bericht aus 2615",
    priority: 11,
    isActive: (a) => a.hasFlag("paramedicsArrived"),
    isResolved: (a) => a.hasItem("paramedicsReport"),
    hints: [
      "Die Sanitäter waren da — irgendwo muss etwas Schriftliches zurückgeblieben sein.",
      "In Wohnung 2613 hat sich seit dem Einsatz etwas verändert. Schau dich dort gründlich um.",
      "Geh zurück nach 2613, sieh dir den Tisch / die Ablage genau an und nimm den Sanitäter-Bericht mit.",
    ],
  },

  // ── Akt I: Vollmacht B3 (Hauptpfad) ───────────────────────────────
  {
    id: "act1.b3Authorization",
    title: "Vollmacht B3 für Philippe",
    priority: 20,
    isActive: (a) => a.hasFlag("philippeAskedFavor"),
    isResolved: (a) =>
      a.hasFlag("gotB3Authorization") ||
      a.hasFlag("gotB3Ration") ||
      a.hasFlag("duelWon") ||
      a.hasFlag("refusedB3Favor"),
    hints: [
      "Philippe hat dich um etwas gebeten, das mit Verwaltung und einer Unterschrift zu tun hat.",
      "Die Vollmacht B3 wird in der Kantine 3602 ausgegeben. Es gibt mehrere Wege, sie zu bekommen — über Kowalk, über Brust, oder am Tresen vorbei.",
      "Geh in Kantine 3602, sprich Kowalk an und bring sie auf deine Seite — sie kann Brusts Ablehnung kippen, sodass du die Vollmacht erhältst.",
    ],
  },
  {
    id: "act1.bureaucracyDuel",
    title: "Brust am Tresen herausfordern",
    priority: 21,
    isActive: (a) =>
      a.hasFlag("philippeAskedFavor") &&
      a.hasFlag("metBrust") &&
      a.hasFlag("duelOffered"),
    isResolved: (a) =>
      a.hasFlag("duelWon") ||
      a.hasFlag("gotB3Authorization") ||
      a.hasFlag("gotB3Ration") ||
      a.hasFlag("refusedB3Favor"),
    hints: [
      "Brust gibt nicht klein bei — aber er liebt Paragraphen. Wer ihn in seinem eigenen Element schlägt, kommt durch.",
      "Es gibt Floskeln und Klauseln, die seine Argumente kontern. Die meisten stehen in deinem E67-Handbuch (§3.6) oder fallen im Smalltalk mit ihm und Helka.",
      "Lies Handbuch §3.6, sprich vorher mit Brust und Helka, dann fordere Brust am Tresen heraus und wähle in jeder Runde die formal korrekte Gegenfloskel.",
    ],
  },

  // ── Akt I: Quittung 4317 (Pflichträtsel) ──────────────────────────
  {
    id: "act1.quittung4317",
    title: "Tilla-Transfer / Quittung 4317",
    priority: 30,
    isActive: (a) => a.hasFlag("insaGaveTransferTask"),
    isResolved: (a) => a.hasItem("tillaTransfer"),
    hints: [
      "Insa hat dir einen Transferauftrag gegeben, dessen Code dir noch nichts sagt — frag jemanden, der die Akten kennt.",
      "Du brauchst eine korrekt aussehende Quittung 4317. Dafür sind drei Dinge nötig: ein Blanko, ein Siegelabdruck und ein passender Aushang als Vorlage.",
      "Drück mit dem Bleistift den Siegelabdruck ab, hol dir den Original-Aushang aus E71 und ein Quittungs-Blanko, kombiniere alles zur gefälschten Quittung 4317 und verschick sie via Rohrpost in der Kantine.",
    ],
  },
  {
    id: "act1.elevatorMaint",
    title: "Wartungssperre 4711 am Aufzug",
    priority: 40,
    isActive: (a) =>
      a.hasFlag("elevatorMaintBlocked") &&
      !a.hasFlag("elevatorMaintCleared"),
    isResolved: (a) => a.hasFlag("elevatorMaintCleared"),
    hints: [
      "Der Aufzug zeigt eine Wartungssperre — die wurde von jemandem im Haus gesetzt, nicht zentral.",
      "Nur ein Hausmeister-Account kann Sperre 4711 löschen. Bodo (2612) hat genau so einen Zugang.",
      "Warte, bis Bodo die Wohnung verlässt, geh an sein Terminal in 2612 und entferne dort die Wartungssperre 4711.",
    ],
  },

  // ── Akt I: Mira ───────────────────────────────────────────────────
  {
    id: "act1.miraTrust",
    title: "Miras Vertrauen gewinnen",
    priority: 50,
    isActive: (a) => a.hasFlag("metMira"),
    isResolved: (a) =>
      a.hasFlag("miraTrustEarned") || a.hasFlag("miraTrustWithheld"),
    hints: [
      "Mira testet dich, ohne es zu sagen. Es geht weniger darum, was du tust, sondern was du dabei abschaltest.",
      "Sie hat dir ein Manifest dagelassen. Lies es — und überlege, was es bedeuten würde, das Schmerz-Radio bewusst stummzuschalten.",
      "Lies Miras Manifest in deinem Inventar, schalte das Radio im Radio-Panel aus und lass es mindestens eine Minute aus, bevor du sie wieder aufsuchst.",
    ],
  },

  // ── Akt I: Knoten 5610 ────────────────────────────────────────────
  {
    id: "act1.serverRoom5610",
    title: "Knoten 5610 (Wartungsraum)",
    priority: 60,
    isActive: (a) =>
      a.hasFlag("insaSentTo5610") && !a.hasFlag("burnedNode5610"),
    isResolved: (a) => a.hasFlag("burnedNode5610") || a.hasFlag("tappedNode5610"),
    hints: [
      "Insa hat dich zu einem Wartungsknoten geschickt — das Schloss erkennt Wartungsrechte, nicht nur Karten.",
      "Tür 5610 liegt im Korridor 56. Insa kann den Magnetriegel von der Leitstelle aus freischalten, wenn du sie drum bittest.",
      "Geh ins Korridor 56, ruf Insa an und bitte um den Wartungs-Override für 5610, geh dann hinein und tippe den Knoten an (oder brenne ihn — beides bringt dich weiter).",
    ],
  },

  // ── Akt I: Sektor verlassen ───────────────────────────────────────
  {
    id: "act1.sectorDoor",
    title: "Sektor E67 verlassen",
    priority: 70,
    isActive: (a) => a.hasItem("residentId") && !a.hasFlag("sectorDoorOpen"),
    isResolved: (a) => a.hasFlag("sectorDoorOpen"),
    hints: [
      "Die Sektor-Tür braucht zwei Dinge: etwas, das dich identifiziert — und einen Code, der heute gilt.",
      "Den 8-stelligen Tagescode bekommst du nicht zentral. Er steckt in einer Nachricht, die heute gesendet wurde, und du brauchst Insas Hilfe.",
      "Halte deinen Bewohner-Ausweis bereit, ruf Insa an und bitte um den heutigen Sektor-Code, dann gib ihn an der Schleuse ein.",
    ],
  },
];

/**
 * Liefert alle gerade offenen Quests, sortiert nach `priority` (aufsteigend).
 */
export function getActiveHints(api: GameApi): HintQuest[] {
  return HINT_QUESTS.filter((q) => open(q.isActive(api), q.isResolved(api))).sort(
    (a, b) => a.priority - b.priority,
  );
}

/**
 * UI-Texte für das Tipps-Tab. Zentral, damit später in einem Schritt
 * übersetzt werden kann.
 */
export const HINTS_UI_TEXT = {
  tabHints: "Tipps",
  tabCheatsheet: "Spickzettel",
  spoilerWarning:
    "Achtung: Die folgenden Hinweise enthalten Lösungsschritte. Lies sie nur, wenn du wirklich nicht weiterkommst.",
  noOpenQuests:
    "Du hast gerade keine offene Aufgabe, zu der ich dir einen Tipp geben könnte. Schau dich um, sprich mit Leuten und lies das Handbuch.",
  questPickerLabel: "Aktuelle Aufgabe",
  hintLevelLabel: (level: 1 | 2 | 3) =>
    level === 1 ? "Hinweis 1 — Andeutung"
    : level === 2 ? "Hinweis 2 — Richtung"
    : "Hinweis 3 — Lösung",
  revealNext: "Nächsten Tipp anzeigen",
  allRevealed: "Du hast alle drei Tipps zu dieser Aufgabe gesehen.",
  reset: "Tipps zurücksetzen",
  introHint:
    "Wähle eine Aufgabe und enthülle Schritt für Schritt mehr — nur so weit du musst.",
};
