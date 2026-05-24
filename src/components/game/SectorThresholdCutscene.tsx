import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/GameContext";
import { SECTOR_THRESHOLD_BEATS } from "@/game/cutscenes";
import { usePaused, useDevStep } from "@/dev/devPlaybackState";
import { useDevMode } from "@/dev/devMode";
import { useMusic } from "@/audio/MusicPlayer";
import beat1 from "@/assets/cutscene-sector-1.jpg";
import beat2 from "@/assets/cutscene-sector-2.jpg";
import beat3 from "@/assets/cutscene-sector-3.jpg";
import beat4 from "@/assets/cutscene-sector-4.jpg";

/**
 * Cutscene an der Schleuse zwischen E67-Lobby und Verbindungsgang.
 * Ablauf an die Sanitäter-Cutscene angelehnt: pro Beat ein Vollbild mit
 * dezenter Ken-Burns-Bewegung, darunter ein Untertitel-Balken, der Zeile
 * für Zeile vorrückt. Klick / Enter / Esc steuert manuell.
 */
const BEAT_IMAGES = [beat1, beat2, beat3, beat4];

/**
 * Pro Beat: Start- und Ziel-Transform (Ken-Burns). Werte sind
 * Translationen in % der eigenen Bildgröße + Skalierung.
 */
const BEAT_CAMERA: Array<{
  scale: [number, number];
  pan: [number, number, number, number]; // x0, y0, x1, y1
}> = [
  { scale: [1.04, 1.12], pan: [2, 1, -2, -1] }, // erstarrt vor der Tür
  { scale: [1.06, 1.14], pan: [0, 1, 0, -1] }, // Closeup
  { scale: [1.02, 1.10], pan: [4, 0, -4, 0] }, // Blick in die Gasse
  { scale: [1.05, 1.16], pan: [0, 2, 0, -2] }, // Schritt hinaus
];

const CROSSFADE_MS = 600;

function holdFor(text: string): number {
  return Math.max(2600, Math.min(7000, Math.round(text.length * 62 + 900)));
}

