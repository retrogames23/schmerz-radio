import { useEffect, useState } from "react";
import { GameProvider } from "@/game/GameContext";
import { SettingsProvider } from "@/audio/SettingsContext";
import { MusicPlayer } from "@/audio/MusicPlayer";
import { unlockAudio } from "@/audio/sfx";
import { preloadVoices } from "@/audio/speech";
import { SceneView } from "./SceneView";
import { TopBar } from "./TopBar";
import { Inventory } from "./Inventory";
import { TextOverlay } from "./TextOverlay";
import { DialogOverlay } from "./DialogOverlay";
import { RadioPanel } from "./RadioPanel";
import { Terminal } from "./Terminal";
import { Ending } from "./Ending";
import { TitleScreen } from "./TitleScreen";
import { PauseMenu } from "./PauseMenu";

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
        <TitleScreen
          onStart={() => {
            unlockAudio();
            preloadVoices();
            setStarted(true);
          }}
        />
      </SettingsProvider>
    );

  return (
    <SettingsProvider>
      <GameProvider>
        <MusicPlayer />
        <div className="flex min-h-screen flex-col bg-bureaucracy">
          <TopBar onOpenPause={() => setPauseOpen(true)} />
          <main className="relative flex-1 px-2 py-3 sm:px-4">
            <div className="relative">
              <SceneView />
              <TextOverlay />
              <DialogOverlay />
              <RadioPanel />
              <Terminal />
              <Ending />
              <PauseMenu open={pauseOpen} onClose={() => setPauseOpen(false)} />
            </div>
          </main>
          <Inventory />
        </div>
      </GameProvider>
    </SettingsProvider>
  );
}