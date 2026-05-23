/**
 * Dev-only Wiedergabe-Steuerung für Cutscenes / Text-Overlays / Dialoge.
 *
 * Stellt zwei Primitive bereit:
 *
 *  - `paused`: globaler Stop-Flag. Auto-Advance-Timer in `TextOverlay`,
 *    `Act2BridgeCutscene`, `Ending` etc. lesen `usePaused()` und stoppen
 *    ihre `setTimeout`-Ketten, solange die Pause aktiv ist.
 *
 *  - `requestStep(dir)`: One-Shot-Event („Schritt zurück / vor"). Das
 *    jeweils aktive Overlay hört per `useDevStep` zu und reagiert
 *    selbst — z.B. Idx -/+ 1, Dialog-Rewind über lokale History.
 *
 * Ziel: ein einziges kleines Panel kann sämtliche Wiedergabe-Quellen
 * pausieren und schrittweise steuern, ohne dass der Spiel-State um eine
 * weltweite Pause-Logik erweitert werden muss.
 */
import { useEffect, useState, useRef } from "react";

const PAUSE_EVT = "e67:dev-paused-change";
const STEP_EVT = "e67:dev-step";

let paused = false;

export function isPaused(): boolean {
  return paused;
}

export function setPaused(v: boolean) {
  paused = v;
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent(PAUSE_EVT));
}

export function togglePaused() {
  setPaused(!paused);
}

export function usePaused(): boolean {
  const [v, setV] = useState<boolean>(() => paused);
  useEffect(() => {
    const h = () => setV(paused);
    window.addEventListener(PAUSE_EVT, h);
    return () => window.removeEventListener(PAUSE_EVT, h);
  }, []);
  return v;
}

export type StepDir = -1 | 1;

export function requestStep(dir: StepDir) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STEP_EVT, { detail: { dir } }));
}

/**
 * Registriert einen Listener für Schritt-zurück/vor. Achtung: der Handler
 * wird via Ref aktuell gehalten, sodass er auf den jeweils neuesten
 * State zugreifen kann — der Effect re-bindet NICHT bei jedem Render.
 */
export function useDevStep(handler: (dir: StepDir) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const h = (e: Event) => {
      const dir = (e as CustomEvent).detail?.dir;
      if (dir === -1 || dir === 1) ref.current(dir);
    };
    window.addEventListener(STEP_EVT, h);
    return () => window.removeEventListener(STEP_EVT, h);
  }, []);
}