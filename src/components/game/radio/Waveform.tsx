import { memo } from "react";
import type { BandStyle, RadioBand } from "@/game/radio/bands";

interface WaveformProps {
  tick: number;
  freq: number;
  volume: number;
  band: RadioBand | null;
  onAngel: boolean;
}

/**
 * Visualisiert das Frequenz-Band als animierte Welle.
 * Memoisiert: rendert nur neu, wenn sich Tick/Frequenz/Volume/Band ändern.
 * Da der Parent (RadioPanel) bei jedem Tick rerendert, bleibt der
 * Re-Render hier zwar erhalten — aber die Berechnung der 60 Bars war
 * vorher zusätzlich an Pause-/Duel-/Resonanz-Re-Renders gekoppelt; das
 * entkoppeln wir jetzt.
 */
function WaveformImpl({ tick, freq, volume, band, onAngel }: WaveformProps) {
  const phase = tick / 6;
  const style: BandStyle = band?.style ?? "off";
  const colorClass = onAngel
    ? "bg-amber-glow wave-pulse"
    : (band?.color ?? "bg-muted-foreground/60");

  return (
    <div className="mb-4 flex h-16 items-end gap-[2px] rounded-sm border border-border bg-black/70 p-2">
      {Array.from({ length: 60 }).map((_, i) => {
        let intensity = 0;
        switch (style) {
          case "angel":
            intensity =
              0.35 +
              Math.abs(Math.sin((i + freq * 10) / 4 + phase)) * 0.65;
            break;
          case "panic": {
            const jitter = Math.sin(i * 2.7 + phase * 3.1) * 0.5;
            const spike = (i + Math.floor(tick * 1.3)) % 5 === 0 ? 0.45 : 0;
            intensity = 0.15 + Math.abs(jitter) * 0.5 + spike;
            break;
          }
          case "lonely":
            intensity =
              0.12 +
              (Math.sin(i / 9 + phase * 0.25) + 1) * 0.22 +
              (Math.sin(i / 14 - phase * 0.18) + 1) * 0.1;
            break;
          case "grief":
            intensity =
              0.2 +
              Math.abs(Math.sin(i / 5 + phase * 0.5)) * 0.3 +
              Math.abs(Math.sin(i / 2.3 + phase * 0.35)) * 0.2;
            break;
          case "longing": {
            const env = 0.5 + Math.sin(phase * 0.7) * 0.5;
            intensity =
              0.15 + Math.abs(Math.sin(i / 4 + phase * 1.1)) * 0.55 * env;
            break;
          }
          case "noise": {
            const seed = (i * 9301 + tick * 49297) % 233280;
            const r = (seed / 233280) * 0.8;
            intensity = 0.05 + r;
            break;
          }
          default:
            intensity =
              0.06 +
              Math.abs(Math.sin(i * 1.3 + phase * 1.4)) * 0.14 +
              ((i * 7 + tick) % 11) / 130;
        }
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
  );
}

export const Waveform = memo(WaveformImpl);
