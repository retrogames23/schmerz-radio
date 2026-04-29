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
import { markEssentialAssetsLoaded as notifyLoaderEssentialAssets } from "@/llm/webLlmLoader";
import type {
  GameApi,
  CutsceneId,
  DsaCharacterSummary,
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
  terminalBodoMode: boolean;
  keypadOpen: boolean;
  tvOpen: boolean;
  /** Welche Tür wird gerade am Keypad geprüft. */
  keypadTarget: "sectorDoor";
  /** Wartungsterminal hinter Tür 5610 sichtbar. */
  nodeOpen: boolean;
  /** Pneumatik-Rohrpost-Overlay in der Kantine 3602. */
  pneumaticOpen: boolean;
  radioActive: boolean; // tuned to 104.6, providing subtext
  resonance: number; // 0–100
  ending: boolean;
  /** Aktive Burn-Sequenz nach Knoten-5610-Aktion. */
  burnSequence: boolean;
  /** Aktive narrative Cutscene (z. B. Sanitäter-Bergung). */
  cutscene: CutsceneId | null;
  /** DSA-Charaktererschaffungs-Modal sichtbar. */
  dsaCreatorOpen: boolean;
  /** Aktueller DSA-Charakter, oder `null`. */
  dsaCharacter: DsaCharacterSummary | null;
  /** DSA-Charakterbogen-Overlay (Lese-Ansicht) sichtbar. */
  dsaSheetOpen: boolean;
  /** Handbuch-Lese-Overlay sichtbar. */
  handbookOpen: boolean;
  /** Bewohner-Ausweis-Lese-Overlay sichtbar. */
  idCardOpen: boolean;
  /** Lobby-Schleuse-Overlay sichtbar (Tagesmodus, vor Erstbetreten). */
  lobbyGateOpen: boolean;
}

