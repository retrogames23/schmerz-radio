/**
 * Deklarativer kritischer Pfad von Akt I bis zum Einstieg in Akt II.
 *
 * Diese Datei ist die EINE Wahrheit darüber, wie die Rätselkette gedacht
 * ist. Sie wird nicht vom Spiel gelesen, sondern von den Prüfskripten
 * (`bun run quest:solve`):
 *
 *  - Ebene 1: Ist die Kette in sich schlüssig? Jeder Schritt muss seine
 *    Vorbedingungen aus früheren Schritten (oder aus `externalSteps`)
 *    beziehen können.
 *  - Ebene 2: Der Simulator prüft, ob der Zielzustand `act2Started`
 *    aus dem leeren Spielstand heraus tatsächlich erreichbar ist.
 *  - Ebene 3: Alles, was erreichbar ist, aber weder auf dem kritischen
 *    Pfad liegt noch auf ihn einzahlt, landet im Ballast-Report — außer
 *    es steht in `atmosphereWhitelist`.
 */

import type { InventoryItemId, StoryFlag } from "./types";

export interface QuestStep {
  /** Stabile ID, z. B. "act1.phoneBroken". */
  id: string;
  /** Ein Satz: was passiert hier? */
  title: string;
  /** Schauplatz (Szenen-ID oder sprechender Ort). */
  ort: string;
  /** Wer ist beteiligt (NPC-ID oder "—"). */
  wer: string;
  /** Vorbedingungen (Flags und/oder Items). */
  braucht: { flags?: StoryFlag[]; items?: InventoryItemId[] };
  /** Ergebnis des Schritts. */
  gibt: { flags?: StoryFlag[]; items?: InventoryItemId[] };
  /** true = Nebenpfad, darf im Ballast-Report nicht als Fehler zählen. */
  optional?: boolean;
}

/**
 * Zustandsübergänge, die NICHT in Szenen- oder Dialog-Code stehen,
 * sondern in UI-Komponenten, Cutscenes oder Minispielen (Keypad,
 * Bürokratie-Duell, Ending-Screen, Terminal-Kommandos). Der Simulator
 * kann diese Komponenten nicht rendern und wendet stattdessen diese
 * Regeln an.
 *
 * `variant` steuert Sieg-/Niederlage-Läufe:
 *  - "both"  → gilt in beiden Läufen
 *  - "win"   → nur im Sieg-Lauf (Spieler gewinnt Minispiele)
 *  - "lose"  → nur im Niederlage-Lauf
 */
export interface ExternalStep {
  id: string;
  quelle: string;
  braucht: { flags?: StoryFlag[]; items?: InventoryItemId[] };
  gibt: { flags?: StoryFlag[]; items?: InventoryItemId[] };
  variant?: "both" | "win" | "lose";
}

/** Zielzustand: ab hier läuft Akt II. */
export const GOAL_FLAG: StoryFlag = "act2Started";

