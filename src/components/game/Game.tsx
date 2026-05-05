import { Suspense, lazy, useState } from "react";
import { SettingsProvider } from "@/audio/SettingsContext";
import { unlockAudio } from "@/audio/sfx";
import { preloadVoices } from "@/audio/speech";
import { TitleScreen } from "./TitleScreen";
import { MobileStage } from "./MobileStage";

// Schweres Spiel-Bundle (Provider, alle Overlays, Szenen) erst laden,
// nachdem der Spieler "Spiel beginnen" geklickt hat. Dadurch erscheint
// der Titelbildschirm in der Dev-Preview sofort statt nach ~30 s
// Vite-Transform-Zeit.
const GameShell = lazy(() => import("./GameShell"));

export function Game() {
  const [started, setStarted] = useState(false);

  if (!started) {
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
  }

  return (
    <Suspense fallback={null}>
      <GameShell />
    </Suspense>
  );
}