interface GameContextValue extends GameState {
  api: GameApi;
  previousScene: SceneId | null;
  freeChatNpcId: string | null;
  openFreeChat: (npcId: string) => void;
  closeFreeChat: () => void;
  /** True, sobald die Assets der ersten Szene geladen sind. */
  isEssentialAssetsLoaded: boolean;
  /** Wird aus der SceneView aufgerufen, wenn der erste Hintergrund da ist. */
  markEssentialAssetsLoaded: () => void;
  setCaption: (s: string | null) => void;
  closeText: () => void;
  advanceDialog: (nextId?: string) => void;
  closeDialog: () => void;
  closeRadio: () => void;
  closeTerminal: () => void;
  closeKeypad: () => void;
  closeTelevision: () => void;
  closeNode: () => void;
  closePneumatic: () => void;
  endBurnSequence: () => void;
  endCutscene: () => void;
  closeDsaCreator: () => void;
  setDsaCharacter: (c: DsaCharacterSummary | null) => void;
  /** Charakterbogen-Overlay öffnen / schließen / umschalten. */
  openDsaSheet: () => void;
  closeDsaSheet: () => void;
  toggleDsaSheet: () => void;
  /** Handbuch / Ausweis Overlays. */
  openHandbook: () => void;
  closeHandbook: () => void;
  openIdCard: () => void;
  closeIdCard: () => void;
  /** Lobby-Schleuse manuell öffnen / schließen. */
  openLobbyGate: () => void;
  closeLobbyGate: () => void;
  /** Lobby-Schleusen-Eskalation (Fehlversuche, transient). */
  getLobbyGateAttempts: () => number;
  bumpLobbyGateAttempts: () => number;
  resetLobbyGateAttempts: () => void;
  /** DSA-Abenteuer-Overlay sichtbar (nach Charaktererstellung). */
  dsaAdventureOpen: boolean;
  /** Aktueller Beat im Abenteuer, oder null. */
  dsaBeat: string | null;
  closeDsaAdventure: () => void;
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
  /** Legacy single-floor field — still read for backwards compatibility. */
  miraFloor?: 3 | 4 | 5 | null;
  /** Current encoding: which floors Mira occupies this run (length 2). */
  miraFloors?: Array<3 | 4 | 5> | null;
  /** Floor where Philippe appears in the corridor this run. */
  philippeFloor?: 3 | 4 | 5 | null;
  /** DSA-Charakter, falls Layard schon einen erwürfelt hat. */
  dsaCharacter?: DsaCharacterSummary | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [scene, setScene] = useState<SceneId>("apartment");
  const [previousScene, setPreviousScene] = useState<SceneId | null>(null);
  const [flags, setFlags] = useState<Set<StoryFlag>>(() => new Set());
  const [knowledge, setKnowledge] = useState<Set<KnowledgeFlag>>(
    () => new Set(),
  );
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [caption, setCaption] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState<string[] | null>(null);
  const textOverlayCloseRef = useRef<(() => void) | null>(null);
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [dialogLineId, setDialogLineId] = useState<string | null>(null);
  const [radioOpen, setRadioOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalBodoMode, setTerminalBodoMode] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);
  // Aktuell nur eine Sorte Keypad (Sektor-Tür). Tür 5610 öffnet über
  // Wartungs-Override / Wartungskarte ohne Keypad.
  const keypadTarget = "sectorDoor" as const;
  const [nodeOpen, setNodeOpen] = useState(false);
  const [pneumaticOpen, setPneumaticOpen] = useState(false);
  const [radioActive, setRadioActive] = useState(false);
  const [tvOpen, setTvOpen] = useState(false);
  const [resonance, setResonance] = useState(0);
  const [ending, setEnding] = useState(false);
  const [burnSequence, setBurnSequence] = useState<boolean>(false);
  const [cutscene, setCutscene] = useState<CutsceneId | null>(null);
  const [dsaCreatorOpen, setDsaCreatorOpen] = useState(false);
  const [dsaSheetOpen, setDsaSheetOpen] = useState(false);
  const [dsaCharacter, setDsaCharacterState] =
    useState<DsaCharacterSummary | null>(null);
  const dsaCharacterRef = useRef<DsaCharacterSummary | null>(null);
  dsaCharacterRef.current = dsaCharacter;
  const [dsaAdventureOpen, setDsaAdventureOpen] = useState(false);
  const [dsaBeat, setDsaBeatState] = useState<string | null>(null);
  const dsaBeatRef = useRef<string | null>(null);
  dsaBeatRef.current = dsaBeat;
  const [handbookOpen, setHandbookOpen] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [lobbyGateOpen, setLobbyGateOpen] = useState(false);
  const [freeChatNpcId, setFreeChatNpcId] = useState<string | null>(null);
  const [isEssentialAssetsLoaded, setIsEssentialAssetsLoaded] = useState(false);
  // Eskalationszähler der Lobby-Schleuse (Fehlversuche), nicht persistiert.
  const lobbyGateAttemptsRef = useRef(0);
  // Mira darf NICHT auf Etage 3 erscheinen — dort liegt das Büro des
  // Abschnittsverantwortlichen (E67). Würde sie dort die Tür blockieren und
  // Layard ginge nicht auf sie ein, gäbe es ein Dead End: er erfährt dann
  // nicht, dass E67 nicht da ist.
  // Verteilung: Mira besetzt EINE der Wohnetagen {4, 5}, Philippe besetzt
  // die andere. Etage 3 bleibt für beide NPCs frei. Wird einmal beim Mounten
  // kryptografisch zufällig gewählt.
  const miraFloorsRef = useRef<Array<3 | 4 | 5> | null>(null);
  const philippeFloorRef = useRef<3 | 4 | 5 | null>(null);
  if (miraFloorsRef.current === null) {
    const livingFloors: Array<4 | 5> = [4, 5];
    let idx = 0;
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      idx = buf[0] % 2;
    } else {
      idx = Math.floor(Math.random() * 2);
    }
    const miraFloor = livingFloors[idx];
    const philippeFloor = livingFloors[1 - idx];
    miraFloorsRef.current = [miraFloor];
    philippeFloorRef.current = philippeFloor;
  }

  // Debug-Sprung über URL-Parameter:
  //   ?scene=apt2612
  //   ?scene=apt2615&flags=doorBrokenOpen,paramedicsArrived,protocolReceived
  //   ?scene=corridor36&flags=enteredE71            (Akt 2)
  // Wird genau einmal beim ersten Render ausgewertet.
  const debugAppliedRef = useRef(false);
  if (!debugAppliedRef.current && typeof window !== "undefined") {
    debugAppliedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const sceneParam = params.get("scene");
    const flagsParam = params.get("flags");
    if (sceneParam && sceneParam in scenes) {
      // useState lazy initial values laufen schon — wir überschreiben hier
      // synchron via setter (React kümmert sich um den Re-Render).
      setScene(sceneParam as SceneId);
    }
    if (flagsParam) {
      const list = flagsParam
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean) as StoryFlag[];
      if (list.length > 0) {
        setFlags((prev) => {
          const n = new Set(prev);
          list.forEach((f) => n.add(f));
          return n;
        });
      }
    }
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
        setPreviousScene(sceneRef.current);
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
      clearFlag: (f) =>
        setFlags((prev) => {
          if (!prev.has(f)) return prev;
          const n = new Set(prev);
          n.delete(f);
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
      showText: (lines, onClose) => {
        textOverlayCloseRef.current = onClose ?? null;
        setTextOverlay(lines);
      },
      startDialog: (id) => {
        const tree = dialogs[id];
        if (!tree) return;
        // Resolve to the first visible line — auto-skip start lines whose
        // requires/hiddenWhen do not match current flags.
        let cursor: string | undefined = tree.start;
        const seen = new Set<string>();
        while (cursor && !seen.has(cursor)) {
          seen.add(cursor);
          const candidate: (typeof tree.lines)[string] | undefined =
            tree.lines[cursor];
          if (!candidate) {
            cursor = undefined;
            break;
          }
          const reqOk =
            !candidate.requires ||
            candidate.requires.every((f: StoryFlag) =>
              flagsRef.current.has(f),
            );
          const hideOk =
            !candidate.hiddenWhen ||
            !candidate.hiddenWhen.some((f: StoryFlag) =>
              flagsRef.current.has(f),
            );
          if (reqOk && hideOk) break;
          if (candidate.end || !candidate.next) {
            cursor = undefined;
            break;
          }
          cursor = candidate.next;
        }
        if (!cursor) return;
        setDialogId(id);
        setDialogLineId(cursor);
      },
      openTerminal: (asBodo?: boolean) => {
        setRadioOpen(false);
        setTerminalBodoMode(!!asBodo);
        setTerminalOpen(true);
      },
      openRadio: () => {
        setTerminalOpen(false);
        setRadioOpen(true);
      },
      openKeypad: () => {
        setKeypadOpen(true);
      },
      isRadioActive: () => radioActiveRef.current,
      openTelevision: () => {
        setRadioOpen(false);
        setTerminalOpen(false);
        setTvOpen(true);
      },
      openNode5610: () => {
        setRadioOpen(false);
        setTerminalOpen(false);
        setNodeOpen(true);
      },
      openPneumaticTube: () => {
        setRadioOpen(false);
        setTerminalOpen(false);
        setPneumaticOpen(true);
      },
      setEnding: () => setEnding(true),
      playBurnSequence: () => {
        // Node-Terminal schließen, Sequenz übernimmt den Bildschirm.
        setNodeOpen(false);
        setBurnSequence(true);
      },
      startCutscene: (id) => {
        // Alles Overlay-haftige zumachen, damit die Cutscene allein den
        // Bildschirm bekommt.
        setRadioOpen(false);
        setTerminalOpen(false);
        setNodeOpen(false);
        setKeypadOpen(false);
        setTvOpen(false);
        setTextOverlay(null);
        setDialogId(null);
        setDialogLineId(null);
        setCutscene(id);
      },
      getMiraFloors: () => miraFloorsRef.current ?? [4],
      getPhilippeFloor: () => philippeFloorRef.current ?? 5,
      openDsaCreator: () => {
        setRadioOpen(false);
        setTerminalOpen(false);
        setNodeOpen(false);
        setKeypadOpen(false);
        setTvOpen(false);
        setTextOverlay(null);
        setDialogId(null);
        setDialogLineId(null);
        setDsaCreatorOpen(true);
      },
      getDsaCharacter: () => dsaCharacterRef.current,
      clearDsaCharacter: () => {
        dsaCharacterRef.current = null;
        setDsaCharacterState(null);
      },
      openDsaAdventure: (beatId?: string) => {
        setRadioOpen(false);
        setTerminalOpen(false);
        setNodeOpen(false);
        setKeypadOpen(false);
        setTvOpen(false);
        setTextOverlay(null);
        setDialogId(null);
        setDialogLineId(null);
        setDsaCreatorOpen(false);
        if (beatId) {
          dsaBeatRef.current = beatId;
          setDsaBeatState(beatId);
        } else if (!dsaBeatRef.current) {
          dsaBeatRef.current = "s1b1";
          setDsaBeatState("s1b1");
        }
        setDsaAdventureOpen(true);
      },
      getDsaBeat: () => dsaBeatRef.current,
      setDsaBeat: (beatId: string | null) => {
        dsaBeatRef.current = beatId;
        setDsaBeatState(beatId);
      },
    }),
    [],
  );

  // Insa-Rückruf nach burn: einmalig, sobald Layard nach der Sequenz wieder
  // in seine Wohnung oder den Korridor 56 kommt.
  useEffect(() => {
    if (burnSequence) return;
    if (!flags.has("burnedNode5610")) return;
    if (flags.has("insaCallbackBurnDone")) return;
    if (dialogId) return;
    if (scene !== "apartment" && scene !== "corridor56") return;
    // Kleine Verzögerung, damit Szenenwechsel/Sequenz-Cleanup durch ist.
    const t = setTimeout(() => {
      api.startDialog("insaCallbackAfterBurn");
    }, 600);
    return () => clearTimeout(t);
  }, [burnSequence, flags, scene, dialogId, api]);

  // Start-Items: Bewohner-Ausweis & E67-Handbuch landen einmalig im Inventar,
  // sobald der GameProvider mountet (Spielstart). Ein vorhandener Eintrag
  // (z. B. nach Save-Load) wird respektiert.
  useEffect(() => {
    if (!inventoryRef.current.some((i) => i.id === "residentId")) {
      api.addItem({
        id: "residentId",
        name: "E67-Bewohner-Ausweis",
        description:
          "Beige Plastikkarte mit Lichtbild und Magnetstreifen. Vorne: Worag, Layard — Wohnung 2611. Auf der Rückseite ist etwas geprägt; im Tageslicht schwer zu erkennen.",
      });
    }
    if (!inventoryRef.current.some((i) => i.id === "e67Handbook")) {
      api.addItem({
        id: "e67Handbook",
        name: "E67-Handbuch (7. rev. Fassung)",
        description:
          "Eine geheftete Broschüre mit Eselsohren. Trägt den Stempel der Leitstelle E67. Acht Kapitel und ein Anhang. Wohlmeinend formuliert. Trotzdem: kompliziert.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Akt-I-Pflichträtsel: Sobald Layard den Sanitäter-Bericht UND
  // Kowalks Tochter-Geschichte UND die B3 an Philippe übergeben hat,
  // fällt ihm beim nächsten Szenenwechsel die Bewohnernummer auf der
  // Kopie auf. Setzt `noticedTransferCode`, das den Pickup-Hotspot
  // (Bleistift) und den Quittungsblock freischaltet.
  useEffect(() => {
    if (flags.has("noticedTransferCode")) return;
    if (
      flags.has("gotParamedicsReport") &&
      flags.has("kowalkToldHerDaughter") &&
      flags.has("gaveB3ToPhilippe")
    ) {
      api.setFlag("noticedTransferCode");
      api.showText([
        "Layard zieht den Sanitäter-Bericht noch einmal heraus.",
        "Am rechten Rand, mit Kuli, klein: »TRANSFER E70 / 4317-K«.",
        "Er hat das beim ersten Lesen übersehen.",
        "Vier-Drei-Eins-Sieben. Das ist nicht Philippes Vollmacht.",
        "Das ist eine Transfernummer. Und 4317-K — das K steht für",
        "Kowalk.",
      ]);
    }
  }, [flags, api]);

  // Lobby-Schleuse (Tagesmodus): Beim Betreten der Etage-1-Lobby vor dem
  // Aufbruch nach E71 muss Layard sich am Eingangsterminal ausweisen.
  // Ab `enteredE71` (Akt II) entfällt die Schleuse — der Ausgang gilt als
  // gemeldet und das Personal hat ohnehin Schichtwechsel.
  useEffect(() => {
    if (scene !== "floor1Lobby") return;
    if (flags.has("lobbyClearedDay")) return;
    if (flags.has("enteredE71")) return;
    if (dialogId || textOverlay || keypadOpen || nodeOpen || terminalOpen)
      return;
    setLobbyGateOpen(true);
  }, [
    scene,
    flags,
    dialogId,
    textOverlay,
    keypadOpen,
    nodeOpen,
    terminalOpen,
  ]);

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
    previousScene,
    flags,
    knowledge,
    inventory,
    caption,
    textOverlay,
    dialogId,
    dialogLineId,
    radioOpen,
    terminalOpen,
    terminalBodoMode,
    keypadOpen,
    tvOpen,
    keypadTarget,
    nodeOpen,
    pneumaticOpen,
    radioActive,
    resonance,
    ending,
    burnSequence,
    cutscene,
    dsaCreatorOpen,
    dsaCharacter,
    dsaAdventureOpen,
    dsaBeat,
    dsaSheetOpen,
    handbookOpen,
    idCardOpen,
    lobbyGateOpen,
    freeChatNpcId,
    openFreeChat: (npcId: string) => setFreeChatNpcId(npcId),
    closeFreeChat: () => setFreeChatNpcId(null),
    isEssentialAssetsLoaded,
    markEssentialAssetsLoaded: () => {
      // Idempotent: erst beim ersten Mal den Loader benachrichtigen.
      setIsEssentialAssetsLoaded((v) => {
        if (!v) notifyLoaderEssentialAssets();
        return true;
      });
    },
    closeDsaAdventure: () => setDsaAdventureOpen(false),
    api,
    setCaption,
    closeText: () => {
      const cb = textOverlayCloseRef.current;
      textOverlayCloseRef.current = null;
      setTextOverlay(null);
      if (cb) cb();
    },
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
    closeTerminal: () => {
      setTerminalOpen(false);
    },
    closeKeypad: () => setKeypadOpen(false),
    closeTelevision: () => setTvOpen(false),
    closeNode: () => setNodeOpen(false),
    closePneumatic: () => setPneumaticOpen(false),
    endBurnSequence: () => setBurnSequence(false),
    endCutscene: () => setCutscene(null),
    closeDsaCreator: () => setDsaCreatorOpen(false),
    openDsaSheet: () => setDsaSheetOpen(true),
    closeDsaSheet: () => setDsaSheetOpen(false),
    toggleDsaSheet: () => setDsaSheetOpen((v) => !v),
    openHandbook: () => setHandbookOpen(true),
    closeHandbook: () => setHandbookOpen(false),
    openIdCard: () => setIdCardOpen(true),
    closeIdCard: () => setIdCardOpen(false),
    openLobbyGate: () => setLobbyGateOpen(true),
    closeLobbyGate: () => setLobbyGateOpen(false),
    /** Aktueller Fehlversuchs-Zähler der Lobby-Schleuse (für die UI). */
    getLobbyGateAttempts: () => lobbyGateAttemptsRef.current,
    bumpLobbyGateAttempts: () => {
      lobbyGateAttemptsRef.current += 1;
      return lobbyGateAttemptsRef.current;
    },
    resetLobbyGateAttempts: () => {
      lobbyGateAttemptsRef.current = 0;
    },
    setDsaCharacter: (c) => {
      dsaCharacterRef.current = c;
      setDsaCharacterState(c);
    },
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
        miraFloors: miraFloorsRef.current,
        philippeFloor: philippeFloorRef.current,
        dsaCharacter: dsaCharacterRef.current,
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
      // DSA-Charakter wiederherstellen (oder klar zurücksetzen).
      if (persisted.dsaCharacter) {
        // Rückwärtskompatibilität: leMax wurde später eingeführt — alte Saves
        // bekommen leMax = le als Default, damit Heilung sinnvoll cappen kann.
        const c = persisted.dsaCharacter;
        const migrated = {
          ...c,
          leMax: typeof (c as { leMax?: number }).leMax === "number" ? (c as { leMax: number }).leMax : c.le,
        };
        dsaCharacterRef.current = migrated;
        setDsaCharacterState(migrated);
      } else {
        dsaCharacterRef.current = null;
        setDsaCharacterState(null);
      }
      // Wiederherstellung mit Rückwärtskompatibilität: Mira darf nie auf
      // Etage 3 stehen. Alte Saves, die das noch erlaubten, werden auf das
      // neue Schema (Mira ∈ {4,5}, Philippe = die andere, 3 frei) gemappt.
      const livingFloors: Array<4 | 5> = [4, 5];
      const sanitizeMira = (
        floors: ReadonlyArray<3 | 4 | 5>,
      ): Array<4 | 5> => {
        const filtered = floors.filter((f): f is 4 | 5 => f === 4 || f === 5);
        if (filtered.length > 0) return [filtered[0]];
        // Save hatte Mira nur auf 3 — zufällig auf 4 oder 5 verschieben.
        return [livingFloors[Math.floor(Math.random() * 2)]];
      };
      if (persisted.miraFloors && persisted.miraFloors.length > 0) {
        const mira = sanitizeMira(persisted.miraFloors);
        miraFloorsRef.current = mira;
        philippeFloorRef.current = livingFloors.find((f) => f !== mira[0]) ?? 5;
      } else if (persisted.miraFloor) {
        const mira = sanitizeMira([persisted.miraFloor]);
        miraFloorsRef.current = mira;
        philippeFloorRef.current = livingFloors.find((f) => f !== mira[0]) ?? 5;
      } else {
        miraFloorsRef.current = null;
        philippeFloorRef.current = null;
      }
      // Reset transient UI
      setCaption(null);
      setTextOverlay(null);
      setDialogId(null);
      setDialogLineId(null);
      setRadioOpen(false);
      setTerminalOpen(false);
      setKeypadOpen(false);
      setRadioActive(false);
      setNodeOpen(false);
      setDsaCreatorOpen(false);
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