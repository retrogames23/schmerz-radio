import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { GameProvider } from "@/game/GameContext";
import { InventoryDragProvider } from "@/game/InventoryDragContext";
import { SettingsProvider } from "@/audio/SettingsContext";
import { MusicPlayer } from "@/audio/MusicPlayer";
import { unlockAudio } from "@/audio/sfx";
import { preloadVoices } from "@/audio/speech";
import { SceneView } from "./SceneView";
import { TopBar } from "./TopBar";
import { Inventory, DragCursorLayer } from "./Inventory";
import { ActiveItemBanner } from "./ActiveItemBanner";
import { TextOverlay } from "./TextOverlay";
import { DialogOverlay } from "./DialogOverlay";
import { RadioPanel } from "./RadioPanel";
import { Keypad } from "./Keypad";
import { Television } from "./Television";
import { NodeTerminal } from "./NodeTerminal";
import { BurnSequence } from "./BurnSequence";
import { ParamedicsCutscene } from "./ParamedicsCutscene";
import { Act2BridgeCutscene } from "./Act2BridgeCutscene";
import { Ending } from "./Ending";
import { TitleScreen } from "./TitleScreen";
import { PauseMenu } from "./PauseMenu";
import { MobileStage } from "./MobileStage";
import { DsaCharacterSheet } from "./DsaCharacterSheet";
import type { HelpTab } from "./HelpOverlay";
import { IdCardOverlay } from "./IdCardOverlay";
import { LobbyGate } from "./LobbyGate";
import { PneumaticTubeOverlay } from "./PneumaticTubeOverlay";
import { ParagraphenNotizbuchOverlay } from "./ParagraphenNotizbuchOverlay";
import { FreeChatOverlay } from "./FreeChatOverlay";
import { PubOverlay } from "./PubOverlay";
import { RoomSwitcher } from "@/dev/RoomSwitcher";
import { ConsoleSwitcher } from "@/dev/ConsoleSwitcher";
import { OverlayQAOverlay } from "@/dev/OverlayQAOverlay";
import { useDevMode } from "@/dev/devMode";
import { ToiletWallOverlay } from "./ToiletWallOverlay";
import { useMusic } from "@/audio/MusicPlayer";
import { useGame } from "@/game/GameContext";
import { DonationGate } from "@/components/donation/DonationGate";

/* ─── Lazy-geladene Overlays ──────────────────────────────────────
 * Diese Komponenten sind groß (200-2000+ LOC) und nur sichtbar, wenn
 * der Spieler ein bestimmtes Element aktiviert. Wir laden sie erst
 * beim ersten Öffnen, damit das initiale JS-Bundle klein bleibt.
 * Re-Export-Form (`{ default: m.Foo }`), weil die Overlays als
 * Named-Exports geschrieben sind.
 */
