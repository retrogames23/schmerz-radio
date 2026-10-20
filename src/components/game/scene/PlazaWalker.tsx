import { memo, useEffect, useRef } from "react";
import walkerAsset from "@/assets/sprites/zvs-walker-cycle.png.asset.json";
import { createWalkVisit, PLAZA_WALK } from "@/game/ambientWalk";

/** Real frame animation, continuous travel, no fading or persistent story flags. */
export const PlazaWalker = memo(function PlazaWalker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visitRef = useRef(createWalkVisit());
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    let raf = 0;
    let disposed = false;
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
      const sample = visitRef.current.sample(now);
      if (sample && !motion.matches) {
        const h = canvas.height * PLAZA_WALK.height;
        const w = h * PLAZA_WALK.cellWidth / PLAZA_WALK.cellHeight;
        const x = -w + sample.progress * (canvas.width + 2 * w);
        const y = canvas.height * PLAZA_WALK.baseline - h;
        context.drawImage(image, sample.frame * PLAZA_WALK.cellWidth, 0,
          PLAZA_WALK.cellWidth, PLAZA_WALK.cellHeight, x, y, w, h);
      }
      if (!visitRef.current.finished) raf = requestAnimationFrame(render);
    };
    image.onload = () => { if (!disposed) raf = requestAnimationFrame(render); };
    image.src = walkerAsset.url;
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);
  return <canvas ref={canvasRef} className="plaza-walker pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
});