import { memo } from "react";
import type { Line } from "@/game/terminal/terminalHelpers";

interface Props {
  lines: Line[];
  miraMode: boolean;
  bodoMode: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Reine Render-Komponente für den Terminal-Output.
 * Unter `React.memo`, damit Tastendrücke im Eingabefeld (die nur
 * `input` aktualisieren) NICHT die gesamte Lines-Liste neu diffen.
 * Re-Rendert nur, wenn `lines` (Referenz) oder die Modus-Flags wechseln.
 */
export const TerminalScreen = memo(function TerminalScreen({
  lines,
  miraMode,
  bodoMode,
  scrollRef,
}: Props) {
  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto bg-black px-4 py-3 font-mono-crt text-[15px] leading-relaxed crt-flicker sm:h-[55vh] sm:flex-none sm:text-base"
    >
      {lines.map((l, i) => (
        <div
          key={i}
          className={
            l.kind === "system"
              ? miraMode
                ? "text-destructive"
                : bodoMode
                  ? "sepia-glow"
                  : "phosphor-glow"
              : l.kind === "in"
                ? miraMode
                  ? "text-destructive"
                  : bodoMode
                    ? "text-sepia"
                    : "text-phosphor"
                : miraMode
                  ? "text-destructive/80"
                  : bodoMode
                    ? "text-sepia-dim"
                    : "text-phosphor-dim"
          }
        >
          {l.text || "\u00A0"}
        </div>
      ))}
    </div>
  );
});
