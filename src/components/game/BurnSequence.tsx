import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep } from "@/audio/sfx";

/**
 * Fullscreen-Sequenz nach burn am Knoten 5610.
 * Beendet das Spiel NICHT — kehrt nach Ablauf in die Szene zurück.
 * Rotes Flackern, Alarm, harter Cut, dann Stille.
 */
export function BurnSequence() {
  const { burnSequence, endBurnSequence } = useGame();
  const { sfxVolume } = useSettings();
  const [step, setStep] = useState(0);
  const startedRef = useRef(false);

  // Skript-Lines. useMemo, damit die Identität stabil ist und der
  // Effect unten nicht bei jedem Render neu läuft (sonst werden alle
  // Timer wieder gecanceled, der startedRef-Guard verhindert den
  // Restart, und der Spieler bleibt auf Step 1 hängen).
  const steps = useMemo<
    { text: string; delay: number; tone: "warn" | "system" | "muted" }[]
  >(
    () => [
      { text: "── HARDWARE-RESET ──────────────────────────", delay: 0, tone: "warn" },
      { text: "PSU-1 :: ÜBERSPANNUNG", delay: 600, tone: "warn" },
      { text: "RAUCHMELDER SEKTOR 5/TECH :: ALARM", delay: 700, tone: "warn" },
      { text: "CARRIER-DAEMON :: SEGFAULT", delay: 700, tone: "warn" },
      { text: "», , ,", delay: 600, tone: "muted" },
      { text: "104,6 — KEIN TRÄGER", delay: 1100, tone: "system" },
      { text: "», , ,", delay: 1400, tone: "muted" },
    ],
    [],
  );

  useEffect(() => {
    if (!burnSequence) {
      setStep(0);
      startedRef.current = false;
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    setStep(0);

    let total = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((s, i) => {
      total += s.delay;
      timers.push(
        setTimeout(() => {
          setStep(i + 1);
          playBeep(0.6 * sfxVolume);
        }, total),
      );
    });
    // Halten am Ende, dann Sequenz schließen.
    const tail = 2400;
    timers.push(
      setTimeout(() => {
        endBurnSequence();
      }, total + tail),
    );
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [burnSequence, sfxVolume, endBurnSequence, steps]);

  if (!burnSequence) return null;

  const visible = steps.slice(0, step);

  return (
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center bg-black px-6 burn-overlay-flicker"
    >
      <div className="w-full max-w-2xl space-y-3 font-mono-crt text-center text-base sm:text-lg">
        {visible.map((s, i) => (
          <div
            key={i}
            className={
              s.tone === "warn"
                ? "text-destructive burn-line-pulse"
                : s.tone === "system"
                  ? "text-amber-glow amber-glow"
                  : "text-amber-glow/40"
            }
          >
            {s.text}
          </div>
        ))}
      </div>
    </div>
  );
}