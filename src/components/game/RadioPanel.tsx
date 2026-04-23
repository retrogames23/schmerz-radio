import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import {
  playDoorbell,
  playTuningClick,
  startResonanceDrone,
} from "@/audio/sfx";

const BANDS = [
  {
    from: 100.0,
    to: 101.9,
    label: "Angst / Panik",
    art: "Statisch, zitternd",
    style: "panic" as const,
    color: "bg-destructive",
  },
  {
    from: 102.0,
    to: 103.4,
    label: "Einsamkeit",
    art: "Dumpf, wogend",
    style: "lonely" as const,
    color: "bg-phosphor-dim",
  },
  {
    from: 103.5,
    to: 104.5,
    label: "Trauer",
    art: "Fließend, warm",
    style: "grief" as const,
    color: "bg-amber-glow/70",
  },
  {
    from: 104.6,
    to: 104.6,
    label: "Engel-Trauer",
    art: "Kristallklar, tief",
    style: "angel" as const,
    color: "bg-amber-glow",
  },
  {
    from: 105.0,
    to: 106.5,
    label: "Sehnsucht",
    art: "Pulsierend",
    style: "longing" as const,
    color: "bg-primary",
  },
  {
    from: 107.0,
    to: 108.0,
    label: "Gestörte Signale",
    art: "Rauschen",
    style: "noise" as const,
    color: "bg-muted-foreground",
  },
];

function bandFor(freq: number) {
  return BANDS.find((b) => freq >= b.from && freq <= b.to) ?? null;
}

