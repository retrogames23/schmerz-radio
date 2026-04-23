import { useEffect, useState } from "react";
import { scenes, useGame } from "@/game/GameContext";
import { Hotspot } from "./Hotspot";

export function SceneView() {
  const { scene, caption, radioActive, resonance, flags } = useGame();
  const current = scenes[scene];
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setShowIntro(true);
    const t = setTimeout(() => setShowIntro(false), 20000);
    return () => clearTimeout(t);
  }, [scene]);

  return (
    <div
      className={`relative mx-auto aspect-[4/3] w-full max-w-6xl overflow-hidden border border-border bg-black scanlines ${
        resonance > 75 ? "resonance-shake" : ""
      }`}
    >
      <img
        src={current.background}
        alt={current.title}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* Hotspots */}
      {current.hotspots.map((h) => (
        <Hotspot key={h.id} hotspot={h} />
      ))}

      {/* Amber vignette when radio is active */}
      {radioActive && <div className="amber-vignette" />}

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-sm border border-amber-glow/40 bg-background/90 px-3 py-1 font-mono-crt text-sm text-amber-glow amber-glow">
          {caption}
        </div>
      )}

      {/* Scene title intro */}
      {showIntro && (
        <button
          type="button"
          onClick={() => setShowIntro(false)}
          className="absolute inset-x-0 top-6 z-30 flex cursor-pointer flex-col items-center gap-2 px-4 text-center"
          aria-label="Weiter"
        >
          <div className="fade-in inline-block rounded-sm bg-background/85 px-4 py-2">
            <div className="font-display text-2xl text-foreground text-shadow-hard">
              {current.title}
            </div>
          </div>
          {current.intro && (
            <p className="fade-in mx-auto max-w-2xl rounded-sm bg-background/85 px-4 py-2 font-display text-sm leading-relaxed text-muted-foreground sm:text-base">
              {current.intro}
            </p>
          )}
        </button>
      )}
    </div>
  );
}