export const criticalPath: QuestStep[] = [
  {
    id: "act1.doorbell",
    title: "Klopfen aus 2615 — Layard wird auf den Nachbarn aufmerksam",
    ort: "apartment",
    wer: "—",
    braucht: {},
    gibt: { flags: ["knockingHeard"] },
  },
  {
    id: "act1.philippe2613",
    title: "Philippe im Flur bestätigt das Klopfen",
    ort: "corridor26",
    wer: "philippe",
    braucht: { flags: ["knockingHeard"] },
    gibt: { flags: ["metPhilippe", "talkedPhilippe2613"] },
  },
  {
    id: "act1.callLeitstelle",
    title: "Leitstelle anrufen, Vorfall melden",
    ort: "apartment",
    wer: "insa",
    braucht: { flags: ["talkedPhilippe2613"] },
    gibt: { flags: ["calledLeitstelle"] },
  },
  {
    id: "act1.paramedics",
    title: "Sanitäter brechen 2615 auf",
    ort: "corridor26",
    wer: "—",
    braucht: { flags: ["calledLeitstelle"] },
    gibt: { flags: ["paramedicsArrived", "doorBrokenOpen"] },
  },
  {
    id: "act1.protocol",
    title: "Layard erhält das Protokoll zum Vorfall",
    ort: "corridor26",
    wer: "insa",
    braucht: { flags: ["paramedicsArrived"] },
    gibt: { flags: ["protocolReceived"] },
  },
  {
    id: "act1.phoneBroken",
    title: "Der Apparat in 2611 stirbt — nur noch Sirren",
    ort: "apartment",
    wer: "—",
    braucht: { flags: ["protocolReceived"] },
    gibt: { flags: ["phoneBroken"] },
  },
  {
    id: "act1.miraRepair",
    title: "Störung bei der Etagenwartung melden — Mira repariert und meldet den Datenport um",
    ort: "corridor46",
    wer: "mira",
    braucht: { flags: ["phoneBroken"] },
    gibt: { flags: ["miraRepairDone", "phoneRepaired", "port2611Locked"] },
  },
  {
    id: "act1.insaToKowalk",
    title: "Insa vermittelt an Kowalk/Vossbeck",
    ort: "apartment",
    wer: "insa",
    braucht: { flags: ["phoneRepaired"] },
    gibt: { flags: ["insaSentToKowalkForCode", "knowsVossbeckPath"] },
  },
  {
    id: "act1.formblatt",
    title: "Formblatt 17/V beschaffen (Brust-Training bzw. Kowalk)",
    ort: "kantine3602",
    wer: "kowalk/brust",
    braucht: { flags: ["knowsVossbeckPath"] },
    gibt: { flags: ["gotFormblatt17V"], items: ["formblatt17V"] },
  },
  {
    id: "act1.duel",
    title: "Bürokratie-Endduell gegen Vossbeck",
    ort: "kantinenverwaltung3603",
    wer: "vossbeck",
    braucht: { items: ["formblatt17V"] },
    gibt: { flags: ["duelEndgameWon", "vossbeckGaveCode", "calledForCode"] },
  },
  {
    id: "act1.miraAccess",
    title: "Zugang zu Miras Maschine — Vertrauenspfad oder Heizungspfad",
    ort: "apt4601",
    wer: "mira",
    braucht: { flags: ["port2611Locked"] },
    gibt: { flags: ["miraTerminalUnlocked"] },
  },
  {
    id: "act1.tagescode",
    title: "Tagescode im Verteiler der Leitstelle lesen",
    ort: "apt4601",
    wer: "—",
    braucht: { flags: ["miraTerminalUnlocked", "calledForCode"] },
    gibt: { flags: ["readTagescodeViaMira"] },
  },
  {
    id: "act1.lobbyGate",
    title: "Lobby-Schleuse E67 mit Bewohner-Code passieren",
    ort: "lobbyE67",
    wer: "—",
    braucht: { flags: ["protocolReceived"], items: ["residentId"] },
    gibt: { flags: ["lobbyClearedDay"] },
  },
  {
    id: "act1.sectorDoor",
    title: "Sektor-Schleuse E67 → E71 öffnen",
    ort: "sectorDoor",
    wer: "—",
    braucht: {
      flags: ["readTagescodeViaMira", "lobbyClearedDay"],
      items: ["residentId"],
    },
    gibt: { flags: ["sectorDoorOpen"] },
  },
  {
    id: "act1.toAct2",
    title: "Ending-Screen Akt I → Akt II beginnen",
    ort: "—",
    wer: "—",
    braucht: { flags: ["sectorDoorOpen"] },
    gibt: { flags: ["act2Started"] },
  },
  {
    id: "act1.miraTrustPath",
    title:
      "Vertrauenspfad: drei Resonanz-Hygiene-Aushänge einsammeln und bei Mira abliefern (Alternative zum Heizungspfad für miraTerminalUnlocked)",
    ort: "elevatorE67 / corridor46 / communalE67 → apt4601",
    wer: "mira",
    braucht: { flags: ["miraAskedEvidence"] },
    gibt: {
      flags: [
        "belegAushangAufzug",
        "belegAushangKorridor46",
        "belegAushangGemeinschaftsraum",
        "miraEvidenceDelivered",
      ],
    },
    optional: true,
  },
];

