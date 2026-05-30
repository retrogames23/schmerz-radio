import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SettingsProvider } from "@/audio/SettingsContext";
import { MusicPlayer } from "@/audio/MusicPlayer";

/**
 * Layout-Route für die Standalone-DSA-Tafelrunde. Mountet die
 * Audio-Infrastruktur (für Mood-Pool im Abenteuer-Overlay), liefert
 * aber bewusst KEINEN `GameProvider`, KEIN E67-Inventar, KEIN Stammspiel.
 */
export const Route = createFileRoute("/dsa")({
  head: () => ({
    meta: [
      { title: "DSA-Tafelrunde — WhisperQuest" },
      {
        name: "description",
        content:
          "Würfle einen Helden und spiel eine Stunde Tafelrunde mit dem KI-Meister Tjark. Drei Speicherplätze, ohne Umweg.",
      },
      {
        property: "og:title",
        content: "DSA-Tafelrunde — WhisperQuest",
      },
      {
        property: "og:description",
        content:
          "Eine Stunde DSA-Abenteuer im Stil der Schwarzen-Auge-Klassiker. Würfeln, kämpfen, überleben.",
      },
    ],
  }),
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