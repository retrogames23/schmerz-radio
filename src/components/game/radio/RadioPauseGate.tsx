import { memo } from "react";
import { CloseButton } from "../CloseButton";
import { ACT2_BRIDGE_UI_TEXT } from "@/game/cutscenes";

interface Props {
  onAbort: () => void;
  onContinue: () => void;
}

function RadioPauseGateImpl({ onAbort, onContinue }: Props) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/85 px-4">
      <div className="fade-in relative w-full max-w-md rounded-sm border border-amber-glow/40 bg-background p-6 text-center shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <CloseButton
          onClick={onAbort}
          label="Radio schließen"
          className="absolute right-3 top-3"
        />
        <div className="mb-4 space-y-2 pr-6">
          {ACT2_BRIDGE_UI_TEXT.radioPauseWarning.map((line, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-mono-crt text-xs uppercase tracking-[0.3em] text-amber-glow amber-glow"
                  : "font-display text-base text-foreground/90"
              }
            >
              {line}
            </p>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-stretch gap-2">
          <button
            type="button"
            onClick={onAbort}
            className="rounded-sm border border-amber-glow/60 px-4 py-2 text-xs uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10"
          >
            {ACT2_BRIDGE_UI_TEXT.radioPauseAbort}
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-sm border border-destructive/60 px-4 py-2 text-xs uppercase tracking-widest text-destructive hover:bg-destructive/10"
          >
            {ACT2_BRIDGE_UI_TEXT.radioPauseContinue}
          </button>
        </div>
      </div>
    </div>
  );
}

export const RadioPauseGate = memo(RadioPauseGateImpl);
