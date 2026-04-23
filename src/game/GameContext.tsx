import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dialogs } from "./dialogs";
import { scenes } from "./scenes";
import type {
  GameApi,
  InventoryItem,
  InventoryItemId,
  KnowledgeFlag,
  SceneId,
  StoryFlag,
} from "./types";

interface GameState {
  scene: SceneId;
  flags: Set<StoryFlag>;
  knowledge: Set<KnowledgeFlag>;
  inventory: InventoryItem[];
  caption: string | null;
  textOverlay: string[] | null;
  dialogId: string | null;
  dialogLineId: string | null;
  radioOpen: boolean;
  terminalOpen: boolean;
  radioActive: boolean; // tuned to 104.6, providing subtext
  resonance: number; // 0–100
  ending: boolean;
}

interface GameContextValue extends GameState {
  api: GameApi;
  setCaption: (s: string | null) => void;
  closeText: () => void;
  advanceDialog: (nextId?: string) => void;
  closeDialog: () => void;
  closeRadio: () => void;
  closeTerminal: () => void;
  setRadioActive: (active: boolean) => void;
  bumpResonance: (delta: number) => void;
  resetResonance: () => void;
  saveGame: (slot: number) => SaveSummary;
  loadGame: (slot: number) => boolean;
  listSaves: () => Array<SaveSummary | null>;
  deleteSave: (slot: number) => void;
}

export interface SaveSummary {
  slot: number;
  scene: SceneId;
  savedAt: string; // ISO
  flagCount: number;
  inventoryCount: number;
}

const SAVE_PREFIX = "schmerz-radio.save.v1.";
const NUM_SLOTS = 3;

