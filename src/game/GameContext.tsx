import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dialogs } from "./dialogs";
import { scenes } from "./scenes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
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
  saveGame: (slot: number) => Promise<SaveSummary>;
  loadGame: (slot: number) => Promise<boolean>;
  listSaves: () => Promise<Array<SaveSummary | null>>;
  deleteSave: (slot: number) => Promise<void>;
}

export interface SaveSummary {
  slot: number;
  scene: SceneId;
  savedAt: string; // ISO
  flagCount: number;
  inventoryCount: number;
}

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
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

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
  // Floor (3, 4 or 5) where Mira appears this run.
  // Wird einmal beim Mounten **eager** und kryptografisch zufällig gewählt,
  // damit die Verteilung nicht durch die Reihenfolge der visible()-Checks
  // (die immer mit Etage 3 beginnen) verzerrt wird.
  const miraFloorRef = useRef<3 | 4 | 5 | null>(null);
  if (miraFloorRef.current === null) {
    const pool: Array<3 | 4 | 5> = [3, 4, 5];
    let idx = 0;
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      idx = buf[0] % 3;
    } else {
      idx = Math.floor(Math.random() * 3);
    }
    miraFloorRef.current = pool[idx];
  }

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
      getMiraFloor: () => miraFloorRef.current ?? 3,
    }),
    [],
  );

  const advanceDialog = useCallback(
    (nextId?: string) => {
      if (!dialogId) return;
      const tree = dialogs[dialogId];
      if (!tree) return;
      // Resolve a target line, auto-skipping lines whose requires/hiddenWhen
      // conditions are not met. Jumps along `next` until a visible line is
      // found or the dialog ends.
      const resolveVisible = (startId: string | undefined): string | null => {
        let cursor = startId;
        const seen = new Set<string>();
        while (cursor && !seen.has(cursor)) {
          seen.add(cursor);
          const candidate = tree.lines[cursor];
          if (!candidate) return null;
          const reqOk =
            !candidate.requires ||
            candidate.requires.every((f) => flagsRef.current.has(f));
          const hideOk =
            !candidate.hiddenWhen ||
            !candidate.hiddenWhen.some((f) => flagsRef.current.has(f));
          if (reqOk && hideOk) return cursor;
          if (candidate.end || !candidate.next) return null;
          cursor = candidate.next;
        }
        return null;
      };
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
        const target = resolveVisible(current.next);
        if (!target) {
          setDialogId(null);
          setDialogLineId(null);
          tree.onEnd?.(api);
          return;
        }
        setDialogLineId(target);
        return;
      }
      const target = resolveVisible(nextId);
      if (!target) {
        setDialogId(null);
        setDialogLineId(null);
        tree.onEnd?.(api);
        return;
      }
      setDialogLineId(target);
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
    saveGame: async (slot: number): Promise<SaveSummary> => {
      const u = userRef.current;
      if (!u) throw new Error("Nicht angemeldet.");
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
      const summary: SaveSummary = {
        slot,
        scene: payload.scene,
        savedAt: payload.savedAt,
        flagCount: payload.flags.length,
        inventoryCount: payload.inventory.length,
      };
      const { error } = await supabase
        .from("game_saves")
        .upsert(
          [
            {
              user_id: u.id,
              slot: slot + 1,
              payload: payload as unknown as never,
              scene: payload.scene,
              inventory_count: payload.inventory.length,
              flag_count: payload.flags.length,
              saved_at: payload.savedAt,
            },
          ],
          { onConflict: "user_id,slot" },
        );
      if (error) throw new Error(error.message);
      return summary;
    },
    loadGame: async (slot: number): Promise<boolean> => {
      const u = userRef.current;
      if (!u) return false;
      const { data, error } = await supabase
        .from("game_saves")
        .select("payload")
        .eq("user_id", u.id)
        .eq("slot", slot + 1)
        .maybeSingle();
      if (error || !data) return false;
      const persisted = data.payload as unknown as PersistedState;
      setScene(persisted.scene);
      setFlags(new Set(persisted.flags));
      setKnowledge(new Set(persisted.knowledge));
      setInventory(persisted.inventory);
      setResonance(persisted.resonance);
      setEnding(persisted.ending);
      miraFloorRef.current = persisted.miraFloor ?? null;
      // Reset transient UI
      setCaption(null);
      setTextOverlay(null);
      setDialogId(null);
      setDialogLineId(null);
      setRadioOpen(false);
      setTerminalOpen(false);
      setRadioActive(false);
      return true;
    },
    listSaves: async (): Promise<Array<SaveSummary | null>> => {
      const u = userRef.current;
      const out: Array<SaveSummary | null> = Array(NUM_SLOTS).fill(null);
      if (!u) return out;
      const { data, error } = await supabase
        .from("game_saves")
        .select("slot, scene, inventory_count, flag_count, saved_at")
        .eq("user_id", u.id);
      if (error || !data) return out;
      for (const row of data) {
        const idx = (row.slot as number) - 1;
        if (idx < 0 || idx >= NUM_SLOTS) continue;
        out[idx] = {
          slot: idx,
          scene: row.scene as SceneId,
          savedAt: row.saved_at as string,
          flagCount: row.flag_count as number,
          inventoryCount: row.inventory_count as number,
        };
      }
      return out;
    },
    deleteSave: async (slot: number): Promise<void> => {
      const u = userRef.current;
      if (!u) return;
      await supabase
        .from("game_saves")
        .delete()
        .eq("user_id", u.id)
        .eq("slot", slot + 1);
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