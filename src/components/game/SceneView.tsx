import { useEffect, useRef, useState } from "react";
import { scenes, useGame } from "@/game/GameContext";
import { Hotspot } from "./Hotspot";

export function SceneView() {
  const { scene, caption, setCaption, radioActive, resonance, flags, api } = useGame();
  const current = scenes[scene];
  const backgroundSrc =
    typeof current.background === "function"
      ? current.background(api)
      : current.background;
  const [showIntro, setShowIntro] = useState(true);
  // Wackelt nur für max. 10 Sekunden ab dem Moment, in dem die Überlastung beginnt.
  const [shakeActive, setShakeActive] = useState(false);
  const shakeTimeoutRef = useRef<number | null>(null);
  const shakeStartedRef = useRef(false);

  useEffect(() => {
    setShowIntro(true);
    const t = setTimeout(() => setShowIntro(false), 20000);
    return () => clearTimeout(t);
  }, [scene]);

  // Sicherheitsnetz: Captions beim Szenenwechsel immer zurücksetzen, falls
  // ein onMouseLeave nicht gefeuert hat (z. B. weil der Hotspot beim Klick
  // zur Szenen-Transition geführt hat und das DOM-Element direkt unmountet
  // wurde, bevor der Maus-Verlassen-Event ausgelöst werden konnte).
  useEffect(() => {
    setCaption(null);
  }, [scene, setCaption]);

  useEffect(() => {
    if (resonance > 75) {
      // Beginnt erst zu wackeln, sobald die Schwelle frisch überschritten wird.
      if (!shakeStartedRef.current) {
        shakeStartedRef.current = true;
        setShakeActive(true);
        if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = window.setTimeout(() => {
          setShakeActive(false);
        }, 10000);
      }
    } else {
      // Sobald die Resonanz wieder unter die Schwelle fällt: Reset, damit das
      // 10-Sekunden-Fenster beim nächsten Anstieg neu starten kann.
      shakeStartedRef.current = false;
      if (shakeTimeoutRef.current) {
        window.clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = null;
      }
      setShakeActive(false);
    }
  }, [resonance]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`relative mx-auto aspect-[16/9] h-full max-h-full w-auto max-w-full overflow-hidden border border-border bg-black scanlines ${
        shakeActive ? "resonance-shake" : ""
      }`}
    >
      {/* Inner 4:3 stage — keeps existing percent-based coordinates intact */}
      <div className="relative mx-auto aspect-[4/3] h-full">
        <img
          src={backgroundSrc}
          alt={current.title}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* NPC sprites — gerendert über dem Hintergrund, unter den Hotspots */}
        {current.npcs?.map((npc) => {
        if (npc.requires?.some((f) => !flags.has(f))) return null;
        if (npc.hiddenWhen?.some((f) => flags.has(f))) return null;
        if (npc.visible && !npc.visible(api)) return null;
        return (
          <img
            key={npc.id}
            src={npc.src}
            alt={npc.alt}
            loading="lazy"
            className="pointer-events-none absolute z-10 select-none object-contain"
            style={{
              left: `${npc.x}%`,
              top: `${npc.y}%`,
              width: `${npc.w}%`,
              height: `${npc.h}%`,
              filter:
                "drop-shadow(0 6px 12px rgba(0,0,0,0.55)) contrast(0.95) saturate(0.85)",
            }}
          />
        );
        })}

        {/* Decals — sichtbare Wandgeräte etc., unter den Hotspots */}
        {current.decals?.map((d) => {
          if (d.requires?.some((f) => !flags.has(f))) return null;
          if (d.hiddenWhen?.some((f) => flags.has(f))) return null;
          if (d.kind !== "television") return null;
          return (
            <div
              key={d.id}
              className="pointer-events-none absolute z-10 select-none"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: `${d.w}%`,
                height: `${d.h}%`,
              }}
              aria-hidden
            >
              <div className="relative h-full w-full rounded-sm border-2 border-zinc-800 bg-zinc-900 shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                {/* Bildschirm */}
                <div className="absolute inset-[10%] overflow-hidden rounded-[1px] border border-black/60 bg-black">
                  <div className="tv-decal-screen h-full w-full" />
                  <div className="pointer-events-none absolute inset-0 tv-decal-scan" />
                </div>
                {/* Standby-LED */}
                <div className="absolute bottom-[3%] right-[6%] h-[8%] w-[5%] rounded-full bg-red-500/80 shadow-[0_0_4px_rgba(255,0,0,0.8)]" />
              </div>
            </div>
          );
        })}

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
          // Outer wrapper is pointer-events-none so the intro never blocks
          // clicks on hotspots underneath (e.g. elevator buttons). Only the
          // title/intro panels themselves are clickable to dismiss.
          <div className="pointer-events-none absolute inset-x-0 top-6 z-30 flex flex-col items-center gap-2 px-4 text-center">
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="fade-in pointer-events-auto inline-block cursor-pointer rounded-sm bg-background/85 px-4 py-2"
              aria-label="Weiter"
            >
              <div className="font-display text-2xl text-foreground text-shadow-hard">
                {current.title}
              </div>
            </button>
            {current.intro && (
              <button
                type="button"
                onClick={() => setShowIntro(false)}
                className="fade-in pointer-events-auto mx-auto max-w-2xl cursor-pointer rounded-sm bg-background/85 px-4 py-2 text-left font-display text-sm leading-relaxed text-muted-foreground sm:text-base"
                aria-label="Weiter"
              >
                {current.intro}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}