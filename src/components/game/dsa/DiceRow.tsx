import { memo } from "react";
import { ATTR_LABEL, type Attr } from "@/game/dsa/dice";

interface Props {
  attr: Attr;
  target: number;
  rolls: [number, number, number];
  total: number;
  success: boolean;
}

function DiceRowImpl({ attr, target, rolls, total, success }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 border border-[#3a2c1a]/40 bg-[#fbf2d8]/60 rounded px-3 py-2 text-sm">
      <span className="font-semibold">
        {ATTR_LABEL[attr]}-Probe gegen {target}:
      </span>
      {rolls.map((r, i) => (
        <span
          key={i}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#3a2c1a]/70 bg-white font-bold"
        >
          {r}
        </span>
      ))}
      <span>= {total}</span>
      <span
        className={
          "ml-auto font-bold " +
          (success ? "text-emerald-700" : "text-red-800")
        }
      >
        {success ? "Erfolg" : "Misslungen"}
      </span>
    </div>
  );
}

export const DiceRow = memo(DiceRowImpl);
