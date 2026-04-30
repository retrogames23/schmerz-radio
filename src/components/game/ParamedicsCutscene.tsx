import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { useMusic } from "@/audio/MusicPlayer";
import { speak, stopSpeech } from "@/audio/speech";
import {
  PARAMEDICS_LINES,
  PARAMEDICS_PROTOCOL_ITEM,
  type ParamedicsLine,
  type ParamedicsSpeaker,
} from "@/game/cutscenes";
import beat0 from "@/assets/scene-apt-2613.jpg";
import beat1 from "@/assets/cutscene-paramedics-1.jpg";
import beat3 from "@/assets/cutscene-paramedics-3.jpg";
import beat4 from "@/assets/cutscene-paramedics-4.jpg";
import beat5 from "@/assets/cutscene-paramedics-5.jpg";
import beat6 from "@/assets/cutscene-paramedics-6.jpg";
import cutsceneMusic from "@/assets/cutscene-paramedics-music.mp3";

type Speaker = ParamedicsSpeaker;

/** Zeile mit berechneter Anzeige-/Halte-Dauer. */
interface Line extends ParamedicsLine {
  hold: number;
}

interface Pulse {
  /** wo an der Wand das Klopfen "sitzt" — in % der Bühne */
  x: number;
  y: number;
  /** Anzahl Pulse innerhalb des Beats */
  count: number;
  /** Abstand zwischen Pulsen in ms */
  intervalMs: number;
}

interface Beat {
  image: string;
  /** Ken-Burns: Skalierungs-Range */
  zoom: [number, number];
  /** [x0,y0,x1,y1] in % */
  pan: [number, number, number, number];
  leadIn?: number;
  tail?: number;
  lines: Line[];
  /** stille Beats: kein Untertitel, kein TTS, hält tail ms */
  silent?: boolean;
  /** Türbruch: Shake + Splitter */
  burst?: boolean;
  /** Klopf-Pulse an einer Wand-Position */
  pulse?: Pulse;
  /** sanftes Mikro-Shake während des ganzen Beats */
  microShake?: boolean;
  /** grüner Augen-Glow an Position (in %) */
  eyeGlow?: { x: number; y: number };
}

function holdFor(text: string, factor = 70): number {
  return Math.max(2400, Math.min(7000, Math.round(text.length * factor + 800)));
}

/**
 * Untertitel-Zeilen mit `hold`-Dauer aus den reinen Text-Daten anreichern.
 * `extraHoldByIndex` ergänzt einzelne Zeilen um zusätzliche Halte-Zeit
 * (z. B. für Atempausen vor besonders bedeutungsvollen Sätzen).
 */
function withHold(
  lines: ParamedicsLine[],
  extraHoldByIndex: Record<number, number> = {},
): Line[] {
  return lines.map((ln, i) => ({
    ...ln,
    hold: holdFor(ln.text) + (extraHoldByIndex[i] ?? 0),
  }));
}

function buildBeats(): Beat[] {
  return [
    // 0) NEU — stille Vorgeschichte in Philippes Wohnung 2613.
    {
      image: beat0,
      zoom: [1.05, 1.10],
      pan: [2, 0, -2, 0],
      lines: [],
      silent: true,
      tail: 3000,
      pulse: { x: 86, y: 50, count: 3, intervalMs: 750 },
      microShake: true,
    },
    // 1) Sanitäter & Techniker vor 2615.
    {
      image: beat1,
      zoom: [1.04, 1.12],
      pan: [0, 0, -2, -1],
      leadIn: 400,
      lines: withHold(PARAMEDICS_LINES[1]),
      tail: 200,
    },
    // 2) Tür birst auf.
    {
      image: beat3,
      zoom: [1.0, 1.18],
      pan: [0, 0, 0, 0],
      lines: withHold(PARAMEDICS_LINES[2]),
      tail: 300,
      burst: true,
    },
    // 3) Innen: ausgemergelter Mann klopft.
    {
      image: beat4,
      zoom: [1.02, 1.10],
      pan: [-2, 0, 2, -1],
      leadIn: 300,
      lines: withHold(PARAMEDICS_LINES[3]),
      tail: 200,
      pulse: { x: 88, y: 45, count: 5, intervalMs: 850 },
      microShake: true,
    },
    // 4) Close-up der grünen Augen.
    {
      image: beat5,
      zoom: [1.10, 1.28],
      pan: [0, 1, 0, -1],
      lines: withHold(PARAMEDICS_LINES[4]),
      tail: 400,
      eyeGlow: { x: 50, y: 42 },
    },
    // 5) Bergung & Protokoll-Übergabe.
    {
      image: beat6,
      zoom: [1.04, 1.10],
      pan: [-1, -1, 1, 1],
      // Beat 5: kleine Atempause nach „In Ordnung." (Index 4) und vor
      // dem SYSTEM-Schlusssatz (Index 5).
      lines: withHold(PARAMEDICS_LINES[5], { 4: 300, 5: 400 }),
      tail: 600,
    },
  ];
}

