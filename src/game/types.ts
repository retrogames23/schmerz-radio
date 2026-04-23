export type SceneId =
  | "apartment"
  | "hallway"
  | "philippe"
  | "sectorDoor"
  | "elevatorEnd"
  | "e71Lobby"
  | "corridor15"
  | "room1534";

export type InventoryItemId =
  | "protocol"
  | "exitCode"
  | "b3sample"
  | "tuningCrystal"
  | "mikaelLetter";

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
  | "calledLeitstelle"
  | "protocolReceived"
  | "calledForCode"
  | "sectorDoorOpen"
  | "elevatorTaken"
  | "enteredE71"
  | "metReceptionist"
  | "foundRoom1534"
  | "metMikael"
  | "heardMikaelTruth"
  | "tookCrystal"
  | "readLetter"
  | "insa3Called"
  | "ending";

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
  onUse: (api: GameApi) => void;
}

export interface Scene {
  id: SceneId;
  background: string;
  title: string;
  intro?: string;
  hotspots: Hotspot[];
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
    | "RECEPTION";
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
}