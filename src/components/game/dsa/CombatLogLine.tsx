import { memo } from "react";
import type { CombatEvent } from "@/game/dsa/combat";

interface Props {
  event: CombatEvent;
  active: boolean;
}

function LogLineImpl({ event, active }: Props) {
  const baseColor =
    event.kind === "damage"
      ? "text-[#6b1a0e]"
      : event.kind === "parry-success"
      ? "text-[#1f3d6b]"
      : event.kind === "attack-miss"
      ? "dsa-ink-faded"
      : event.kind === "downed"
      ? "text-[#6b1a0e] font-extrabold"
      : event.kind === "end-victory"
      ? "text-[#2d5a1e] font-extrabold"
      : event.kind === "end-defeat"
      ? "text-[#6b1a0e] font-extrabold"
      : event.kind === "round-start"
      ? "dsa-ink font-extrabold"
      : "dsa-ink";
  return (
    <div
      className={
        "dsa-typed text-xs sm:text-[13px] leading-snug py-0.5 px-2 rounded font-semibold " +
        baseColor +
        (active ? " bg-[rgba(20,12,4,0.08)]" : "")
      }
    >
      {event.text}
    </div>
  );
}

export const CombatLogLine = memo(LogLineImpl);
