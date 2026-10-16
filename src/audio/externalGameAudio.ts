import { useSyncExternalStore } from "react";

/**
 * Läuft ein eingebettetes Fremdspiel (z. B. Homecomputer Tycoon am Amiga),
 * übernimmt dessen Sound: Hauptspielmusik pausiert, Player ist ausgeblendet.
 */
let active = false;
const listeners = new Set<() => void>();

export function setExternalGameAudio(on: boolean) {
  if (active === on) return;
  active = on;
  listeners.forEach((l) => l());
}

export function useExternalGameAudio(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => active,
    () => false,
  );
}
