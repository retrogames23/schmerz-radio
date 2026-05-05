import { memo } from "react";
import { Skull, Shield, Swords } from "lucide-react";
import type { Combatant } from "@/game/dsa/combat";

interface Props {
  c: Combatant;
  le: number;
  isHit: boolean;
  isAttacking: boolean;
  isDefending: boolean;
  facing: "left" | "right";
  compact?: boolean;
}

function CombatantCardImpl({
  c,
  le,
  isHit,
  isAttacking,
  isDefending,
  facing,
  compact,
}: Props) {
  const dead = le <= 0;
  const pct = Math.max(0, Math.min(100, (le / c.leMax) * 100));
  const isHero = c.side === "hero";

  const motion = dead
    ? ""
    : isAttacking
    ? facing === "right"
      ? "translate-x-1.5 -rotate-1"
      : "-translate-x-1.5 rotate-1"
    : isDefending
    ? facing === "right"
      ? "-translate-x-0.5"
      : "translate-x-0.5"
    : "";

  const flash = isHit ? "dsa-card-hit" : "";

  return (
    <div
      className={
        "dsa-combat-card relative transition-transform duration-200 ease-out " +
        motion +
        " " +
        flash +
        (dead ? " opacity-50 grayscale" : "")
      }
    >
      <div
        className={
          "absolute -top-2 " +
          (facing === "right" ? "-left-2" : "-right-2") +
          " w-7 h-7 rounded-full grid place-items-center border-2 " +
          (isHero
            ? "bg-[#1f3d1a] border-[#5a8a4d] text-[#d8e8c4]"
            : "bg-[#3d1a1a] border-[#8a4d4d] text-[#e8c4c4]")
        }
        aria-hidden
      >
        {dead ? (
          <Skull className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : isHero ? (
          <Shield className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <Swords className="h-3.5 w-3.5" strokeWidth={2.5} />
        )}
      </div>

      <div
        className={
          "dsa-box-thick px-3 py-2 " +
          (compact ? "min-h-[5rem]" : "min-h-[6rem]")
        }
      >
        <div className="dsa-typed text-[12px] sm:text-[13px] dsa-ink font-extrabold leading-tight pr-2">
          {c.name}
        </div>
        <div className="dsa-typed text-[10px] dsa-ink-faded font-semibold leading-tight truncate mb-1.5">
          {c.weapon}
        </div>
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded font-bold">
            Lebensenergie
          </span>
          <span className="font-display dsa-ink font-extrabold tabular-nums text-base leading-none">
            {Math.max(0, le)}
            <span className="text-[10px] dsa-ink-faded">/{c.leMax}</span>
          </span>
        </div>
        <div className="h-2 w-full rounded-sm bg-[rgba(20,12,4,0.18)] overflow-hidden border border-[rgba(20,12,4,0.45)]">
          <div
            className={
              "h-full transition-all duration-500 " +
              (isHero
                ? pct > 50
                  ? "bg-[#3a6f2a]"
                  : pct > 25
                  ? "bg-[#a07020]"
                  : "bg-[#8a2010]"
                : pct > 50
                ? "bg-[#6b1a0e]"
                : pct > 25
                ? "bg-[#5a1a18]"
                : "bg-[#3a1208]")
            }
            style={{ width: `${pct}%` }}
          />
        </div>
        {!compact && (
          <div className="dsa-typed text-[10px] dsa-ink font-bold mt-1.5 flex items-center gap-2 flex-wrap">
            <span>AT {c.at}</span>
            <span className="dsa-ink-faded">·</span>
            <span>PA {c.pa}</span>
            <span className="dsa-ink-faded">·</span>
            <span>RS {c.rs}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const CombatantCard = memo(CombatantCardImpl);
