import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { GameProvider } from "@/game/GameContext";
import { getBook } from "@/game/books";
import { getLibraryReadableBook } from "@/game/books/libraryBooks";
import { InventoryDragProvider } from "@/game/InventoryDragContext";
import { SettingsProvider } from "@/audio/SettingsContext";
import { MusicPlayer } from "@/audio/MusicPlayer";
import { SceneView } from "./SceneView";
import { TopBar } from "./TopBar";
import { Inventory, DragCursorLayer } from "./Inventory";
import { ActiveItemBanner } from "./ActiveItemBanner";
import { FocusSheet } from "./mobile/FocusSheet";
import { TextOverlay } from "./TextOverlay";
import { DialogOverlay } from "./DialogOverlay";
import { RadioPanel } from "./RadioPanel";
import { Keypad } from "./Keypad";
import { Television } from "./Television";
import { AmigaWorkbench } from "./AmigaWorkbench";
import { NodeTerminal } from "./NodeTerminal";
import { BurnSequence } from "./BurnSequence";
import { ParamedicsCutscene } from "./ParamedicsCutscene";
import { SectorThresholdCutscene } from "./SectorThresholdCutscene";
import { Act2AssignmentCutscene } from "./Act2AssignmentCutscene";
import { MiraRepairCutscene } from "./MiraRepairCutscene";
import { Ending } from "./Ending";
import { PauseMenu } from "./PauseMenu";
import { MobileStage } from "./MobileStage";
import { DsaCharacterSheet } from "./DsaCharacterSheet";
import type { HelpTab } from "./HelpOverlay";
import { IdCardOverlay } from "./IdCardOverlay";
import { LobbyGate } from "./LobbyGate";
import { PneumaticTubeOverlay } from "./PneumaticTubeOverlay";
import { CondomAutomatOverlay } from "./CondomAutomatOverlay";
import { ParagraphenNotizbuchOverlay } from "./ParagraphenNotizbuchOverlay";
import { KantinenverordnungOverlay } from "./KantinenverordnungOverlay";
import { PubOverlay } from "./PubOverlay";
import { MapOverlay } from "./MapOverlay";
import { BusRide } from "./BusRide";
import { RoomSwitcher } from "@/dev/RoomSwitcher";
import { BookSwitcher } from "@/dev/BookSwitcher";
import { ConsoleSwitcher } from "@/dev/ConsoleSwitcher";
import { OverlayQAOverlay } from "@/dev/OverlayQAOverlay";
import { DialogEditOverlay } from "@/dev/DialogEditOverlay";
import { DevPlaybackPanel } from "@/dev/DevPlaybackPanel";
import { useDevMode } from "@/dev/devMode";
import { ToiletWallOverlay } from "./ToiletWallOverlay";
import { useMusic } from "@/audio/MusicPlayer";
import { useGame } from "@/game/GameContext";
import { DonationGate } from "@/components/donation/DonationGate";
import { OverlayErrorBoundary } from "./OverlayErrorBoundary";

const Terminal = lazyWithRetry(() =>
  import("./Terminal").then((m) => ({ default: m.Terminal })),
);
const DsaCharacterCreator = lazyWithRetry(() =>
  import("./DsaCharacterCreator").then((m) => ({
    default: m.DsaCharacterCreator,
  })),
);
const DsaAdventureScene = lazyWithRetry(() =>
  import("./DsaLlmAdventureScene").then((m) => ({ default: m.DsaLlmAdventureScene })),
);
const HandbookOverlay = lazyWithRetry(() =>
  import("./HandbookOverlay").then((m) => ({ default: m.HandbookOverlay })),
);
const BookOverlay = lazyWithRetry(() =>
  import("./BookOverlay").then((m) => ({ default: m.BookOverlay })),
);
const AlmanachOverlay = lazyWithRetry(() =>
  import("./AlmanachOverlay").then((m) => ({ default: m.AlmanachOverlay })),
);
const HelpOverlay = lazyWithRetry(() =>
  import("./HelpOverlay").then((m) => ({ default: m.HelpOverlay })),
);
const FreeChatOverlay = lazyWithRetry(() =>
  import("./FreeChatOverlay").then((m) => ({ default: m.FreeChatOverlay })),
);

