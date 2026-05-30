import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SettingsProvider } from "@/audio/SettingsContext";
import { MusicPlayer } from "@/audio/MusicPlayer";

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
        <Outlet />
      </MusicPlayer>
    </SettingsProvider>
  );
}