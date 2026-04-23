export type SceneId =
  | "apartment"
  | "hallway"
  | "sectorDoor"
  | "e71Lobby"
  | "corridor15"
  | "room1534"
  | "apt2613"
  | "apt2615"
  | "apt2612"
  | "elevator"
  | "floor1Lobby"
  | "passage"
  | "corridor36"
  | "corridor46"
  | "corridor56";

export type InventoryItemId =
  | "protocol"
  | "exitCode"
  | "b3sample"
  | "tuningCrystal"
  | "mikaelLetter"
  | "flyer";

export type KnowledgeFlag =
  | "freq1046"
  | "resonanceTerm"
  | "responsibilityE67"
  | "radioOrigin"
  | "leitstelleListens"
  | "frequencyControl"
  | "insaScreened";

export type StoryFlag =
  | "radioTunedTo1046"
  | "doorbellRang"
  | "metPhilippe"
  | "metPhilippeBefore"
  | "knockingHeard"
  | "talkedPhilippe2613"
  | "calledLeitstelle"
  | "smalltalkPhilippe"
  | "paramedicsArrived"
  // Pro Besuch in Wohnung 2613 nach dem Anruf: zwei Warte-Klicks.
  // Werden beim Betreten von 2613 zurückgesetzt.
  | "wait2613Step1"
  | "wait2613Step2"
  | "doorBrokenOpen"
  | "sawCatatonic"
  | "protocolReceived"
  | "calledInsa2"
  | "reportedExit"
  | "skippedExitReport"
  | "calledStegmann"
  | "calledForCode"
  | "centralOsUpdated"
  | "troubleReported"
  | "sectorDoorOpen"
  | "feetWontMove"
  | "elevatorTaken"
  | "enteredE71"
  | "metReceptionist"
  | "foundRoom1534"
  | "metMikael"
  | "heardMikaelTruth"
  | "tookCrystal"
  | "readLetter"
  | "insa3Called"
  | "ending"
  | "sawEmptyOffice"
  | "rangEmptyOfficeBell"
  | "metMira"
  | "miraOpenness"
  | "tookFlyer"
  | "hackedPhilippe"
  | "talkedPhilippeAfter"
  | "philippeNote1"
  | "philippeNote2"
  | "philippeNote3"
  | "philippeNote4"
  | "philippeNote5"
  | "philippeProbe1"
  | "philippeProbe2"
  | "philippeProbe3"
  | "philippeProbe4"
  | "philippeProbe5"
  | "philippeProbeNote1"
  | "philippeProbeNote2"
  | "philippeProbeNote3"
  | "philippeProbeNote4"
  | "philippeProbeNote5"
  // Helka Vint (2610) — Türgespräch
  | "metHelka"
  | "talkedHelka2"
  | "talkedHelka3"
  | "helkaWarned"
  | "helkaSawFlyer"
  // Bodo Marschke (2612) — begehbare Wohnung
  | "metBodo"
  | "talkedBodo2"
  | "knowsLotti"
  | "bodoToldCarrierTruth"
  | "bodoSawFlyer"
  // Bodo verlässt für 15 Min die Wohnung, damit Layard ans Terminal kommt
  | "bodoLeftForB3"
  | "bodoBackAfterB3"
  | "bodoNoticedIntrusion"
  // Zweiter Anlauf: Bodo geht ein weiteres Mal los (Lotti-Wasser-Argument).
  | "bodoLeftForB3Twice"
  | "bodoBackAfterB3Twice"
  // Dritter Anlauf existiert nicht: stattdessen storniert Bodo die Sperre
  // selbst, sobald er bemerkt, dass Layard nichts unternommen hat.
  | "bodoSelfCanceledMaint"
  // Ennis Korr (2614) — Türgespräch
  | "metEnnis"
  | "talkedEnnis2"
  | "ennisCracked"
  | "ennisSawFlyer"
  // Akt 1, Erweiterung: defekter Aufzug nach Protokoll-Übergabe.
  // Anfangs setzt das System (post-protocolReceived) eine Wartungssperre
  // 4711, die nur über Bodos Hausmeister-Account gelöscht werden kann.
  | "elevatorMaintBlocked"
  | "elevatorMaintSeen"
  | "elevatorMaintCleared"
  // Ennis: Layard zitiert Helka & Bodo → Ennis öffnet ohne Flyer.
  | "ennisOpenedOnQuote"
  // Insas Rückruf-Code: ein verpasster Anruf landet bei Stegmann.
  | "insaCallbackPending"
  | "insaCallbackTaken"
  | "insaCallbackMissed";