export const externalSteps: ExternalStep[] = [
  {
    id: "ext.lobbyGate",
    quelle: "src/components/game/LobbyGate.tsx",
    braucht: { flags: ["protocolReceived"], items: ["residentId"] },
    gibt: { flags: ["lobbyClearedDay"] },
  },
  {
    id: "ext.keypadSector",
    quelle: "src/components/game/Keypad.tsx",
    braucht: { flags: ["readTagescodeViaMira"], items: ["residentId"] },
    gibt: { flags: ["sectorDoorOpen"] },
  },
  {
    id: "ext.terminalTagescode",
    quelle: "src/components/game/Terminal.tsx (telnet leitstelle.e67)",
    braucht: { flags: ["miraTerminalUnlocked", "calledForCode"] },
    gibt: { flags: ["readTagescodeViaMira"] },
  },
  {
    id: "ext.endingToAct2",
    quelle: "src/components/game/Ending.tsx",
    braucht: { flags: ["sectorDoorOpen"] },
    gibt: { flags: ["act2Started"] },
  },
  {
    id: "ext.duelTraining",
    quelle: "src/game/bureaucracyDuel.ts (Trainingsfälle bei Brust)",
    braucht: { flags: ["metBrust"] },
    gibt: {
      flags: ["duelTrainingWon1", "duelTrainingWon2", "duelTrainingWon3", "vossbeckSummoned"],
    },
    variant: "win",
  },
  {
    id: "ext.duelEndgameWin",
    quelle: "src/game/bureaucracyDuel.ts (Endduell)",
    braucht: { flags: ["duelStarted"] },
    gibt: { flags: ["duelJustWon"] },
    variant: "win",
  },
  {
    id: "ext.duelEndgameLose",
    quelle: "src/game/bureaucracyDuel.ts (Endduell verloren)",
    braucht: { flags: ["duelStarted"] },
    gibt: { flags: ["vossbeckAttempt1Lost"] },
    variant: "lose",
  },
  {
    id: "ext.radioTuning",
    quelle: "src/components/game/RadioPanel.tsx (104,6 volle Lautstärke)",
    braucht: {},
    gibt: { flags: ["radioTunedTo1046", "doorbellRang"] },
  },
  {
    id: "ext.radioMute",
    quelle: "src/components/game/RadioPanel.tsx (Radio 60 s aus)",
    braucht: { flags: ["radioTunedTo1046"] },
    gibt: { flags: ["radioMutedAtLeast60s"] },
  },
  {
    id: "ext.miraEvidenceAsk",
    quelle:
      "src/game/dialogs/mira.ts (miraEvidenceAsk — Mira bittet um die drei Aushänge)",
    braucht: {},
    gibt: { flags: ["miraAskedEvidence"] },
  },
  {
    id: "ext.paramedicsCutscene",
    quelle: "src/components/game/ParamedicsCutscene.tsx",
    braucht: { flags: ["paramedicsArrived"] },
    gibt: {
      flags: [
        "paramedicsCutsceneSeen",
        "doorBrokenOpen",
        "protocolReceived",
        "elevatorMaintBlocked",
      ],
    },
  },
];

/**
 * Bewusst optionale Inhalte: Atmosphäre, Weltbau, Lesestoff, Minispiele.
 * Sie tauchen im Ballast-Report als „gewollt“ auf und lösen keinen Fehler
 * aus. Präfix-Match auf Flag-Namen.
 */
export const atmosphereWhitelist: string[] = [
  "dsa",
  "herbert",
  "hbFakt",
  "setsuko",
  "walter",
  "hanne",
  "ralf",
  "okwu",
  "helka",
  "e71Quiz",
  "e71Nerd",
  "marv",
  "tjark",
  "philippeNote",
  "philippeThema",
  "gfa",
  "opened",
  "took",
  "showed",
  "read",
  "saw",
  "met",
  "talked",
  "asked",
  "knows",
  "heard",
  "learned",
  "lotti",
  "cinema",
  "bodo",
  "ennis",
  "mira",
  "kowalk",
  "vossbeck",
  "zvs",
  "sasse",
  "act2",
  "insa",
  "duel",
  "brust",
];

/**
 * Items, die der Spielstand von Beginn an enthält (siehe GameContext).
 */
export const startItems: InventoryItemId[] = ["residentId"];