const Terminal = lazy(() =>
  import("./Terminal").then((m) => ({ default: m.Terminal })),
);
const DsaCharacterCreator = lazy(() =>
  import("./DsaCharacterCreator").then((m) => ({
    default: m.DsaCharacterCreator,
  })),
);
const DsaAdventureScene = lazy(() =>
  import("./DsaAdventureScene").then((m) => ({ default: m.DsaAdventureScene })),
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
const BureaucracyDuelOverlay = lazy(() =>
  import("./BureaucracyDuelOverlay").then((m) => ({
    default: m.BureaucracyDuelOverlay,
  })),
);

/**
 * Schaltet beim Betreten des DSA-Gemeinschaftsraums (oder solange das
 * Abenteuer-Overlay offen ist) auf den Tavernen-Track um und stellt
 * danach die normale Playlist wieder her.
 */
function DsaMusicBridge() {
  const { scene, dsaAdventureOpen, dsaBeat } = useGame();
  const { setOverride } = useMusic();
  useEffect(() => {
    // Tavernen-Track NUR während Akt 2 (Wirtshaus „Zum durstigen Drachen“,
    // Beat-IDs beginnen mit „s2"). Im Gemeinschaftsraum E67 und in allen
    // anderen Abenteuer-Szenen läuft die ruhigere Tafelrunden-Musik.
    const inTavern = dsaAdventureOpen && !!dsaBeat && dsaBeat.startsWith("s2");
    const inDsa = scene === "commonRoomE67" || dsaAdventureOpen;
    const inCafeteria = scene === "cafeteriaE67";
    const inPub = scene === "pub" || scene === "pubToilet";
    setOverride(
      inTavern
        ? "dsaTavern"
        : inDsa
          ? "dsaTable"
          : inCafeteria
            ? "cafeteria"
            : inPub
              ? "pub"
              : null,
    );
  }, [scene, dsaAdventureOpen, dsaBeat, setOverride]);
  return null;
}

export function Game() {
  const [started, setStarted] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState<false | HelpTab>(false);

  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPauseOpen((v) => !v);
      if (e.key === "F1") {
        e.preventDefault();
        setHelpOpen((v) => (v ? false : "cheatsheet"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started]);

  if (!started)
    return (
      <SettingsProvider>
        <MobileStage>
          <TitleScreen
          onStart={() => {
            unlockAudio();
            preloadVoices();
            setStarted(true);
          }}
          />
        </MobileStage>
      </SettingsProvider>
    );

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

/**
 * Innerer Wrapper, der innerhalb des GameProvider lebt — so können wir
 * `terminalOpen`/`nodeOpen` lesen und der MobileStage signalisieren,
 * dass sie im Hochformat NICHT rotieren soll (Tastatur-freundlich).
 */
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

  // Stabile Handler-Referenzen für die memoizierten Kinder (TopBar etc.).
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

  // Tastenkürzel C: Charakterbogen ein-/ausblenden — nur wenn ein
  // Charakter existiert und gerade kein anderes textlastiges Modal
  // aktiv ist (Terminal/Charakter-Erstellung/Abenteuer-Beat eingeben).
  useEffect(() => {
    if (!dsaCharacter) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "c" && e.key !== "C") return;
      // Nicht abfangen, wenn der Spieler in einem Eingabefeld tippt.
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      // Nicht öffnen, während andere Vollbild-Overlays aktiv sind.
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
  // Im Hochformat NICHT rotieren, wenn ein textlastiges Overlay sichtbar
  // ist: Terminal-Konsolen ODER die DSA-Charaktererstellung / das
  // DSA-Abenteuer (sonst läuft der Erzähltext seitwärts, siehe Mobile-Bug).
  const consoleOpen =
    terminalOpen || nodeOpen || dsaCreatorOpen || dsaAdventureOpen;
  return (
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
            <NodeTerminal />
            <BurnSequence />
            <ParamedicsCutscene />
            <DsaCharacterSheet />
            <DsaMusicBridge />
            <IdCardOverlay open={idCardOpen} onClose={closeIdCard} />
            <LobbyGate />
            <PneumaticTubeOverlay />
            <ParagraphenNotizbuchOverlay />
            <FreeChatOverlay />
            <PubOverlay />
            <ToiletWallOverlay />
            <Ending />
            <Act2BridgeCutscene />
            <PauseMenu open={pauseOpen} onClose={handleClosePause} />
            {/* Lazy-Overlays: Komponente erst gemounted (= Chunk geladen),
                wenn der entsprechende Open-State true ist. So schlummert
                z. B. der 2000-Zeilen-Terminal-Code bis zum ersten Öffnen. */}
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
              <BureaucracyDuelGate />
            </Suspense>
          </div>
        </main>
        <Inventory />
      </div>
      {dev && <RoomSwitcher />}
      {dev && <ConsoleSwitcher />}
      {dev && <OverlayQAOverlay />}
    </MobileStage>
  );
}

/**
 * Kleiner Gate-Wrapper für das Bürokratie-Duell-Overlay: liest selbst
 * `duelOpen` aus dem GameContext, damit das schwere Modul erst beim
 * Öffnen geladen wird, ohne dass `GameStage` den State bei jeder
 * Interaktion neu prüfen muss.
 */
function BureaucracyDuelGate() {
  const { duelOpen } = useGame();
  if (!duelOpen) return null;
  return <BureaucracyDuelOverlay />;
}