import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import {
  SECTOR_THRESHOLD_BEATS,
  SECTOR_THRESHOLD_UI_TEXT,
} from "@/game/cutscenes";
import { useDevMode } from "@/dev/devMode";
import { useEditActive } from "@/dev/dialogPatchState";
import {
  applyTextPatch,
  setTextLine,
  useTextPatchTick,
  clearTextPatch,
  getTextPatch,
} from "@/dev/textPatchState";
import { usePaused, useDevStep } from "@/dev/devPlaybackState";
import { useMusic } from "@/audio/MusicPlayer";

/**
 * Cutscene an der Schleuse zwischen E67-Lobby und Verbindungsgang.
 * Wird ausgelöst, wenn Layard das erste Mal nach Entriegelung der Schleusentür
 * den Türen-Hotspot anklickt. Endet mit `api.goTo("passage")`.
 *
 * Optisch parallel zu `Act2BridgeCutscene` (schwarze Tafeln, Phosphor-Header,
 * Crossfade) — und damit anschlussfähig an die Anmutung von `sectorDoor` und
 * `passage`. Während der Cutscene läuft der Override-Track „The City Forgets".
 */
export function SectorThresholdCutscene() {
  const { cutscene, endCutscene, api } = useGame();
  const active = cutscene === "sectorThreshold";
  const dev = useDevMode();
  const editActiveRaw = useEditActive();
  const editing = dev && editActiveRaw;
  const paused = dev && usePaused();
  useTextPatchTick();
  const { setOverride } = useMusic();

  const beats = SECTOR_THRESHOLD_BEATS;
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const finishedRef = useRef(false);

  // Override-Musik nur, solange die Cutscene aktiv ist.
  useEffect(() => {
    if (!active) return;
    setOverride("sectorThreshold");
    return () => setOverride(null);
  }, [active, setOverride]);

  // Reset bei Schließen.
  useEffect(() => {
    if (active) return;
    setIdx(0);
    setVisible(true);
    finishedRef.current = false;
  }, [active]);

  // Auto-Advance pro Beat: 3.4 s Sockel + 1.6 s pro Zeile.
  useEffect(() => {
    if (!active) return;
    if (idx >= beats.length) return;
    if (editing) return;
    if (paused) return;
    const beat = beats[idx];
    const hold = 3400 + beat.lines.length * 1600;
    const t = window.setTimeout(() => {
      setVisible(false);
      const t2 = window.setTimeout(() => {
        setIdx((i) => i + 1);
        setVisible(true);
      }, 350);
      return () => window.clearTimeout(t2);
    }, hold);
    return () => window.clearTimeout(t);
  }, [active, idx, beats, editing, paused]);

  // Dev: Schritt zurück / vor.
  useDevStep((dir) => {
    if (!active) return;
    if (dir === -1) setIdx((i) => Math.max(0, i - 1));
    else setIdx((i) => Math.min(beats.length, i + 1));
    setVisible(true);
  });

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (!api.hasFlag("sectorThresholdSeen")) api.setFlag("sectorThresholdSeen");
    if (!api.hasFlag("feetWontMove")) api.setFlag("feetWontMove");
    setOverride(null);
    endCutscene();
    api.goTo("passage");
  };

  // Cutscene beenden, wenn alle Beats durch sind.
  useEffect(() => {
    if (!active) return;
    if (idx < beats.length) return;
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, idx, beats]);

  // Esc / Enter überspringen.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;
  if (idx >= beats.length) return null;

  const beat = beats[idx];
  const displayedLines = applyTextPatch(beat.lines);
  const patched = !!getTextPatch(beat.lines);

  const accentClass =
    beat.style === "amber"
      ? "before:bg-amber-glow/[0.04]"
      : beat.style === "clinical"
        ? "before:bg-foreground/[0.03]"
        : "before:bg-transparent";

  return (
    <div
      className={`absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black px-6 text-center before:pointer-events-none before:absolute before:inset-0 before:content-[''] ${accentClass}`}
      onClick={editing ? undefined : () => setIdx((i) => i + 1)}
      role="presentation"
    >
      {visible && (
        <div key={idx} className="slow-fade-in mx-auto max-w-2xl space-y-4">
          {beat.header && (
            <div className="mb-6 font-mono-crt text-xs uppercase tracking-[0.4em] text-amber-glow/70 amber-glow">
              {beat.header}
            </div>
          )}
          {editing ? (
            <div
              className="space-y-2 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-amber-glow">
                <span>
                  Schleuse · Beat {idx + 1} / {beats.length}
                  {patched ? " · ✎" : ""}
                </span>
                {patched && (
                  <button
                    type="button"
                    onClick={() => clearTextPatch(beat.lines)}
                    className="rounded-sm border border-red-500/40 px-2 py-1 text-red-300 hover:bg-red-500/10"
                  >
                    Reset
                  </button>
                )}
              </div>
              {displayedLines.map((line, i) => (
                <textarea
                  key={i}
                  value={line}
                  onChange={(e) => setTextLine(beat.lines, i, e.target.value)}
                  rows={Math.max(2, Math.ceil(line.length / 60))}
                  className="w-full resize-y rounded-sm border border-amber-glow/40 bg-black/60 p-2 font-display text-base text-foreground"
                />
              ))}
            </div>
          ) : (
            displayedLines.map((line, i) => (
              <p
                key={i}
                className="font-display text-lg text-foreground sm:text-xl"
              >
                {line}
              </p>
            ))
          )}
        </div>
      )}
      <div className="absolute bottom-6 left-0 right-0 text-center font-mono-crt text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
        {SECTOR_THRESHOLD_UI_TEXT.skipHint}
      </div>
    </div>
  );
}