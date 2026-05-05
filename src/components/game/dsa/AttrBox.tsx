import { memo, useEffect, useRef, useState } from "react";
import { ATTR_LABEL, type Attr } from "@/game/dsa/dice";

interface Props {
  attr: Attr;
  finalValue: number | null;
  rolling: boolean;
}

function AttrBoxImpl({ attr, finalValue, rolling }: Props) {
  const [shown, setShown] = useState<number | null>(finalValue);
  const lastFinal = useRef<number | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (rolling) {
      const interval = window.setInterval(() => {
        setShown(8 + Math.floor(Math.random() * 6));
      }, 55);
      return () => window.clearInterval(interval);
    }
    setShown(finalValue);
    if (finalValue !== null && finalValue !== lastFinal.current) {
      lastFinal.current = finalValue;
      setPulseKey((k) => k + 1);
    }
  }, [rolling, finalValue]);

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="dsa-typed hidden w-full truncate text-center text-[8px] uppercase tracking-[0.2em] dsa-ink-faded mb-0.5 sm:block">
        {ATTR_LABEL[attr]}
      </div>
      <div
        className={`dsa-box-thick flex h-9 w-9 items-center justify-center sm:h-14 sm:w-14 ${
          rolling ? "bg-amber-100/60" : ""
        }`}
      >
        <span
          key={pulseKey}
          className={`font-display text-xl sm:text-3xl dsa-ink ${
            finalValue !== null && !rolling ? "dsa-value-in" : ""
          }`}
        >
          {shown ?? "—"}
        </span>
      </div>
      <div className="dsa-typed text-[10px] font-bold tracking-widest dsa-ink mt-0.5">
        {attr}
      </div>
    </div>
  );
}

export const AttrBox = memo(AttrBoxImpl);

interface FieldProps {
  label: string;
  value: string;
  className?: string;
}

function FieldImpl({ label, value, className = "" }: FieldProps) {
  return (
    <div className={`flex min-w-0 items-end gap-2 ${className}`}>
      <span className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded shrink-0">
        {label}
      </span>
      <span className="dsa-rule min-w-0 flex-1 dsa-typed text-sm dsa-ink pb-0.5 truncate">
        {value || "\u00A0"}
      </span>
    </div>
  );
}

export const Field = memo(FieldImpl);