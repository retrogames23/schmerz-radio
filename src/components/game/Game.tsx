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
            <MobileStage>
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
                  <Ending />
                  <PauseMenu open={pauseOpen} onClose={() => setPauseOpen(false)} />
                </div>
              </main>
              <Inventory />
            </div>
            </MobileStage>
            <DragCursorLayer />
          </InventoryDragProvider>
        </GameProvider>
      </MusicPlayer>
    </SettingsProvider>
  );
}