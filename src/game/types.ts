export type SceneId =
  | "apartment"
  | "hallway"
  | "philippe"
  | "sectorDoor"
  | "elevatorEnd"
  | "e71Lobby"
  | "corridor15"
  | "room1534"
  | "apt2613"
  | "apt2615"
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
  | "insaWaiting"
  | "gatewayMaintenance"
  | "dateHint"
  | "radioOrigin"
  | "leitstelleListens"
  | "frequencyControl";

export type StoryFlag =
  | "radioTunedTo1046"
  | "doorbellRang"
  | "metPhilippe"
  | "enteredApt2613"
  | "knockingHeard"
  | "talkedPhilippe2613"
  | "calledLeitstelle"
  | "smalltalkPhilippe"
  | "paramedicsArrived"
  | "doorBrokenOpen"
  | "sawCatatonic"
  | "protocolReceived"
  | "readProtocol"
  | "calledInsa2"
  | "calledStegmann"
  | "centralOsUpdated"
  | "gatewayReported"
  | "calledForCode"
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
  | "hackedPhilippe";

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
  background: string;
  title: string;
  intro?: string;
  hotspots: Hotspot[];
  /** Optional pixel-style door number plates rendered as overlays. */
  doorPlates?: DoorPlate[];
}

export interface DoorPlate {
  id: string;
  /** % positions on background image (top-center anchor) */
  x: number;
  y: number;
  w: number;
  label: string;
  requires?: StoryFlag[];
  hiddenWhen?: StoryFlag[];
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
    | "MIRA";
  text: string;
  /** subtext appears only when Schmerz-Radio active */
  subtext?: string;
  next?: string;
  choices?: DialogChoice[];
  /** auto-end dialog */
  end?: boolean;
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
  hasFlag: (flag: StoryFlag) => boolean;
  setKnowledge: (k: KnowledgeFlag) => void;
  hasKnowledge: (k: KnowledgeFlag) => boolean;
  addItem: (item: InventoryItem) => void;
  hasItem: (id: InventoryItemId) => boolean;
  showText: (lines: string[]) => void;
  startDialog: (id: string) => void;
  openTerminal: () => void;
  openRadio: () => void;
  isRadioActive: () => boolean;
  setEnding: () => void;
  /** Floor (3, 4 or 5) where Mira appears this run; assigned lazily. */
  getMiraFloor: () => 3 | 4 | 5;
}