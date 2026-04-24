import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep, playUnlock } from "@/audio/sfx";

/**
 * Fullscreen-Sequenz nach burn/reroute am Knoten 5610.
 * Beendet das Spiel NICHT — kehrt nach Ablauf in die Szene zurück.
 *
 * Zwei Varianten:
 *  - "burn":    rotes Flackern, Alarm, harter Cut, dann Stille.
 *  - "reroute": blasses Amber, leise Kaskade, dann Echo-Hinweis.
 */
export function BurnSequence() {
  const { burnSequence, endBurnSequence } = useGame();
  const { sfxVolume } = useSettings();
  const [step, setStep] = useState(0);
  const startedRef = useRef(false);

  // Skript-Lines für jede Variante.
  const burnSteps: { text: string; delay: number; tone: "warn" | "system" | "muted" }[] = [
    { text: "── HARDWARE-RESET ──────────────────────────", delay: 0, tone: "warn" },
    { text: "PSU-1 :: ÜBERSPANNUNG", delay: 600, tone: "warn" },
    { text: "RAUCHMELDER SEKTOR 5/TECH :: ALARM", delay: 700, tone: "warn" },
    { text: "CARRIER-DAEMON :: SEGFAULT", delay: 700, tone: "warn" },
    { text: "», , ,", delay: 600, tone: "muted" },
    { text: "104,6 — KEIN TRÄGER", delay: 1100, tone: "system" },
    { text: "», , ,", delay: 1400, tone: "muted" },
  ];

  const rerouteSteps: { text: string; delay: number; tone: "warn" | "system" | "muted" }[] = [
    { text: "── ROUTING-TABELLE GELADEN ────────────────", delay: 0, tone: "system" },
    { text: "Ziel-IP :: 127.0.0.1", delay: 600, tone: "system" },
    { text: "carrier-daemon :: SIGHUP", delay: 700, tone: "system" },
    { text: "Knoten 5610 :: LOOPBACK", delay: 800, tone: "system" },
    { text: "104,6 — nur noch Echo.", delay: 1000, tone: "muted" },
  ];

  const steps = burnSequence === "burn" ? burnSteps : rerouteSteps;

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
          if (burnSequence === "burn") {
            playBeep(0.6 * sfxVolume);
          } else if (i === 0) {
            playUnlock(0.4 * sfxVolume);
          } else {
            playBeep(0.25 * sfxVolume);
          }
        }, total),
      );
    });
    // Halten am Ende, dann Sequenz schließen.
    const tail = burnSequence === "burn" ? 2400 : 1800;
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

  const isBurn = burnSequence === "burn";
  const visible = steps.slice(0, step);

  return (
    <div
      className={`absolute inset-0 z-[70] flex items-center justify-center px-6 ${
        isBurn ? "bg-black burn-overlay-flicker" : "bg-black"
      }`}
    >
      <div className="w-full max-w-2xl space-y-3 font-mono-crt text-center text-base sm:text-lg">
        {visible.map((s, i) => (
          <div
            key={i}
            className={
              s.tone === "warn"
                ? isBurn
                  ? "text-destructive burn-line-pulse"
                  : "text-amber-glow amber-glow"
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