export function SectorThresholdCutscene() {
  const { cutscene, endCutscene, api } = useGame();
  const active = cutscene === "sectorThreshold";
  const dev = useDevMode();
  const paused = dev && usePaused();
  const { setOverride } = useMusic();

  const beats = SECTOR_THRESHOLD_BEATS;
  const [beatIdx, setBeatIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(-1);
  const [visible, setVisible] = useState(true);
  const finishedRef = useRef(false);

  // Override-Musik nur während die Cutscene aktiv ist.
  useEffect(() => {
    if (!active) return;
    setOverride("sectorThreshold");
    return () => setOverride(null);
  }, [active, setOverride]);

  // Reset bei Schließen.
  useEffect(() => {
    if (active) return;
    setBeatIdx(0);
    setLineIdx(-1);
    setVisible(true);
    finishedRef.current = false;
  }, [active]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (!api.hasFlag("sectorThresholdSeen")) api.setFlag("sectorThresholdSeen");
    if (!api.hasFlag("feetWontMove")) api.setFlag("feetWontMove");
    setOverride(null);
    endCutscene();
    api.goTo("passage");
  };

  // Manuelles Vorrücken: nächste Untertitel-Zeile oder nächster Beat.
  const advance = () => {
    const beat = beats[beatIdx];
    if (!beat) return;
    if (lineIdx < beat.lines.length - 1) {
      setLineIdx((i) => i + 1);
      return;
    }
    // letzte Zeile dieses Beats — auf nächsten Beat wechseln (mit Crossfade).
    if (beatIdx >= beats.length - 1) {
      finish();
      return;
    }
    setVisible(false);
    window.setTimeout(() => {
      setBeatIdx((b) => b + 1);
      setLineIdx(-1);
      setVisible(true);
    }, CROSSFADE_MS / 2);
  };

  // Auto-Advance: nach Lead-In erste Zeile zeigen, danach Zeile für Zeile
  // weiterspringen, am Ende des letzten Beats finish().
  useEffect(() => {
    if (!active) return;
    if (paused) return;
    const beat = beats[beatIdx];
    if (!beat) return;

    // Lead-In: erste Zeile nach 700 ms einblenden.
    if (lineIdx === -1) {
      const t = window.setTimeout(() => setLineIdx(0), 700);
      return () => window.clearTimeout(t);
    }

    const line = beat.lines[lineIdx];
    if (!line) return;
    const t = window.setTimeout(() => {
      if (lineIdx < beat.lines.length - 1) {
        setLineIdx((i) => i + 1);
      } else if (beatIdx < beats.length - 1) {
        setVisible(false);
        const t2 = window.setTimeout(() => {
          setBeatIdx((b) => b + 1);
          setLineIdx(-1);
          setVisible(true);
        }, CROSSFADE_MS / 2);
        // Cleanup über äußeres Cleanup mit erfasst.
        return () => window.clearTimeout(t2);
      } else {
        finish();
      }
    }, holdFor(line));
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, beatIdx, lineIdx, beats]);

  // Dev: Schritt zurück / vor.
  useDevStep((dir) => {
    if (!active) return;
    const beat = beats[beatIdx];
    if (!beat) return;
    if (dir === 1) {
      advance();
      return;
    }
    // Schritt zurück: eine Zeile zurück, ggf. auf vorherigen Beat (letzte Zeile).
    if (lineIdx > 0) {
      setLineIdx((i) => i - 1);
    } else if (beatIdx > 0) {
      const prev = beats[beatIdx - 1];
      setVisible(false);
      window.setTimeout(() => {
        setBeatIdx((b) => b - 1);
        setLineIdx(prev.lines.length - 1);
        setVisible(true);
      }, CROSSFADE_MS / 2);
    }
  });

  // Esc / Enter / Leertaste: Esc überspringt, Enter/Leertaste rückt vor.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, beatIdx, lineIdx]);

  if (!active) return null;

  const beat = beats[beatIdx];
  const image = BEAT_IMAGES[beatIdx] ?? BEAT_IMAGES[BEAT_IMAGES.length - 1];
  const cam = BEAT_CAMERA[beatIdx] ?? BEAT_CAMERA[BEAT_CAMERA.length - 1];
  const currentLine = lineIdx >= 0 ? beat.lines[lineIdx] : null;
  const beatKey = `beat-${beatIdx}`;

  // Gesamt-Beat-Dauer für Ken-Burns-Spring.
  const beatDurationSec = Math.max(
    5,
    (700 + beat.lines.reduce((s, l) => s + holdFor(l), 0)) / 1000,
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      onClick={advance}
      role="presentation"
    >
      {/* Bild-Bühne */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.img
              key={beatKey}
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              initial={{
                opacity: 0,
                scale: cam.scale[0],
                x: `${cam.pan[0]}%`,
                y: `${cam.pan[1]}%`,
              }}
              animate={{
                opacity: 1,
                scale: cam.scale[1],
                x: `${cam.pan[2]}%`,
                y: `${cam.pan[3]}%`,
              }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: CROSSFADE_MS / 1000, ease: "easeOut" },
                scale: {
                  type: "spring",
                  damping: 40,
                  stiffness: 18,
                  mass: 1.5,
                  duration: beatDurationSec,
                },
                x: {
                  type: "spring",
                  damping: 40,
                  stiffness: 18,
                  mass: 1.5,
                  duration: beatDurationSec,
                },
                y: {
                  type: "spring",
                  damping: 40,
                  stiffness: 18,
                  mass: 1.5,
                  duration: beatDurationSec,
                },
              }}
            />
          )}
        </AnimatePresence>

        {/* CRT-Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* Scanlines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Header (Ort) — leise oben links, analog zur Paramedics-Atmosphäre. */}
        {beat.header && (
          <div className="absolute left-4 top-4 font-mono-crt text-[10px] uppercase tracking-[0.3em] text-amber-glow/70 amber-glow">
            {beat.header}
          </div>
        )}

        {/* Skip-Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            finish();
          }}
          className="absolute right-4 top-4 rounded border border-amber-glow/40 bg-black/50 px-3 py-1.5 font-mono-crt text-xs text-amber-glow/80 transition-colors hover:bg-black/70 hover:text-amber-glow"
        >
          Überspringen ⏵⏵
        </button>
      </div>

      {/* Untertitel-Box */}
      <div className="relative h-[28%] min-h-[140px] border-t border-amber-glow/20 bg-black/85 px-6 py-5 sm:px-10">
        <AnimatePresence mode="wait">
          {currentLine && (
            <motion.div
              key={`${beatIdx}-${lineIdx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="mx-auto flex max-w-3xl flex-col gap-2"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.22 }}
                className="font-mono-crt text-xs uppercase tracking-[0.3em] text-amber-glow/60"
              >
                —
              </motion.div>
              <div className="font-mono-crt text-base italic text-amber-glow/85 sm:text-lg">
                {currentLine}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