export interface InventoryItem {
  id: InventoryItemId;
  name: string;
  description: string;
}

export interface Hotspot {
  id: string;
  /** % positions on background image */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** required flags before this hotspot is active */
  requires?: StoryFlag[];
  /** hide once these flags are present */
  hiddenWhen?: StoryFlag[];
  /** custom visibility predicate, evaluated after requires/hiddenWhen */
  visible?: (api: GameApi) => boolean;
  onUse: (api: GameApi) => void;
}

export interface Scene {
  id: SceneId;
  /**
   * Hintergrundbild der Szene. Entweder ein statischer Pfad oder eine
   * Funktion, die abhängig vom Spielzustand das passende Bild liefert
   * (z.B. „Bodo im Sessel“ vs. „leerer Sessel“).
   */
  background: string | ((api: GameApi) => string);
  title: string;
  intro?: string;
  hotspots: Hotspot[];
  /** Optional sichtbare Figuren / Sprites, die über dem Hintergrund liegen. */
  npcs?: NpcSprite[];
}

export interface NpcSprite {
  id: string;
  src: string;
  /** % positions on background image (top-left anchor of the sprite box) */
  x: number;
  y: number;
  /** width as % of the scene */
  w: number;
  /** height as % of the scene */
  h: number;
  alt: string;
  requires?: StoryFlag[];
  hiddenWhen?: StoryFlag[];
  /** custom visibility predicate (e.g. nur auf Miras Etage anzeigen) */
  visible?: (api: GameApi) => boolean;
}

export interface DialogChoice {
  text: string;
  next?: string;
  action?: (api: GameApi) => void;
  requires?: StoryFlag[];
  hiddenWhen?: StoryFlag[];
  /** show only when radio is active */
  requiresRadio?: boolean;
}

export interface DialogLine {
  id: string;
  speaker:
    | "LAYARD"
    | "INSA"
    | "PHILIPPE"
    | "SANITÄTER"
    | "SYSTEM"
    | "RADIO"
    | "MIKAEL"
    | "RECEPTION"
    | "MIRA"
    | "BODO";
  text: string;
  /** subtext appears only when Schmerz-Radio active */
  subtext?: string;
  next?: string;
  choices?: DialogChoice[];
  /** auto-end dialog */
  end?: boolean;
  /** Skip this line entirely if any required flag is missing (jumps to `next`). */
  requires?: StoryFlag[];
  /** Skip this line entirely if any of these flags is set (jumps to `next`). */
  hiddenWhen?: StoryFlag[];
}

export interface DialogTree {
  id: string;
  start: string;
  lines: Record<string, DialogLine>;
  /** Optional callback fired exactly once when the dialog tree closes. */
  onEnd?: (api: GameApi) => void;
}

export interface GameApi {
  goTo: (scene: SceneId) => void;
  setFlag: (flag: StoryFlag) => void;
  clearFlag: (flag: StoryFlag) => void;
  hasFlag: (flag: StoryFlag) => boolean;
  setKnowledge: (k: KnowledgeFlag) => void;
  hasKnowledge: (k: KnowledgeFlag) => boolean;
  addItem: (item: InventoryItem) => void;
  hasItem: (id: InventoryItemId) => boolean;
  showText: (lines: string[], onClose?: () => void) => void;
  startDialog: (id: string) => void;
  openTerminal: (asBodo?: boolean) => void;
  openRadio: () => void;
  openKeypad: () => void;
  isRadioActive: () => boolean;
  setEnding: () => void;
  /** Floor (3, 4 or 5) where Mira appears this run; assigned lazily. */
  getMiraFloor: () => 3 | 4 | 5;
}