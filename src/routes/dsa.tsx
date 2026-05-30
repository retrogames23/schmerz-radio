import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { SettingsProvider, useSettings } from "@/audio/SettingsContext";
import { MusicPlayer, useMusic } from "@/audio/MusicPlayer";

/**
 * Layout-Route für die Standalone-DSA-Tafelrunde. Mountet die
 * Audio-Infrastruktur (für Mood-Pool im Abenteuer-Overlay), liefert
 * aber bewusst KEINEN `GameProvider`, KEIN E67-Inventar, KEIN Stammspiel.
 */
export const Route = createFileRoute("/dsa")({
  component: DsaLayout,
});

function DsaLayout() {
  return (
    <SettingsProvider>
      <MusicPlayer>
        <DsaStandaloneMusicBridge />
        <MusicToggle />
        <Outlet />
      </MusicPlayer>
    </SettingsProvider>
  );
}

function MusicToggle() {
  const { musicEnabled, toggleMusic } = useSettings();
  return (
    <button
      onClick={toggleMusic}
      title={musicEnabled ? "Musik ausschalten" : "Musik einschalten"}
      className="fixed top-4 right-4 z-[80] flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-sm text-white/90 backdrop-blur-sm transition-colors hover:bg-black/80"
    >
      {musicEnabled ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <span className="hidden sm:inline">Musik an</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          <span className="hidden sm:inline">Musik aus</span>
        </>
      )}
    </button>
  );
}

/**
 * Standalone-DSA hat keinen GameShell/Szenen-State. Wir setzen daher
 * den "Gemeinschaftsraum"-Override (dsaTable), solange der Spieler auf
 * /dsa/* ist und keine Tafelrunde offen ist. Der Mood-Pool der
 * Tafelrunde gewinnt darüber, sobald sie startet, und fällt nach dem
 * Schließen automatisch wieder auf diesen Override zurück.
 */
function DsaStandaloneMusicBridge() {
  const { setOverride } = useMusic();
  useEffect(() => {
    setOverride("dsaTable");
    return () => {
      setOverride(null);
    };
  }, [setOverride]);
  return null;
}