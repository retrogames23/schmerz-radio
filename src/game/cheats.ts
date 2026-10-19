/**
 * Debug-Cheats. Werden ausschließlich über Layards Terminal ausgelöst
 * (siehe `Terminal.tsx`) und sind nirgends dokumentiert.
 */

import type { GameApi, StoryFlag } from "./types";

/**
 * »vossbeckweak« — katapultiert den Spielstand exakt an die Stelle, an der
 * das Bürokratie-Endduell gegen Vossbeck gewonnen wurde: alle dafür
 * zwingend nötigen Flags sind gesetzt, alle optionalen (Mira-Vertrauen,
 * Ralf, MARV, DSA-Runde, Fälschungs-Route, Burn-Route, E71-Nebenstränge)
 * bleiben offen. Layard steht danach an der Quadrantenschleuse.
 */
const VOSSBECK_WEAK_FLAGS: StoryFlag[] = [
  // Auftakt: Protokoll-Kette 2613 / 2615
  "doorbellRang",
  "metPhilippe",
  "metPhilippeBefore",
  "knockingHeard",
  "talkedPhilippe2613",
  "calledLeitstelle",
  "paramedicsArrived",
  "paramedicsCutsceneSeen",
  "doorBrokenOpen",
  "protocolReceived",
  // Aufzug + Wartungssperre 4711
  "metBodo",
  "elevatorMaintBlocked",
  "elevatorMaintSeen",
  "elevatorMaintCleared",
  // Leeres Büro, Insa, Lobby-Schleuse
  "sawEmptyOffice",
  "rangEmptyOfficeBell",
  "calledInsa2",
  "lobbyClearedDay",
  "insaSentToKowalkForCode",
  // Pflicht-Rätsel „kaputtes Telefon" (Mira / Etagenwartung)
  // `phoneBroken`/`reportedPhoneFault` bewusst NICHT setzen: Layard muss
  // den toten Apparat erst selbst abheben, sonst spricht er Nachbarn auf
  // ein Telefon an, über das im Spiel noch nie die Rede war.
  "metMira",
  "miraAtHomeMet",
  // Knoten 5610
  "saw5610Door",
  "serverRoom5610Open",
  "tappedNode5610",
  // Kantine: Kowalk, Brust, Weg zu Vossbeck
  "metKowalk",
  "metBrust",
  "knowsVossbeckPath",
  // Bürokratie-Duell: Training + Formblatt 17/V
  "duelStarted",
  "vossbeckSummoned",
  "gotFormblatt17V",
  // Endduell gegen Vossbeck gewonnen → Schleusen-Code liegt im Terminal
  "metVossbeck",
  "duelEndgameWon",
  "vossbeckGaveCode",
  "calledForCode",
];

export function applyVossbeckWeakCheat(api: GameApi): void {
  VOSSBECK_WEAK_FLAGS.forEach((f) => api.setFlag(f));
  // Transiente Duell-Zustände sauber zurücksetzen.
  api.clearFlag("duelJustWon");
  api.resetDuelHits();
  api.goTo("sectorDoor");
}

/**
 * »endeakt1« — Spielstand direkt nach dem Besuch bei Mikael Stegmann:
 * Layard war in Zimmer 1534, Stegmann hat das Protokoll NICHT
 * entgegengenommen. Alle dafür zwingend nötigen Flags sind gesetzt,
 * alle optionalen Nebenstränge (Mira-Vertrauen, Ralf, MARV, Okwu,
 * Gemeinschaftsraum, Burn-Route, Insa-Rückruf, Ende) bleiben offen.
 * Layard steht danach auf der Etage mit Korridor 15 (Zimmer 1534).
 */
const ENDE_AKT1_FLAGS: StoryFlag[] = [
  ...VOSSBECK_WEAK_FLAGS,
  // Quadrantenschleuse geöffnet, Schwelle überschritten
  "sectorDoorOpen",
  "sectorThresholdSeen",
  // Gebäude E71: Empfang, Korridor, Zimmer 1534
  "enteredE71",
  "metReceptionist",
  "metMikael",
  "heardMikaelTruth",
  "mikaelRejectedProtocol",
];

export function applyEndeAkt1Cheat(api: GameApi): void {
  ENDE_AKT1_FLAGS.forEach((f) => api.setFlag(f));
  api.clearFlag("duelJustWon");
  api.resetDuelHits();
  api.goTo("corridor15");
}

/**
 * »broken« — Spielstand genau an der Stelle, an der Layards Apparat
 * stirbt: Prolog + Aufzug + leeres Büro sind erledigt, das Telefon ist
 * kaputt (`phoneBroken`), die Störung aber noch nicht gemeldet. Layard
 * steht in seiner Wohnung und muss zu Mira (Korridor 46, Tür 4601).
 */
const PHONE_BROKEN_FLAGS: StoryFlag[] = [
  "doorbellRang",
  "metPhilippe",
  "metPhilippeBefore",
  "knockingHeard",
  "talkedPhilippe2613",
  "calledLeitstelle",
  "paramedicsArrived",
  "paramedicsCutsceneSeen",
  "doorBrokenOpen",
  "protocolReceived",
  "metBodo",
  "elevatorMaintBlocked",
  "elevatorMaintSeen",
  "elevatorMaintCleared",
  "sawEmptyOffice",
  "rangEmptyOfficeBell",
  // Der Apparat ist tot — Meldung an die Wartung steht noch aus.
  "phoneBroken",
];

export function applyPhoneBrokenCheat(api: GameApi): void {
  PHONE_BROKEN_FLAGS.forEach((f) => api.setFlag(f));
  api.goTo("apartment");
}
