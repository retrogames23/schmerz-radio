import { useEffect, useRef, useState } from "react";
import { scenes, useGame } from "@/game/GameContext";
import { Hotspot } from "./Hotspot";
import { FloatingChatter } from "./FloatingChatter";

export function SceneView() {
  const {
    scene,
    caption,
    setCaption,
    radioActive,
    resonance,
    flags,
    api,
    markEssentialAssetsLoaded,
  } = useGame();
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
  // Space gedrückt halten → alle Hotspots der aktuellen Szene werden mit
  // Rahmen und Label eingeblendet. Beim Loslassen wieder ausgeblendet.
  // Tastatureingaben in Eingabefeldern (Terminal etc.) werden ignoriert.
  const [revealHotspots, setRevealHotspots] = useState(false);
  // Mobil (Touch / schmaler Viewport): Hintergrund per object-cover füllen,
  // damit 4:3-Bilder in der gedrehten 16:9-Bühne keine schwarzen Balken
  // links/rechts erzeugen. Auf Desktop bleibt object-contain, damit native
  // 16:9-Bilder vollständig sichtbar sind.
  const [coverBg, setCoverBg] = useState(false);
  useEffect(() => {
    const compute = () => setCoverBg(window.innerWidth < 768);
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);
  useEffect(() => {
    const isTypingTarget = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        t.isContentEditable
      );
    };
    const onDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (e.repeat) {
        // Verhindert ungewolltes Scrollen, wenn die Taste gehalten wird.
        e.preventDefault();
        return;
      }
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      setRevealHotspots(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      setRevealHotspots(false);
    };
    const onBlur = () => setRevealHotspots(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

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
      {/* Hintergrundbild füllt die volle 16:9-Bühnenbreite. object-contain
          zeigt 16:9-Bilder komplett (kein seitlicher Crop mehr); 4:3- und
          1:1-Bilder werden mittig gezeichnet und behalten ihren Inhalt. */}
      <img
        src={backgroundSrc}
        alt={current.title}
        // Spiel-Assets bekommen Vorfahrt vor dem GB-großen LLM-Download,
        // der parallel im Hintergrund laufen kann.
        fetchPriority="high"
        decoding="async"
        onLoad={() => markEssentialAssetsLoaded()}
        onError={() => markEssentialAssetsLoaded()}
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-contain ${
          scene === "corridor56" && flags.has("burnedNode5610")
            ? "corridor-emergency-power"
            : ""
        } ${coverBg ? "!object-cover" : ""}`}
      />

      {/* 4:3-Hotspot-Layer: liegt mittig in der 16:9-Bühne und deckt
          exakt den Bereich ab, der bei der alten 4:3-Bühne sichtbar war.
          Alle Hotspot-/NPC-/Decal-/Caption-Koordinaten in scenes.ts sind
          in Prozent dieses 4:3-Bereichs angegeben und brauchen daher
          NICHT umgerechnet zu werden. Bei nativen 16:9-Bildern wird
          links und rechts dieser Box jetzt Bildinhalt sichtbar, der
          vorher beschnitten war — dort liegen bewusst keine
          interaktiven Elemente. */}
      <div className="absolute inset-y-0 left-1/2 z-10 aspect-[4/3] h-full -translate-x-1/2">

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
            // Charakter-Sprites sind Teil der Szene — hohe Priorität, damit
            // sie nicht hinter dem LLM-Download anstehen müssen.
            fetchPriority="high"
            decoding="async"
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
          <Hotspot key={h.id} hotspot={h} reveal={revealHotspots} />
        ))}

        {/* Hintergrund-Sprechblasen der DSA-Runde im Gemeinschaftsraum */}
        <FloatingChatter enabled={scene === "commonRoomE67"} variant="dsa" />
        {/* Hintergrund-Sprechblasen Kowalk/Brust in der Kantine */}
        <FloatingChatter
          enabled={scene === "cafeteriaE67"}
          variant="cafeteria"
        />

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