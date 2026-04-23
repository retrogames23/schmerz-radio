import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";

export function TextOverlay() {
  const { textOverlay, closeText } = useGame();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [textOverlay]);

  useEffect(() => {
    if (!textOverlay) return;
    const isLast = idx >= textOverlay.length - 1;
    const t = setTimeout(() => {
      if (isLast) closeText();
      else setIdx((i) => i + 1);
    }, 10000);
    return () => clearTimeout(t);
  }, [textOverlay, idx, closeText]);

  if (!textOverlay) return null;
  const current = textOverlay[idx];
  const isLast = idx >= textOverlay.length - 1;

  return (
    <button
      type="button"
      onClick={() => {
        if (isLast) closeText();
        else setIdx((i) => i + 1);
      }}
      className="absolute inset-0 z-40 flex cursor-pointer items-end justify-center bg-black/60 px-6 pb-24 text-left"
      aria-label="Weiter"
    >
      <div className="fade-in max-w-3xl rounded-sm border border-amber-glow/40 bg-background/95 px-6 py-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <p className="font-display text-lg leading-relaxed text-foreground text-shadow-hard sm:text-xl">
          {current}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
          <span>
            {idx + 1} / {textOverlay.length}
          </span>
          <span className="amber-glow">{isLast ? "▣ Schließen" : "▸ Weiter"}</span>
        </div>
      </div>
    </button>
  );
}