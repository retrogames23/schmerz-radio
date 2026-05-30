import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { GameProvider } from "@/game/GameContext";
import { InventoryDragProvider } from "@/game/InventoryDragContext";
import { SettingsProvider } from "@/audio/SettingsContext";
import { MusicPlayer } from "@/audio/MusicPlayer";
import { SceneView } from "./SceneView";
import { TopBar } from "./TopBar";
import { Inventory, DragCursorLayer } from "./Inventory";
import { ActiveItemBanner } from "./ActiveItemBanner";
import { TextOverlay } from "./TextOverlay";
import { DialogOverlay } from "./DialogOverlay";
import { RadioPanel } from "./RadioPanel";
import { Keypad } from "./Keypad";
import { Television } from "./Television";
import { AmigaWorkbench } from "./AmigaWorkbench";
import { NodeTerminal } from "./NodeTerminal";
import { BurnSequence } from "./BurnSequence";
import { ParamedicsCutscene } from "./ParamedicsCutscene";
import { Act2BridgeCutscene } from "./Act2BridgeCutscene";
import { SectorThresholdCutscene } from "./SectorThresholdCutscene";
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
import { RoomSwitcher } from "@/dev/RoomSwitcher";
import { ConsoleSwitcher } from "@/dev/ConsoleSwitcher";
import { OverlayQAOverlay } from "@/dev/OverlayQAOverlay";
import { DialogEditOverlay } from "@/dev/DialogEditOverlay";
import { DevPlaybackPanel } from "@/dev/DevPlaybackPanel";
import { useDevMode } from "@/dev/devMode";
import { ToiletWallOverlay } from "./ToiletWallOverlay";
import { useMusic } from "@/audio/MusicPlayer";
import { useGame } from "@/game/GameContext";
import { DonationGate } from "@/components/donation/DonationGate";

const Terminal = lazy(() =>
  import("./Terminal").then((m) => ({ default: m.Terminal })),
);
const DsaCharacterCreator = lazy(() =>
  import("./DsaCharacterCreator").then((m) => ({
    default: m.DsaCharacterCreator,
  })),
);
const DsaAdventureScene = lazy(() =>
  import("./DsaLlmAdventureScene").then((m) => ({ default: m.DsaLlmAdventureScene })),
);
const HandbookOverlay = lazy(() =>
  import("./HandbookOverlay").then((m) => ({ default: m.HandbookOverlay })),
);
const AlmanachOverlay = lazy(() =>
  import("./AlmanachOverlay").then((m) => ({ default: m.AlmanachOverlay })),
);
const HelpOverlay = lazy(() =>
  import("./HelpOverlay").then((m) => ({ default: m.HelpOverlay })),
);
const FreeChatOverlay = lazy(() =>
  import("./FreeChatOverlay").then((m) => ({ default: m.FreeChatOverlay })),
);

function DsaMusicBridge() {
  const { scene, dsaAdventureOpen, dsaBeat } = useGame();
  const { setOverride, activeOverride } = useMusic();
  useEffect(() => {
    const inTavern = dsaAdventureOpen && !!dsaBeat && dsaBeat.startsWith("s2");
    const inDsa = scene === "commonRoomE67" || dsaAdventureOpen;
    const inCafeteria = scene === "cafeteriaE67";
    const inPub = scene === "pub" || scene === "pubToilet";
    const inE71Nerds = scene === "commonRoomE71";
    const target = inTavern
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
    // „sectorThreshold" ist ein Play-Once-Override, der sich selbst auflöst,
    // sobald der Song zu Ende ist. Bis dahin nicht überschreiben — sonst
    // würde z. B. der Wechsel in „passage" (target=null) den Song abbrechen.
    if (activeOverride === "sectorThreshold" && target === null) return;
    setOverride(target);
  }, [scene, dsaAdventureOpen, dsaBeat, setOverride, activeOverride]);
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
    almanachOpen,
    closeAlmanach,
    idCardOpen,
    closeIdCard,
  } = useGame();
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
    terminalOpen || nodeOpen || dsaCreatorOpen || dsaAdventureOpen;
  return (
    <>
    <MobileStage uprightOnPortrait={consoleOpen}>
      <div className="flex h-screen flex-col overflow-hidden bg-bureaucracy mobile-stage-host">
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
            <ToiletWallOverlay />
            <Ending />
            <Act2BridgeCutscene />
            <SectorThresholdCutscene />
            <PauseMenu open={pauseOpen} onClose={handleClosePause} />
            <Suspense fallback={null}>
              {terminalOpen && <Terminal />}
              {dsaCreatorOpen && <DsaCharacterCreator />}
              {dsaAdventureOpen && <DsaAdventureScene />}
              {handbookOpen && (
                <HandbookOverlay open={handbookOpen} onClose={closeHandbook} />
              )}
              {almanachOpen && (
                <AlmanachOverlay open={almanachOpen} onClose={closeAlmanach} />
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
          </div>
        </main>
        <Inventory />
      </div>
    </MobileStage>
      {dev && <RoomSwitcher />}
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