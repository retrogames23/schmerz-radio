import { memo, useEffect, useRef, useState } from "react";
import walkerAsset from "@/assets/sprites/zvs-walker-cycle.png.asset.json";
import beamtinAsset from "@/assets/sprites/zvs-beamtin-cycle.png.asset.json";
import boteAsset from "@/assets/sprites/zvs-bote-cycle.png.asset.json";
import handwerkerAsset from "@/assets/sprites/zvs-handwerker-cycle.png.asset.json";
import rentnerAsset from "@/assets/sprites/zvs-rentner-cycle.png.asset.json";
import schirmfrauAsset from "@/assets/sprites/zvs-schirmfrau-cycle.png.asset.json";
import { createWalkVisit, PLAZA_WALK, type PlazaCharacter } from "@/game/ambientWalk";
import { useGame } from "@/game/GameContext";
import { useInventoryDrag } from "@/game/InventoryDragContext";
import { Hotspot } from "../Hotspot";

const assets = { walker: walkerAsset, beamtin: beamtinAsset, bote: boteAsset,
  handwerker: handwerkerAsset, rentner: rentnerAsset, schirmfrau: schirmfrauAsset };

/** Real frame animation, continuous travel, no fading or persistent story flags. */
export const PlazaWalker = memo(function PlazaWalker({ reveal = false }: { reveal?: boolean }) {
  const game = useGame();
  const { focusHotspot } = useInventoryDrag();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const visitRef = useRef<ReturnType<typeof createWalkVisit> | null>(null);
  const pauseRef = useRef(false);
  const clickedRef = useRef(false);
  const [character, setCharacter] = useState<PlazaCharacter | null>(null);
  pauseRef.current = Boolean(game.dialogId || game.textOverlay || game.cutscene ||
    game.freeChatNpcId || game.mapOpen || focusHotspot);
  useEffect(() => { clickedRef.current = false; }, [game.dialogId, focusHotspot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !target) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let disposed = false;
    let visibleId: string | null = null;
    const images = new Map<string, HTMLImageElement>();
    visitRef.current ??= createWalkVisit();
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const render = (now: number) => {
      if (disposed) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      const paused = pauseRef.current || clickedRef.current || document.hidden || motion.matches;
      const sample = visitRef.current?.sample(now, paused);
      const image = sample ? images.get(sample.character.id) : undefined;
      if (sample && image && !motion.matches) {
        const h = canvas.height * sample.character.height;
        const w = h * PLAZA_WALK.cellWidth / PLAZA_WALK.cellHeight;
        const x = -w + sample.progress * (canvas.width + 2 * w);
        const y = canvas.height * PLAZA_WALK.baseline - h;
        context.drawImage(image, sample.frame * PLAZA_WALK.cellWidth, 0,
          PLAZA_WALK.cellWidth, PLAZA_WALK.cellHeight, x, y, w, h);
        // Same image-space rectangle, independent of viewport crop and device pixel ratio.
        target.style.left = `${100 * x / canvas.width}%`;
        target.style.top = `${100 * y / canvas.height}%`;
        target.style.width = `${100 * w / canvas.width}%`;
        target.style.height = `${100 * h / canvas.height}%`;
        target.style.visibility = "visible";
        if (visibleId !== sample.character.id) {
          visibleId = sample.character.id;
          setCharacter(sample.character);
        }
      } else {
        target.style.visibility = "hidden";
        if (visibleId !== null) { visibleId = null; setCharacter(null); }
      }
      if (!visitRef.current?.finished) raf = requestAnimationFrame(render);
    };
    // Start the visit only after the whole cast is ready; no invisible traversals on slow connections.
    Promise.all(Object.entries(assets).map(([id, asset]) => new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => { images.set(id, image); resolve(); };
      image.onerror = () => resolve();
      image.src = asset.url;
    }))).then(() => { if (!disposed) raf = requestAnimationFrame(render); });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);
  return <>
    <canvas ref={canvasRef} className="plaza-walker pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
    <div ref={targetRef} className="plaza-walker pointer-events-none absolute z-30 invisible"
      onPointerDownCapture={() => { clickedRef.current = true; }}>
      {character && <div className="pointer-events-auto h-full w-full"><Hotspot directInteraction reveal={reveal} hotspot={{
        id: `plaza_${character.id}`, label: character.label,
        x: 0, y: 0, w: 100, h: 100, kind: "talk",
        onUse: (api) => { clickedRef.current = true; api.startDialog(`plaza_${character.id}`); },
      }} /></div>}
    </div>
  </>;
});