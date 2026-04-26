import { useEffect, useState } from "react";
import { GameProvider } from "@/game/GameContext";
import { InventoryDragProvider } from "@/game/InventoryDragContext";
import { SettingsProvider } from "@/audio/SettingsContext";
import { MusicPlayer } from "@/audio/MusicPlayer";
import { unlockAudio } from "@/audio/sfx";
import { preloadVoices } from "@/audio/speech";
import { SceneView } from "./SceneView";
import { TopBar } from "./TopBar";
import { Inventory, DragCursorLayer } from "./Inventory";
import { TextOverlay } from "./TextOverlay";
import { DialogOverlay } from "./DialogOverlay";
import { RadioPanel } from "./RadioPanel";
import { Terminal } from "./Terminal";
import { Keypad } from "./Keypad";
import { Television } from "./Television";
import { NodeTerminal } from "./NodeTerminal";
import { BurnSequence } from "./BurnSequence";
import { ParamedicsCutscene } from "./ParamedicsCutscene";
import { Ending } from "./Ending";
import { TitleScreen } from "./TitleScreen";
import { PauseMenu } from "./PauseMenu";
import { MobileStage } from "./MobileStage";
import { DsaCharacterCreator } from "./DsaCharacterCreator";
import { DsaAdventureScene } from "./DsaAdventureScene";
import { DsaCharacterSheet } from "./DsaCharacterSheet";
import { useMusic } from "@/audio/MusicPlayer";
import { useGame } from "@/game/GameContext";

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
    setOverride(inTavern ? "dsaTavern" : inDsa ? "dsaTable" : null);
  }, [scene, dsaAdventureOpen, dsaBeat, setOverride]);
  return null;
}

export function Game() {
  const [started, setStarted] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);

  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPauseOpen((v) => !v);
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
            <GameStage pauseOpen={pauseOpen} setPauseOpen={setPauseOpen} />
            <DragCursorLayer />
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
}: {
  pauseOpen: boolean;
  setPauseOpen: (v: boolean) => void;
}) {
  const {
    terminalOpen,
    nodeOpen,
    dsaCreatorOpen,
    dsaAdventureOpen,
    dsaCharacter,
    toggleDsaSheet,
  } = useGame();

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
        <TopBar onOpenPause={() => setPauseOpen(true)} />
        <main className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-2 sm:px-4">
          <div className="relative flex h-full w-full items-center justify-center">
            <SceneView />
            <TextOverlay />
            <DialogOverlay />
            <RadioPanel />
            <Terminal />
            <Keypad />
            <Television />
            <NodeTerminal />
            <BurnSequence />
            <ParamedicsCutscene />
            <DsaCharacterCreator />
            <DsaAdventureScene />
            <DsaCharacterSheet />
            <DsaMusicBridge />
            <Ending />
            <PauseMenu open={pauseOpen} onClose={() => setPauseOpen(false)} />
          </div>
        </main>
        <Inventory />
      </div>
    </MobileStage>
  );
}