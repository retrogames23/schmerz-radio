import { useEffect, useRef, useState, useCallback } from "react";
import { scenes, useGame } from "@/game/GameContext";
import { Hotspot } from "./Hotspot";
import { FloatingChatter } from "./FloatingChatter";
import { useDevMode } from "@/dev/devMode";
import { HotspotEditor } from "@/dev/HotspotEditor";
import { useQA } from "@/dev/overlayQAState";
import { getOverridesFor } from "@/dev/overlayQAState";
import { Eye, EyeOff } from "lucide-react";

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
  // Optionaler Bild-Zoom (siehe Scene.bgFocus). Wird gemeinsam auf
  // Hintergrund UND Hotspot-/NPC-/Decal-Layer angewendet, damit das
  // Bild-Koordinatensystem erhalten bleibt.
  const bgFocus = current.bgFocus;
  const bgFocusStyle: React.CSSProperties | undefined = bgFocus
    ? {
        transform: `scale(${bgFocus.scale})`,
        transformOrigin: `${bgFocus.originX}% ${bgFocus.originY}%`,
      }
    : undefined;
  const [showIntro, setShowIntro] = useState(true);
  // Wackelt nur für max. 10 Sekunden ab dem Moment, in dem die Überlastung beginnt.
  const [shakeActive, setShakeActive] = useState(false);
  const shakeTimeoutRef = useRef<number | null>(null);
  const shakeStartedRef = useRef(false);
  // Space gedrückt halten → alle Hotspots der aktuellen Szene werden mit
  // Rahmen und Label eingeblendet. Beim Loslassen wieder ausgeblendet.
  // Tastatureingaben in Eingabefeldern (Terminal etc.) werden ignoriert.
  const [revealHotspots, setRevealHotspots] = useState(false);
  // Touch-Geräte haben keine Leertaste — wir blenden stattdessen einen
  // kleinen Augen-Button ein, mit dem man die Hotspot-Rahmen umschaltet.
  const [isTouch, setIsTouch] = useState(false);
  const [touchReveal, setTouchReveal] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  const dev = useDevMode();
  const qa = useQA();
  // Persistente Editor-Overrides (localStorage) — werden bei jedem
  // QA-Tick neu gelesen, damit Drag/Resize sofort sichtbar wird.
  const overrides = getOverridesFor(scene);
  const applyOverride = <T extends { id: string; x: number; y: number; w: number; h: number }>(
    key: string,
    box: T,
  ): T => {
    const o = overrides[key];
    return o ? { ...box, x: o.x, y: o.y, w: o.w, h: o.h } : box;
  };
  // Pixelgenaues Layout: Hotspot-/NPC-/Decal-Layer werden exakt über die
  // sichtbare Bildfläche gelegt — auch wenn das Asset nicht exakt 16:9
  // ist. Dadurch sind alle Hotspot-Koordinaten (in % des Bildes)
  // unabhängig von der tatsächlichen Bühnen-/Asset-Geometrie korrekt.
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgRect, setImgRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const recomputeImgRect = useCallback(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!sw || !sh || !nw || !nh) return;
    const stageRatio = sw / sh;
    const imgRatio = nw / nh;
    let width: number;
    let height: number;
    if (imgRatio >= stageRatio) {
      // Bild ist breiter als Bühne → Höhe füllt, Breite überlappt links/rechts.
      height = sh;
      width = sh * imgRatio;
    } else {
      // Bild ist schmaler als Bühne → Breite füllt, Höhe überlappt oben/unten.
      width = sw;
      height = sw / imgRatio;
    }
    setImgRect({
      left: (sw - width) / 2,
      top: (sh - height) / 2,
      width,
      height,
    });
  }, []);

  useEffect(() => {
    recomputeImgRect();
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => recomputeImgRect());
    ro.observe(stage);
    window.addEventListener("resize", recomputeImgRect);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recomputeImgRect);
    };
  }, [recomputeImgRect]);

  // Wenn das Hintergrundbild wechselt: Rect zurücksetzen, damit kein
  // alter Bildausschnitt für das neue Asset verwendet wird.
  useEffect(() => {
    setImgRect(null);
  }, [backgroundSrc]);
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
      ref={stageRef}
      className={`relative mx-auto h-full max-h-full w-full max-w-full overflow-hidden border border-border bg-black scanlines ${
        shakeActive ? "resonance-shake" : ""
      }`}
    >
      {/*
        Bild-Layer: Hintergrund + Hotspot-/NPC-/Decal-Layer teilen sich
        EXAKT die Bildfläche (object-cover-Geometrie, pixelgenau aus
        naturalWidth/Height berechnet). Dadurch sind alle Koordinaten
        in % des Original-Bildes — unabhängig vom Asset-Format.
      */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          left: imgRect ? imgRect.left : 0,
          top: imgRect ? imgRect.top : 0,
          width: imgRect ? imgRect.width : "100%",
          height: imgRect ? imgRect.height : "100%",
          ...(bgFocusStyle ?? {}),
        }}
      >
        <img
          ref={imgRef}
          src={backgroundSrc}
          alt={current.title}
          fetchPriority="high"
          decoding="async"
          onLoad={() => {
            recomputeImgRect();
            markEssentialAssetsLoaded();
          }}
          onError={() => markEssentialAssetsLoaded()}
          className={`pointer-events-none block h-full w-full select-none ${
            scene === "corridor56" && flags.has("burnedNode5610")
              ? "corridor-emergency-power"
              : ""
          }`}
        />
      </div>

      <div
        className="absolute z-10"
        style={{
          left: imgRect ? imgRect.left : 0,
          top: imgRect ? imgRect.top : 0,
          width: imgRect ? imgRect.width : "100%",
          height: imgRect ? imgRect.height : "100%",
          ...(bgFocusStyle ?? {}),
        }}
      >

        {/* NPC sprites — gerendert über dem Hintergrund, unter den Hotspots */}
        {current.npcs?.map((rawNpc) => {
        const npc = applyOverride(`npc:${rawNpc.id}`, rawNpc);
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
        {current.decals?.map((rawD) => {
          const d = applyOverride(`decal:${rawD.id}`, rawD);
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
        {current.hotspots.map((rawH) => {
          const h = applyOverride(rawH.id, rawH);
          return (
          <Hotspot
            key={h.id}
            hotspot={h}
            reveal={revealHotspots || touchReveal || qa.active}
          />
          );
        })}

        {/* Dev-only: drag/resize Editor über allen Hotspots, NPCs und
            Decals — nur sichtbar mit ?dev=1 + gehaltener Space-Taste. */}
        {dev && (revealHotspots || (qa.active && qa.editorForced)) && (
          <HotspotEditor
            sceneId={scene}
            hotspots={current.hotspots}
            npcs={current.npcs}
            decals={current.decals}
          />
        )}

        {/* Hintergrund-Sprechblasen der DSA-Runde im Gemeinschaftsraum */}
        <FloatingChatter enabled={scene === "commonRoomE67"} variant="dsa" />
        {/* Hintergrund-Sprechblasen Kowalk/Brust in der Kantine */}
        <FloatingChatter
          enabled={scene === "cafeteriaE67"}
          variant="cafeteria"
        />

        {/* Amber vignette when radio is active */}
        {radioActive && <div className="amber-vignette" />}

        {/* Mobile: Toggle für Hotspot-Rahmen (Ersatz für Leertaste) */}
        {isTouch && (
          <button
            type="button"
            onClick={() => setTouchReveal((v) => !v)}
            className="absolute bottom-3 right-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-amber-glow/40 bg-background/85 text-amber-glow amber-glow"
            aria-label={touchReveal ? "Hotspots ausblenden" : "Hotspots einblenden"}
            aria-pressed={touchReveal}
          >
            {touchReveal ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}

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