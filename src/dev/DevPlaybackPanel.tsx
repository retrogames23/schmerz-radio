import { setPaused, usePaused, requestStep } from "./devPlaybackState";

/**
 * Kleines Wiedergabe-Panel im Dev-Mode: Pause + Schritt zurück / vor.
 *
 * Wirkt auf alle Overlays, die `usePaused()` / `useDevStep()` integrieren:
 * `TextOverlay`, `DialogOverlay`, `Act2BridgeCutscene`, `Ending`.
 * Auto-Advance-Timer halten an, solange Pause aktiv ist; „Zurück" springt
 * im jeweils aktiven Overlay einen Schritt (Dialog: eine Zeile; Cutscenes
 * / Text-Overlay: einen Beat / Tafel).
 */
export function DevPlaybackPanel() {
  const paused = usePaused();
  return (
    <div
      className="fixed bottom-4 right-20 z-[9998] flex items-center gap-1 rounded-sm border border-amber-glow/60 bg-background/85 px-1 py-1 font-mono-crt text-xs text-amber-glow shadow-lg"
      title="Dev · Wiedergabe"
    >
      <span className="pl-2 pr-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        dev
      </span>
      <button
        type="button"
        onClick={() => requestStep(-1)}
        title="Schritt zurück (Dialog/Cutscene)"
        className="rounded-sm px-2 py-1 hover:bg-amber-glow/15"
      >
        ◂◂
      </button>
      <button
        type="button"
        onClick={() => setPaused(!paused)}
        title={paused ? "Weiter" : "Pause"}
        className={
          "rounded-sm px-2 py-1 " +
          (paused
            ? "bg-amber-glow/15 amber-glow"
            : "hover:bg-amber-glow/15")
        }
      >
        {paused ? "▶" : "⏸"}
      </button>
      <button
        type="button"
        onClick={() => requestStep(1)}
        title="Schritt vor"
        className="rounded-sm px-2 py-1 hover:bg-amber-glow/15"
      >
        ▸▸
      </button>
    </div>
  );
}