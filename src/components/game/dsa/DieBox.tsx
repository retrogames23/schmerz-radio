import { memo } from "react";

interface Props {
  d: { label: string; value: number; target?: number; success?: boolean };
}

function DieBoxImpl({ d }: Props) {
  return (
    <div
      className={
        "dsa-die animate-[scale-in_0.18s_ease-out] " +
        (d.success === true
          ? "dsa-die-success"
          : d.success === false
          ? "dsa-die-fail"
          : "")
      }
    >
      <span className="dsa-typed text-[9px] uppercase tracking-wider dsa-ink-faded font-bold">
        {d.label}
      </span>
      <span className="font-display dsa-ink font-extrabold text-lg leading-none tabular-nums">
        {d.value}
        {typeof d.target === "number" && (
          <span className="text-xs dsa-ink-faded font-bold"> /{d.target}</span>
        )}
      </span>
    </div>
  );
}

export const DieBox = memo(DieBoxImpl);
