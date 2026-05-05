import { memo } from "react";
import { DUEL_HOLD_MS, RADIO_EXT_TEXT } from "@/game/radio/bands";

interface Props {
  duelHoldMs: number;
  duelInWindow: boolean;
}

function DuelHoldBarImpl({ duelHoldMs, duelInWindow }: Props) {
  return (
    <div className="mt-4 rounded-sm border border-destructive/60 bg-destructive/10 p-3">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest">
        <span className="text-destructive">{RADIO_EXT_TEXT.duelHoldLabel}</span>
        <span className="text-muted-foreground">
          {RADIO_EXT_TEXT.duelTargetLabel}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm border border-border bg-black/60">
        <div
          className={`h-full transition-all ${
            duelInWindow ? "bg-destructive" : "bg-muted-foreground/60"
          }`}
          style={{ width: `${(duelHoldMs / DUEL_HOLD_MS) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        {RADIO_EXT_TEXT.duelProgressLabel}
      </p>
    </div>
  );
}

export const DuelHoldBar = memo(DuelHoldBarImpl);
