import { memo } from "react";
import { Skull } from "lucide-react";
import type { CombatEvent } from "@/game/dsa/combat";

interface Props {
  kind?: CombatEvent["kind"];
  heroSide: boolean;
}

function ActionIndicatorImpl({ kind, heroSide }: Props) {
  if (kind === "damage") {
    return (
      <div className="flex flex-col items-center gap-1 animate-[scale-in_0.18s_ease-out]">
        <div className={"text-3xl " + (heroSide ? "" : "scale-x-[-1]")}>⚔</div>
        <div className="dsa-typed text-[10px] uppercase tracking-widest font-bold text-[#6b1a0e]">
          Treffer
        </div>
      </div>
    );
  }
  if (kind === "parry-success") {
    return (
      <div className="flex flex-col items-center gap-1 animate-[scale-in_0.18s_ease-out]">
        <div className="text-3xl">🛡</div>
        <div className="dsa-typed text-[10px] uppercase tracking-widest font-bold text-[#1f3d6b]">
          Pariert
        </div>
      </div>
    );
  }
  if (kind === "attack-miss") {
    return (
      <div className="flex flex-col items-center gap-1 animate-[scale-in_0.18s_ease-out]">
        <div className="text-2xl dsa-ink-faded">✗</div>
        <div className="dsa-typed text-[10px] uppercase tracking-widest font-bold dsa-ink-faded">
          Daneben
        </div>
      </div>
    );
  }
  if (kind === "attack-hit") {
    return (
      <div
        className={
          "text-2xl animate-[scale-in_0.18s_ease-out] " +
          (heroSide ? "" : "scale-x-[-1]")
        }
      >
        →
      </div>
    );
  }
  if (kind === "downed") {
    return (
      <div className="flex flex-col items-center gap-1 animate-[scale-in_0.18s_ease-out]">
        <Skull className="h-6 w-6 text-[#6b1a0e]" strokeWidth={2.25} />
        <div className="dsa-typed text-[10px] uppercase tracking-widest font-bold text-[#6b1a0e]">
          Niedergerungen
        </div>
      </div>
    );
  }
  return (
    <div className="dsa-typed text-base font-extrabold dsa-ink-faded tracking-widest">
      VS
    </div>
  );
}

export const ActionIndicator = memo(ActionIndicatorImpl);
