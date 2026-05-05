import { memo } from "react";

interface Props {
  resonance: number;
}

/** Resonanz-Balken — eigenständig memoisiert. */
function ResonanceMeterImpl({ resonance }: Props) {
  const colorText =
    resonance > 70
      ? "text-destructive"
      : resonance > 40
        ? "text-amber-glow"
        : "text-muted-foreground";
  const barColor =
    resonance > 70
      ? "bg-destructive"
      : resonance > 40
        ? "bg-amber-glow"
        : "bg-phosphor-dim";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span>Resonanz</span>
        <span className={colorText}>{Math.round(resonance)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm border border-border bg-black/60">
        <div
          className={`h-full transition-all ${barColor}`}
          style={{ width: `${resonance}%` }}
        />
      </div>
      {resonance > 70 && (
        <p className="mt-2 text-center text-xs uppercase tracking-widest text-destructive crt-flicker">
          ⚠ Zu nah. Resonanz-Überlastung droht.
        </p>
      )}
    </div>
  );
}

export const ResonanceMeter = memo(ResonanceMeterImpl);