const CROSSFADE_MS = 600;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ─── Sub-Komponenten ────────────────────────────────────────────────

/** Klopf-Pulse: konzentrische Schockwellen aus einer Wand-Position. */
function KnockPulses({ pulse, beatKey }: { pulse: Pulse; beatKey: string }) {
  const rings = Array.from({ length: pulse.count });
  return (
    <div
      key={beatKey}
      className="pointer-events-none absolute"
      style={{
        left: `${pulse.x}%`,
        top: `${pulse.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {rings.map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.6, 2.0], opacity: [0, 0.55, 0] }}
          transition={{
            duration: 1.2,
            delay: (i * pulse.intervalMs) / 1000,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: (pulse.count * pulse.intervalMs) / 1000 + 0.3,
          }}
          className="absolute h-24 w-24 rounded-full border-2"
          style={{
            borderColor: "rgba(255, 220, 140, 0.55)",
            boxShadow: "0 0 30px rgba(255, 200, 100, 0.35)",
            left: -48,
            top: -48,
          }}
        />
      ))}
    </div>
  );
}

/** Holzsplitter, die einmalig aus der Türmitte wegfliegen. */
function DoorBurstParticles({ beatKey }: { beatKey: string }) {
  // deterministische Pseudo-Random aus dem Index (kein Math.random im Render)
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2 + (i % 3) * 0.4;
        const dist = 180 + (i * 37) % 140;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist + (i % 2 === 0 ? 80 : 40), // leichter Fall nach unten
          rot: ((i * 73) % 360) - 180,
          size: 6 + (i % 4) * 3,
        };
      }),
    [],
  );
  return (
    <div
      key={beatKey}
      className="pointer-events-none absolute"
      style={{ left: "62%", top: "55%" }}
    >
      {/* Weißer Blitz */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed inset-0 -z-0 bg-white"
        style={{ left: 0, top: 0 }}
      />
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.45,
            background:
              "linear-gradient(180deg, #6b4a2b 0%, #3a2614 100%)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.6)",
          }}
        />
      ))}
    </div>
  );
}

/** Grüner Augen-Glow, atmet langsam. */
function EyeGlow({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.45, 0.25, 0.45] }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      className="pointer-events-none absolute h-[40%] w-[55%]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        background:
          "radial-gradient(ellipse at center, rgba(80, 255, 160, 0.55) 0%, rgba(40, 200, 120, 0.2) 35%, transparent 65%)",
        mixBlendMode: "screen",
        filter: "blur(8px)",
      }}
    />
  );
}

/** Kurzer Flicker einer Neonröhre beim Beat-Eintritt. */
function NeonFlicker({ beatKey }: { beatKey: string }) {
  return (
    <motion.div
      key={beatKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.25, 0, 0.18, 0, 0.08, 0] }}
      transition={{ duration: 0.55, ease: "linear", times: [0, 0.1, 0.2, 0.35, 0.5, 0.7, 1] }}
      className="pointer-events-none absolute inset-0 bg-white"
    />
  );
}

export function ParamedicsCutscene() {
  const { cutscene, endCutscene, api } = useGame();
  const { sfxVolume, musicVolume, musicEnabled } = useSettings();
  const music = useMusic();
  const beats = useMemo(buildBeats, []);
  const [beatIdx, setBeatIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(-1);
  const [visible, setVisible] = useState(true);
  const [shakeNonce, setShakeNonce] = useState(0);
  const startedRef = useRef(false);
  const cancelledRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[] | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicFadeTimerRef = useRef<number | null>(null);

  const active = cutscene === "paramedics";

  useEffect(() => {
    if (!musicAudioRef.current) return;
    const target = musicEnabled ? clamp01(musicVolume * 0.55) : 0;
    if (musicFadeTimerRef.current == null) {
      musicAudioRef.current.volume = target;
    }
  }, [musicVolume, musicEnabled]);

  useEffect(() => {
    if (!active) {
      cancelledRef.current = true;
      stopSpeech();
      if (timersRef.current) {
        for (const t of timersRef.current) clearTimeout(t);
        timersRef.current = null;
      }
      stopCutsceneMusic();
      music.resume();
      startedRef.current = false;
      setBeatIdx(0);
      setLineIdx(-1);
      setVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active) return;
    if (startedRef.current) return;
    startedRef.current = true;
    cancelledRef.current = false;

    music.pause();
    startCutsceneMusic();

    const timers: ReturnType<typeof setTimeout>[] = [];
    timersRef.current = timers;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timers.push(t);
      });

    void (async () => {
      for (const [bi, beat] of beats.entries()) {
        if (cancelledRef.current) return;

        if (bi !== 0) {
          setVisible(false);
          await wait(CROSSFADE_MS / 2);
          if (cancelledRef.current) return;
          setBeatIdx(bi);
          setLineIdx(-1);
          setVisible(true);
          await wait(CROSSFADE_MS / 2);
        }

        // Türbruch: Shake-Trigger
        if (beat.burst) {
          setShakeNonce((n) => n + 1);
        }

        await wait(beat.leadIn ?? 200);

        if (beat.silent) {
          // Stiller Beat: kein TTS, halte tail.
          await wait(beat.tail ?? 2500);
          continue;
        }

        for (const [li, ln] of beat.lines.entries()) {
          if (cancelledRef.current) return;
          setLineIdx(li);
          const startedAt = performance.now();
          await speak(ln.speaker, ln.speech ?? ln.text, sfxVolume);
          if (cancelledRef.current) return;
          const remainingHold = ln.hold - (performance.now() - startedAt);
          if (remainingHold > 0) await wait(remainingHold);
        }

        await wait(beat.tail ?? 200);
      }

      if (cancelledRef.current) return;
      setVisible(false);
      await wait(CROSSFADE_MS);
      if (cancelledRef.current) return;
      finish();
    })();

    return () => {
      for (const t of timers) clearTimeout(t);
      timersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const finish = () => {
    cancelledRef.current = true;
    stopSpeech();
    if (timersRef.current) {
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current = null;
    }
    fadeOutAndStopCutsceneMusic();
    music.resume();
    api.setFlag("doorBrokenOpen");
    api.setFlag("paramedicsCutsceneSeen");
    if (!api.hasFlag("protocolReceived")) {
      api.setFlag("protocolReceived");
      api.addItem({
        id: "protocol",
        name: PARAMEDICS_PROTOCOL_ITEM.name,
        description: PARAMEDICS_PROTOCOL_ITEM.description,
      });
      api.setKnowledge("responsibilityE67");
      api.setFlag("elevatorMaintBlocked");
    }
    endCutscene();
    api.goTo("hallway");
  };

  function musicTargetVolume(): number {
    if (!musicEnabled) return 0;
    return clamp01(musicVolume * 0.55);
  }

  function startCutsceneMusic() {
    if (musicAudioRef.current) return;
    const a = new Audio(cutsceneMusic);
    a.loop = true;
    a.volume = 0;
    musicAudioRef.current = a;
    void a.play().catch(() => {});
    const target = musicTargetVolume();
    const startedAt = performance.now();
    const duration = 1200;
    if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
    musicFadeTimerRef.current = window.setInterval(() => {
      if (!musicAudioRef.current) {
        if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
        musicFadeTimerRef.current = null;
        return;
      }
      const t = Math.min(1, (performance.now() - startedAt) / duration);
      musicAudioRef.current.volume = clamp01(target * t);
      if (t >= 1) {
        if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
        musicFadeTimerRef.current = null;
      }
    }, 50);
  }

  function fadeOutAndStopCutsceneMusic() {
    const audio = musicAudioRef.current;
    if (!audio) return;
    const startVol = audio.volume;
    const startedAt = performance.now();
    const duration = 700;
    if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
    musicFadeTimerRef.current = window.setInterval(() => {
      if (!musicAudioRef.current) {
        if (musicFadeTimerRef.current) window.clearInterval(musicFadeTimerRef.current);
        musicFadeTimerRef.current = null;
        return;
      }
      const t = Math.min(1, (performance.now() - startedAt) / duration);
      musicAudioRef.current.volume = clamp01(startVol * (1 - t));
      if (t >= 1) {
        stopCutsceneMusic();
      }
    }, 50);
  }

  function stopCutsceneMusic() {
    if (musicFadeTimerRef.current) {
      window.clearInterval(musicFadeTimerRef.current);
      musicFadeTimerRef.current = null;
    }
    const audio = musicAudioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      musicAudioRef.current = null;
    }
  }

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

  const beat = beats[beatIdx];
  const currentLine = lineIdx >= 0 ? beat.lines[lineIdx] : null;
  const beatKey = `beat-${beatIdx}`;

  // Ken-Burns-Werte für Endpunkt: einmalige Spring-Animation pro Beat.
  // Start = pan[0..1] + zoom[0], End = pan[2..3] + zoom[1].
  const startScale = beat.zoom[0];
  const endScale = beat.zoom[1];
  const startX = beat.pan[0];
  const startY = beat.pan[1];
  const endX = beat.pan[2];
  const endY = beat.pan[3];

  // Gesamt-Beat-Dauer (für Ken-Burns animate-Dauer als Estimate).
  const beatDurationSec =
    beat.silent
      ? (beat.tail ?? 2500) / 1000
      : Math.max(
          4,
          ((beat.leadIn ?? 200) +
            beat.lines.reduce((s, l) => s + l.hold, 0) +
            (beat.tail ?? 200)) /
            1000,
        );

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Bild + Effekte */}
      <motion.div
        className="relative flex-1 overflow-hidden"
        animate={
          beat.burst
            ? {
                x: [0, -8, 7, -5, 4, -2, 0],
                y: [0, 5, -4, 3, -2, 1, 0],
              }
            : beat.microShake
              ? { x: [0, -1.5, 1.5, -1, 1, 0], y: [0, 1, -1, 1.5, -1, 0] }
              : { x: 0, y: 0 }
        }
        transition={
          beat.burst
            ? { duration: 0.45, ease: "easeOut", times: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1] }
            : beat.microShake
              ? {
                  duration: 0.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.4,
                }
              : { duration: 0.2 }
        }
        // Re-trigger Shake beim Türbruch
        key={`stage-${beatIdx}-${shakeNonce}`}
      >
        <AnimatePresence mode="wait">
          {visible && (
            <motion.img
              key={beatIdx}
              src={beat.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              initial={{
                opacity: 0,
                scale: startScale,
                x: `${startX}%`,
                y: `${startY}%`,
              }}
              animate={{
                opacity: 1,
                scale: endScale,
                x: `${endX}%`,
                y: `${endY}%`,
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

        {/* Beat-spezifische Overlays */}
        {beat.pulse && <KnockPulses pulse={beat.pulse} beatKey={beatKey} />}
        {beat.eyeGlow && <EyeGlow x={beat.eyeGlow.x} y={beat.eyeGlow.y} />}
        {beat.burst && <DoorBurstParticles beatKey={`${beatKey}-${shakeNonce}`} />}

        {/* Neon-Flicker beim Beat-Eintritt */}
        <NeonFlicker beatKey={beatKey} />

        {/* CRT-Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              beat.eyeGlow
                ? "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)"
                : "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
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

        {/* Skip-Button */}
        <button
          type="button"
          onClick={finish}
          className="absolute right-4 top-4 rounded border border-amber-glow/40 bg-black/50 px-3 py-1.5 font-mono-crt text-xs text-amber-glow/80 transition-colors hover:bg-black/70 hover:text-amber-glow"
        >
          Überspringen ⏵⏵
        </button>
      </motion.div>

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
                {currentLine.speaker === "SYSTEM" ? "—" : currentLine.speaker}
              </motion.div>
              <div
                className={
                  currentLine.speaker === "SYSTEM"
                    ? "font-mono-crt text-base italic text-amber-glow/70 sm:text-lg"
                    : "font-mono-crt text-lg text-amber-glow sm:text-xl"
                }
              >
                {currentLine.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
