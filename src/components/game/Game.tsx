import { Suspense, lazy, useEffect, useState } from "react";
import { SettingsProvider } from "@/audio/SettingsContext";
import { unlockAudio } from "@/audio/sfx";
import { preloadVoices } from "@/audio/speech";
import { TitleScreen } from "./TitleScreen";
import { MobileStage } from "./MobileStage";

// Schweres Spiel-Bundle (Provider, alle Overlays, Szenen) erst laden,
// nachdem der Spieler "Spiel beginnen" geklickt hat. Dadurch erscheint
// der Titelbildschirm in der Dev-Preview sofort statt nach ~30 s
// Vite-Transform-Zeit.
const loadGameShell = () => import("./GameShell");
const GameShell = lazy(loadGameShell);

export function Game() {
  const [started, setStarted] = useState(false);

  // GameShell-Bundle bereits im Hintergrund vorladen, während der
  // Titelbildschirm sichtbar ist. So ist es beim Klick auf
  // "Spiel beginnen" idealerweise schon im Cache und der schwarze
  // Übergangs-Screen entfällt.
  useEffect(() => {
    if (!started) {
      void loadGameShell();
    }
  }, [started]);

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
    <Suspense fallback={<GameLoading />}>
      <GameShell />
    </Suspense>
  );
}

function GameLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black text-amber-200">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-200/30 border-t-amber-200" />
      <p className="font-mono text-sm tracking-widest opacity-70">
        SCHMERZ-RADIO LÄDT…
      </p>
    </div>
  );
}