export function RadioPanel() {
  const {
    radioOpen,
    closeRadio,
    api,
    setRadioActive,
    bumpResonance,
    resetResonance,
    resonance,
    flags,
  } = useGame();
  const { sfxVolume } = useSettings();

  const [freq, setFreq] = useState(102.3);
  const [volume, setVolume] = useState(0.5);
  const lastTickRef = useRef<number | null>(null);
  const droneStopRef = useRef<(() => void) | null>(null);
  const lastFreqRef = useRef(freq);
  const [tick, setTick] = useState(0);

  // Animate waveform for all bands
  useEffect(() => {
    if (!radioOpen) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 10000), 90);
    return () => clearInterval(id);
  }, [radioOpen]);

  // Tuning clicks when frequency changes
  useEffect(() => {
    if (Math.abs(freq - lastFreqRef.current) > 0.01) {
      playTuningClick(0.2 * sfxVolume);
      lastFreqRef.current = freq;
    }
  }, [freq, sfxVolume]);

  // Resonance drone — plays when overload is imminent
  useEffect(() => {
    if (resonance > 65 && !droneStopRef.current) {
      droneStopRef.current = startResonanceDrone(0.45 * sfxVolume);
    } else if (resonance <= 50 && droneStopRef.current) {
      droneStopRef.current();
      droneStopRef.current = null;
    }
  }, [resonance, sfxVolume]);

  // Cleanup drone on unmount / radio close
  useEffect(() => {
    if (!radioOpen && droneStopRef.current) {
      droneStopRef.current();
      droneStopRef.current = null;
    }
    return () => {
      if (droneStopRef.current) {
        droneStopRef.current();
        droneStopRef.current = null;
      }
    };
  }, [radioOpen]);

  // Resonance build-up while on 104.6 with high volume
  useEffect(() => {
    if (!radioOpen) return;
    const interval = setInterval(() => {
      const onSignal = freq === 104.6;
      setRadioActive(onSignal);
      // Resonance only builds when the volume is dialed to the max
      if (onSignal && volume >= 0.99) {
        bumpResonance(8);
      } else {
        bumpResonance(-4);
      }
      lastTickRef.current = Date.now();
    }, 600);
    return () => clearInterval(interval);
  }, [radioOpen, freq, volume, bumpResonance, setRadioActive]);

  // Trigger doorbell only when locked on 104.6 at MAXIMUM volume
  useEffect(() => {
    if (freq === 104.6 && volume >= 0.99 && !flags.has("doorbellRang")) {
      const t = setTimeout(() => {
        api.setFlag("doorbellRang");
        setRadioActive(true);
        resetResonance();
        playDoorbell(0.7 * sfxVolume);
        api.showText([
          ">> SCHMERZ-RADIO 104,6 — ENGEL-TRAUER",
          "Eine Stimme, die nichts sagt. Nur trauert.",
          "Fragmente: „... Zimmer ... Wand ... nicht aufhören ...“",
          "*KLINGEL-KLINGEL*",
          "Jemand ist an Layards Wohnungstür.",
        ]);
        closeRadio();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [freq, volume, flags, api, setRadioActive, resetResonance, closeRadio, sfxVolume]);

  if (!radioOpen) return null;

  const currentBand = bandFor(freq);
  const onAngel = freq === 104.6;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="fade-in relative w-full max-w-2xl rounded-sm border border-amber-glow/50 bg-background p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl uppercase tracking-[0.3em] text-amber-glow amber-glow">
            Schmerz-Radio
          </h2>
          <button
            type="button"
            onClick={() => {
              setRadioActive(false);
              closeRadio();
            }}
            aria-label="Radio schließen"
            className="flex items-center gap-2 rounded-sm border border-amber-glow/50 bg-background/60 px-2 py-1 text-xs uppercase tracking-widest text-amber-glow transition hover:bg-amber-glow/20 hover:text-foreground"
          >
            <span className="flex h-5 w-5 items-center justify-center">✕</span>
            <span>Loslassen</span>
          </button>
        </div>

        {/* Frequency display */}
        <div className="mb-4 rounded-sm border border-border bg-black/60 p-4 text-center">
          <div className="font-mono-crt text-5xl text-amber-glow amber-glow">
            {freq.toFixed(1)}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            MHz
          </div>
          {currentBand && (
            <div className="mt-3 text-sm text-foreground/90">
              <span className="font-mono-crt text-amber-glow">▸</span>{" "}
              {currentBand.label}
              <span className="ml-2 text-xs italic text-muted-foreground">
                ({currentBand.art})
              </span>
            </div>
          )}
        </div>

        {/* Frequency dial */}
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
          Frequenz
        </label>
        <input
          type="range"
          min={100}
          max={108}
          step={0.1}
          value={freq}
          onChange={(e) => setFreq(parseFloat(e.target.value))}
          className="mb-4 w-full accent-amber-glow"
        />

        {/* Snap buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[100.5, 102.3, 103.8, 104.6, 105.7].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFreq(f)}
              className={`rounded-sm border px-2 py-1 font-mono-crt text-xs transition ${
                Math.abs(freq - f) < 0.05
                  ? "border-amber-glow text-amber-glow"
                  : "border-border text-muted-foreground hover:border-amber-glow/60 hover:text-foreground"
              }`}
            >
              {f.toFixed(1)}
            </button>
          ))}
        </div>

        {/* Volume */}
        <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
          Lautstärke
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="mb-4 w-full accent-amber-glow"
        />

        {/* Wave visualization */}
        <div className="mb-4 flex h-16 items-end gap-[2px] rounded-sm border border-border bg-black/70 p-2">
          {Array.from({ length: 60 }).map((_, i) => {
            const phase = tick / 6;
            const style = currentBand?.style ?? "off";
            let intensity = 0;
            switch (style) {
              case "angel":
                // Coherent crystalline pulse
                intensity =
                  0.35 +
                  Math.abs(Math.sin((i + freq * 10) / 4 + phase)) * 0.65;
                break;
              case "panic": {
                // Sharp, jittery spikes — fast tremor
                const jitter = Math.sin(i * 2.7 + phase * 3.1) * 0.5;
                const spike = (i + Math.floor(tick * 1.3)) % 5 === 0 ? 0.45 : 0;
                intensity = 0.15 + Math.abs(jitter) * 0.5 + spike;
                break;
              }
              case "lonely":
                // Slow, dumpfe Welle (long wavelength, low amplitude)
                intensity =
                  0.12 +
                  (Math.sin(i / 9 + phase * 0.25) + 1) * 0.22 +
                  (Math.sin(i / 14 - phase * 0.18) + 1) * 0.1;
                break;
              case "grief":
                // Warmes Fließen — sanfte überlagerte Sinus
                intensity =
                  0.2 +
                  Math.abs(Math.sin(i / 5 + phase * 0.5)) * 0.3 +
                  Math.abs(Math.sin(i / 2.3 + phase * 0.35)) * 0.2;
                break;
              case "longing": {
                // Pulsierend — globale Amplituden-Hüllkurve
                const env = 0.5 + Math.sin(phase * 0.7) * 0.5;
                intensity =
                  0.15 +
                  Math.abs(Math.sin(i / 4 + phase * 1.1)) * 0.55 * env;
                break;
              }
              case "noise": {
                // Chaotisches Rauschen — pseudo-random, ändert sich schnell
                const seed = (i * 9301 + tick * 49297) % 233280;
                const r = (seed / 233280) * 0.8;
                intensity = 0.05 + r;
                break;
              }
              default: {
                // Off-band — zwischen den Bändern, leises Knistern
                intensity =
                  0.06 +
                  Math.abs(Math.sin(i * 1.3 + phase * 1.4)) * 0.14 +
                  ((i * 7 + tick) % 11) / 130;
              }
            }
            const colorClass = onAngel
              ? "bg-amber-glow wave-pulse"
              : (currentBand?.color ?? "bg-muted-foreground/60");
            return (
              <div
                key={i}
                className={`w-[3px] origin-bottom transition-[height] duration-75 ${colorClass}`}
                style={{
                  height: `${Math.min(100, intensity * 100 * volume)}%`,
                  animationDelay: `${i * 30}ms`,
                }}
              />
            );
          })}
        </div>

        {/* Resonance bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>Resonanz</span>
            <span
              className={
                resonance > 70
                  ? "text-destructive"
                  : resonance > 40
                    ? "text-amber-glow"
                    : "text-muted-foreground"
              }
            >
              {Math.round(resonance)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-sm border border-border bg-black/60">
            <div
              className={`h-full transition-all ${
                resonance > 70
                  ? "bg-destructive"
                  : resonance > 40
                    ? "bg-amber-glow"
                    : "bg-phosphor-dim"
              }`}
              style={{ width: `${resonance}%` }}
            />
          </div>
          {resonance > 70 && (
            <p className="mt-2 text-center text-xs uppercase tracking-widest text-destructive crt-flicker">
              ⚠ Zu nah. Resonanz-Überlastung droht.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}