import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";

const FRAMES = [
  "Layard betritt den Aufzug. Er drückt E67.",
  "Im Innenfutter seines Mantels: ein Kristall, ein Brief.",
  "Er denkt an Insas Stimme. „Bitte.“",
  "Er denkt an Mikaels Stimme. „Schalten Sie das Radio aus, wenn Sie den Aufzug betreten.“",
  "",
  "Layard greift in die Tasche. Sein Daumen findet den Drehregler.",
  "Zum ersten Mal seit elf Jahren —",
  "— dreht er ihn auf Null.",
  "",
  "Stille. Nicht die Stille des Quadranten. Eine andere.",
  "Er hört seinen eigenen Atem. Er erkennt ihn nicht.",
  "Die Aufzugstür öffnet sich.",
];

export function Ending() {
  const { ending } = useGame();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!ending) return;
    const t = setInterval(() => {
      setIdx((i) => Math.min(i + 1, FRAMES.length));
    }, 2200);
    return () => clearInterval(t);
  }, [ending]);

  if (!ending) return null;

  const done = idx >= FRAMES.length;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black px-6 text-center">
      <div className="mx-auto max-w-2xl space-y-4">
        {FRAMES.slice(0, idx).map((line, i) => (
          <p
            key={i}
            className="slow-fade-in font-display text-lg text-foreground sm:text-xl"
          >
            {line || "\u00A0"}
          </p>
        ))}
      </div>

      {done && (
        <div className="slow-fade-in mt-12 space-y-3 text-center">
          <div className="font-mono-crt text-sm uppercase tracking-[0.4em] text-amber-glow amber-glow">
            AKT II — ENDE
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Schmerz-Radio auf 104,6 — Fortsetzung folgt
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-sm border border-amber-glow/50 px-4 py-2 text-xs uppercase tracking-widest text-amber-glow hover:bg-amber-glow/10"
          >
            ▸ Neu beginnen
          </button>
        </div>
      )}
    </div>
  );
}