interface PersistedState {
  scene: SceneId;
  flags: StoryFlag[];
  knowledge: KnowledgeFlag[];
  inventory: InventoryItem[];
  resonance: number;
  ending: boolean;
  savedAt: string;
  miraFloor?: 3 | 4 | 5 | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [scene, setScene] = useState<SceneId>("apartment");
  const [flags, setFlags] = useState<Set<StoryFlag>>(() => new Set());
  const [knowledge, setKnowledge] = useState<Set<KnowledgeFlag>>(
    () => new Set(),
  );
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [caption, setCaption] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState<string[] | null>(null);
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [dialogLineId, setDialogLineId] = useState<string | null>(null);
  const [radioOpen, setRadioOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [radioActive, setRadioActive] = useState(false);
  const [resonance, setResonance] = useState(0);
  const [ending, setEnding] = useState(false);
  // Floor (3, 4 or 5) where Mira appears this run. Lazily picked on first read.
  const miraFloorRef = useRef<3 | 4 | 5 | null>(null);

  // Keep latest values in refs so api callbacks remain stable
  const flagsRef = useRef(flags);
  flagsRef.current = flags;
  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;
  const knowledgeRef = useRef(knowledge);
  knowledgeRef.current = knowledge;
  const radioActiveRef = useRef(radioActive);
  radioActiveRef.current = radioActive;
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const resonanceRef = useRef(resonance);
  resonanceRef.current = resonance;
  const endingRef = useRef(ending);
  endingRef.current = ending;

  const api = useMemo<GameApi>(
    () => ({
      goTo: (s) => {
        setScene(s);
        setCaption(null);
      },
      setFlag: (f) =>
        setFlags((prev) => {
          if (prev.has(f)) return prev;
          const n = new Set(prev);
          n.add(f);
          return n;
        }),
      hasFlag: (f) => flagsRef.current.has(f),
      setKnowledge: (k) =>
        setKnowledge((prev) => {
          if (prev.has(k)) return prev;
          const n = new Set(prev);
          n.add(k);
          return n;
        }),
      hasKnowledge: (k) => knowledgeRef.current.has(k),
      addItem: (item) =>
        setInventory((prev) =>
          prev.find((i) => i.id === item.id) ? prev : [...prev, item],
        ),
      hasItem: (id: InventoryItemId) =>
        inventoryRef.current.some((i) => i.id === id),
      showText: (lines) => setTextOverlay(lines),
      startDialog: (id) => {
        const tree = dialogs[id];
        if (!tree) return;
        setDialogId(id);
        setDialogLineId(tree.start);
      },
      openTerminal: () => setTerminalOpen(true),
      openRadio: () => setRadioOpen(true),
      isRadioActive: () => radioActiveRef.current,
      setEnding: () => setEnding(true),
      getMiraFloor: () => {
        if (miraFloorRef.current === null) {
          const pool: Array<3 | 4 | 5> = [3, 4, 5];
          miraFloorRef.current = pool[Math.floor(Math.random() * pool.length)];
        }
        return miraFloorRef.current;
      },
    }),
    [],
  );

  const advanceDialog = useCallback(
    (nextId?: string) => {
      if (!dialogId) return;
      const tree = dialogs[dialogId];
      if (!tree) return;
      if (!nextId) {
        // auto-advance from current
        const current = dialogLineId ? tree.lines[dialogLineId] : null;
        if (!current) return;
        if (current.end || !current.next) {
          setDialogId(null);
          setDialogLineId(null);
          tree.onEnd?.(api);
          return;
        }
        setDialogLineId(current.next);
        return;
      }
      const nextLine = tree.lines[nextId];
      if (!nextLine) {
        setDialogId(null);
        setDialogLineId(null);
        tree.onEnd?.(api);
        return;
      }
      setDialogLineId(nextId);
    },
    [dialogId, dialogLineId, api],
  );

  const value: GameContextValue = {
    scene,
    flags,
    knowledge,
    inventory,
    caption,
    textOverlay,
    dialogId,
    dialogLineId,
    radioOpen,
    terminalOpen,
    radioActive,
    resonance,
    ending,
    api,
    setCaption,
    closeText: () => setTextOverlay(null),
    advanceDialog,
    closeDialog: () => {
      if (dialogId) {
        const tree = dialogs[dialogId];
        tree?.onEnd?.(api);
      }
      setDialogId(null);
      setDialogLineId(null);
    },
    closeRadio: () => setRadioOpen(false),
    closeTerminal: () => setTerminalOpen(false),
    setRadioActive,
    bumpResonance: (d) => setResonance((r) => Math.max(0, Math.min(100, r + d))),
    resetResonance: () => setResonance(0),
    saveGame: (slot: number): SaveSummary => {
      const payload: PersistedState = {
        scene: sceneRef.current,
        flags: Array.from(flagsRef.current),
        knowledge: Array.from(knowledgeRef.current),
        inventory: inventoryRef.current,
        resonance: resonanceRef.current,
        ending: endingRef.current,
        savedAt: new Date().toISOString(),
        miraFloor: miraFloorRef.current,
      };
      try {
        window.localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(payload));
      } catch {
        /* ignore */
      }
      return {
        slot,
        scene: payload.scene,
        savedAt: payload.savedAt,
        flagCount: payload.flags.length,
        inventoryCount: payload.inventory.length,
      };
    },
    loadGame: (slot: number): boolean => {
      try {
        const raw = window.localStorage.getItem(SAVE_PREFIX + slot);
        if (!raw) return false;
        const data = JSON.parse(raw) as PersistedState;
        setScene(data.scene);
        setFlags(new Set(data.flags));
        setKnowledge(new Set(data.knowledge));
        setInventory(data.inventory);
        setResonance(data.resonance);
        setEnding(data.ending);
        miraFloorRef.current = data.miraFloor ?? null;
        // Reset transient UI
        setCaption(null);
        setTextOverlay(null);
        setDialogId(null);
        setDialogLineId(null);
        setRadioOpen(false);
        setTerminalOpen(false);
        setRadioActive(false);
        return true;
      } catch {
        return false;
      }
    },
    listSaves: () => {
      const out: Array<SaveSummary | null> = [];
      for (let i = 0; i < NUM_SLOTS; i++) {
        try {
          const raw = window.localStorage.getItem(SAVE_PREFIX + i);
          if (!raw) {
            out.push(null);
            continue;
          }
          const data = JSON.parse(raw) as PersistedState;
          out.push({
            slot: i,
            scene: data.scene,
            savedAt: data.savedAt,
            flagCount: data.flags.length,
            inventoryCount: data.inventory.length,
          });
        } catch {
          out.push(null);
        }
      }
      return out;
    },
    deleteSave: (slot: number) => {
      try {
        window.localStorage.removeItem(SAVE_PREFIX + slot);
      } catch {
        /* ignore */
      }
    },
  };

  // expose scenes for components
  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

export { scenes };