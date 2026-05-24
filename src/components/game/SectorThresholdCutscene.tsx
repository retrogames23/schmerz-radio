import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import beat1 from "@/assets/cutscene-sector-1.jpg";
import beat2 from "@/assets/cutscene-sector-2.jpg";
import beat3 from "@/assets/cutscene-sector-3.jpg";
import beat4 from "@/assets/cutscene-sector-4.jpg";

/**
 * Visuelle Ken-Burns-Bilder pro Beat. Reihenfolge entspricht
 * `SECTOR_THRESHOLD_BEATS` aus `cutscenes.ts`.
 *  1) Layard erstarrt vor der offenen Schleusentür.
 *  2) Closeup — innerer Monolog: Wer bin ich?
 *  3) Wider shot — Tür offen, Blick in die Gasse, Zögern.
 *  4) Schritt durch die Tür hinaus in die Abendkälte.
 */
const BEAT_IMAGES = [beat1, beat2, beat3, beat4];
const BEAT_PANS: Array<{ from: string; to: string; scaleFrom: number; scaleTo: number }> = [
  // Sanftes Eindringen auf das erstarrte Gesicht.
  { from: "52% 55%", to: "48% 50%", scaleFrom: 1.04, scaleTo: 1.12 },
  // Stilles Atmen am Closeup.
  { from: "50% 45%", to: "50% 50%", scaleFrom: 1.06, scaleTo: 1.14 },
  // Blick vom Türrahmen die Gasse hinunter.
  { from: "65% 55%", to: "45% 50%", scaleFrom: 1.02, scaleTo: 1.10 },
  // Folgt Layard sanft durch die Tür hinaus.
  { from: "50% 60%", to: "50% 45%", scaleFrom: 1.05, scaleTo: 1.14 },
];

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
    finishedRef.current = false;
  }, [active]);

  // Auto-Advance pro Beat: 4.0 s Sockel + 2.2 s pro Zeile (Bilder
  // brauchen etwas Atem, damit der Ken-Burns wirkt und der Text
  // ruhig gelesen werden kann).
  useEffect(() => {
    if (!active) return;
    if (idx >= beats.length) return;
    if (editing) return;
    if (paused) return;
    const beat = beats[idx];
    const hold = 4000 + beat.lines.length * 2200;
    const t = window.setTimeout(() => {
      setIdx((i) => i + 1);
    }, hold);
    return () => window.clearTimeout(t);
  }, [active, idx, beats, editing, paused]);

  // Dev: Schritt zurück / vor.
  useDevStep((dir) => {
    if (!active) return;
    if (dir === -1) setIdx((i) => Math.max(0, i - 1));
    else setIdx((i) => Math.min(beats.length, i + 1));
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
  const image = BEAT_IMAGES[idx] ?? BEAT_IMAGES[BEAT_IMAGES.length - 1];
  const pan = BEAT_PANS[idx] ?? BEAT_PANS[BEAT_PANS.length - 1];
  // Sockel + lineare Annäherung wie im Auto-Advance, damit die
  // Ken-Burns-Bewegung den Beat ausfüllt.
  const panDurationMs = 4000 + beat.lines.length * 2200;

  return (
    <div
      className="absolute inset-0 z-[60] overflow-hidden bg-black"
      onClick={editing ? undefined : () => setIdx((i) => i + 1)}
      role="presentation"
    >
      {/* Bild-Layer mit Crossfade + Ken-Burns */}
      <AnimatePresence>
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{
              scale: pan.scaleFrom,
              transformOrigin: pan.from,
            }}
            animate={{
              scale: pan.scaleTo,
              transformOrigin: pan.to,
            }}
            transition={{ duration: panDurationMs / 1000, ease: "linear" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
          {/* Vignette + sanfter Untertitel-Verlauf nach unten. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_180px_60px_rgba(0,0,0,0.65)]" />
        </motion.div>
      </AnimatePresence>

      {/* Header (Ort/Zeit) */}
      {beat.header && (
        <div className="absolute left-0 right-0 top-6 text-center font-mono-crt text-xs uppercase tracking-[0.4em] text-amber-glow/80 amber-glow">
          {beat.header}
        </div>
      )}

      {/* Untertitel-Block */}
      <div className="absolute inset-x-0 bottom-16 flex justify-center px-6">
        <div className="mx-auto w-full max-w-3xl space-y-3 text-center">
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
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="space-y-2"
            >
              {displayedLines.map((line, i) => (
                <p
                  key={i}
                  className="font-display text-base text-foreground/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-lg md:text-xl"
                >
                  {line}
                </p>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center font-mono-crt text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
        {SECTOR_THRESHOLD_UI_TEXT.skipHint}
      </div>
    </div>
  );
}