function DsaMusicBridge() {
  const { scene, dsaAdventureOpen, dsaBeat, lobbyGateOpen } = useGame();
  const { setOverride, activeOverride } = useMusic();
  // Miras Zimmer: beim Betreten laufen nacheinander „Resonanzhygiene",
  // „Resonanzhygiene II" und „Das Gesetz der Nacht" einmal komplett durch
  // (Player ausgeblendet). Danach übernimmt wieder die reguläre Playlist.
  // 0 = noch nichts, 1 = Song 1 gestartet, 2 = Song 2 gestartet,
  // 3 = Song 3 gestartet, 4 = fertig
  const miraStageRef = useRef(0);
  useEffect(() => {
    if (scene !== "aptMira4601") {
      miraStageRef.current = 0;
      return;
    }
    if (dsaAdventureOpen) return;
    if (
      activeOverride === "miraRoom" ||
      activeOverride === "miraRoom2" ||
      activeOverride === "miraRoom3"
    )
      return;
    if (miraStageRef.current === 0) {
      miraStageRef.current = 1;
      setOverride("miraRoom", { playOnce: true });
    } else if (miraStageRef.current === 1) {
      miraStageRef.current = 2;
      setOverride("miraRoom2", { playOnce: true });
    } else if (miraStageRef.current === 2) {
      miraStageRef.current = 3;
      setOverride("miraRoom3", { playOnce: true });
    }
  }, [scene, dsaAdventureOpen, activeOverride, setOverride]);
  useEffect(() => {
    // Wenn die LLM-Tafelrunde offen ist, übernimmt der Mood-Pool in
    // DsaLlmAdventureScene die Musik — hier kein Override setzen.
    const inTavern = dsaAdventureOpen && !!dsaBeat && dsaBeat.startsWith("s2");
    const inDsa = scene === "commonRoomE67" && !dsaAdventureOpen;
    const inCafeteria = scene === "cafeteriaE67";
    const inPub = scene === "pub" || scene === "pubToilet";
    const inE71Nerds = scene === "commonRoomE71";
    const inElevator = scene === "elevator" || scene === "elevatorE71";
    // Die Lobby-Schleuse (Numpad direkt nach dem Aufzug-Ausstieg) ist
    // akustisch noch Teil des Aufzugs: Aufzugsmusik läuft weiter.
    const treatAsElevator = inElevator || lobbyGateOpen;
    const target = dsaAdventureOpen
      ? null
      : treatAsElevator
        ? "elevator"
        : inTavern
          ? "dsaTavern"
          : inDsa
            ? "dsaTable"
            : inCafeteria
              ? "cafeteria"
              : inPub
                ? "pub"
                : inE71Nerds
                  ? "e71Nerds"
                  : null;
    // Cutscene-Overrides (Play-Once) gehören der jeweiligen Cutscene und
    // lösen sich selbst auf. Bis dahin nicht überschreiben — sonst würde
    // ein Szenenwechsel (target=null) den Song abbrechen.
    // Miras Zimmer gehört dem Effekt oben (Resonanzhygiene I/II) — hier
    // nichts setzen, sonst überschreibt ein Szenenwechsel den Song sofort.
    if (scene === "aptMira4601" && !dsaAdventureOpen) return;
    const CUTSCENE_OVERRIDES = [
      "sectorThreshold",
      "act2Assignment",
      "miraRepair",
      "miraRoom",
      "miraRoom2",
      "miraRoom3",
    ];
    if (activeOverride && CUTSCENE_OVERRIDES.includes(activeOverride)) return;
    setOverride(target);
  }, [scene, dsaAdventureOpen, dsaBeat, setOverride, activeOverride, lobbyGateOpen]);
  return null;
}

