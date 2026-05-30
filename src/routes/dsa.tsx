import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { SettingsProvider } from "@/audio/SettingsContext";
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
        <Outlet />
      </MusicPlayer>
    </SettingsProvider>
  );
}

/**
 * Standalone-DSA hat keinen GameShell/Szenen-State. Wir setzen daher
 * den „Gemeinschaftsraum"-Override (dsaTable), solange der Spieler auf
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