export default function GameShell() {
  const [pauseOpen, setPauseOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState<false | HelpTab>(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPauseOpen((v) => !v);
      if (e.key === "F1") {
        e.preventDefault();
        setHelpOpen((v) => (v ? false : "cheatsheet"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SettingsProvider>
      <MusicPlayer>
        <GameProvider>
          <InventoryDragProvider>
            <GameStage
              pauseOpen={pauseOpen}
              setPauseOpen={setPauseOpen}
              helpOpen={helpOpen}
              setHelpOpen={setHelpOpen}
            />
            <DragCursorLayer />
            <ActiveItemBanner />
            <FocusSheet />
            <DonationGate />
          </InventoryDragProvider>
        </GameProvider>
      </MusicPlayer>
    </SettingsProvider>
  );
}

function GameStage({
  pauseOpen,
  setPauseOpen,
  helpOpen,
  setHelpOpen,
}: {
  pauseOpen: boolean;
  setPauseOpen: (v: boolean) => void;
  helpOpen: false | HelpTab;
  setHelpOpen: (v: false | HelpTab) => void;
}) {
  const {
    terminalOpen,
    nodeOpen,
    dsaCreatorOpen,
    dsaAdventureOpen,
    dsaCharacter,
    toggleDsaSheet,
    handbookOpen,
    closeHandbook,
    bookOpen,
    currentBookId,
    closeBook,
    idCardOpen,
    closeIdCard,
    freeChatNpcId,
  } = useGame();
  const currentBook = currentBookId
    ? (getBook(currentBookId) ?? getLibraryReadableBook(currentBookId))
    : null;
  const dev = useDevMode();

  const handleOpenPause = useCallback(() => setPauseOpen(true), [setPauseOpen]);
  const handleOpenHelp = useCallback(
    (tab?: HelpTab) => setHelpOpen(tab ?? "cheatsheet"),
    [setHelpOpen],
  );
  const handleClosePause = useCallback(
    () => setPauseOpen(false),
    [setPauseOpen],
  );
  const handleCloseHelp = useCallback(() => setHelpOpen(false), [setHelpOpen]);

  useEffect(() => {
    if (!dsaCharacter) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "c" && e.key !== "C") return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (terminalOpen || nodeOpen || dsaCreatorOpen || dsaAdventureOpen)
        return;
      e.preventDefault();
      toggleDsaSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    dsaCharacter,
    terminalOpen,
    nodeOpen,
    dsaCreatorOpen,
    dsaAdventureOpen,
    toggleDsaSheet,
  ]);
  const consoleOpen =
    terminalOpen ||
    nodeOpen ||
    dsaCreatorOpen ||
    dsaAdventureOpen ||
    handbookOpen ||
    bookOpen ||
    !!freeChatNpcId;
  return (
    <>
    <MobileStage uprightOnPortrait={consoleOpen}>
      <div className="flex h-full flex-col overflow-hidden bg-bureaucracy mobile-stage-host">
        <TopBar
          onOpenPause={handleOpenPause}
          onOpenHelp={handleOpenHelp}
        />
        <main className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-2 sm:px-4">
          <div className="relative flex h-full w-full items-center justify-center">
            <SceneView />
            <TextOverlay />
            <DialogOverlay />
            <RadioPanel />
            <Keypad />
            <Television />
            <AmigaWorkbench />
            <NodeTerminal />
            <BurnSequence />
            <ParamedicsCutscene />
            <DsaCharacterSheet />
            <DsaMusicBridge />
            <IdCardOverlay open={idCardOpen} onClose={closeIdCard} />
            <LobbyGate />
            <PneumaticTubeOverlay />
            <CondomAutomatOverlay />
            <ParagraphenNotizbuchOverlay />
            <KantinenverordnungOverlay />
            <PubOverlay />
            <MapOverlay />
            <BusRide />
            <ToiletWallOverlay />
            <Ending />
            <SectorThresholdCutscene />
            <Act2AssignmentCutscene />
            <MiraRepairCutscene />
            <PauseMenu open={pauseOpen} onClose={handleClosePause} />
            <OverlayErrorBoundary onClose={closeBook}>
            <Suspense fallback={null}>
              {terminalOpen && <Terminal />}
              {dsaCreatorOpen && <DsaCharacterCreator />}
              {dsaAdventureOpen && <DsaAdventureScene />}
              {handbookOpen && (
                <HandbookOverlay open={handbookOpen} onClose={closeHandbook} />
              )}
              {bookOpen && currentBook && (
                <BookOverlay
                  open={bookOpen}
                  onClose={closeBook}
                  title={currentBook.title}
                  subtitle={currentBook.subtitle}
                  chapters={currentBook.chapters}
                  uiText={currentBook.uiText}
                />
              )}
              {helpOpen !== false && (
                <HelpOverlay
                  open
                  initialTab={helpOpen}
                  onClose={handleCloseHelp}
                />
              )}
              <FreeChatGate />
            </Suspense>
            </OverlayErrorBoundary>
          </div>
        </main>
        <Inventory />
      </div>
    </MobileStage>
      {dev && <RoomSwitcher />}
      {dev && <BookSwitcher />}
      {dev && <ConsoleSwitcher />}
      {dev && <OverlayQAOverlay />}
      {dev && <DialogEditOverlay />}
      {dev && <DevPlaybackPanel />}
    </>
  );
}

function FreeChatGate() {
  const { freeChatNpcId } = useGame();
  if (!freeChatNpcId) return null;
  return <FreeChatOverlay />;
}