import { useEffect, useRef, type CSSProperties } from "react";
import rainMask from "@/assets/title/whisper-quest-v1-rain-mask.png";

/**
 * Canvas-based rain overlay. Renders ~220 falling streaks with three depth
 * layers (parallax) plus tiny splash sparks at the bottom of the viewport.
 * Honours `prefers-reduced-motion` by rendering nothing.
 */
export function RainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Drop = {
      x: number;
      y: number;
      len: number;
      speed: number;
      thickness: number;
      alpha: number;
    };
    type Splash = { x: number; y: number; life: number; max: number };

    const drops: Drop[] = [];
    const splashes: Splash[] = [];
    const WIND = 0.35; // horizontal drift factor (slight diagonal)

    const makeDrop = (initial = false): Drop => {
      // Three depth layers: far (slow, thin), mid, near (fast, thick).
      const layer = Math.random();
      let speed: number;
      let len: number;
      let thickness: number;
      let alpha: number;
      if (layer < 0.45) {
        speed = 5 + Math.random() * 2; // far
        len = 8 + Math.random() * 6;
        thickness = 0.6;
        alpha = 0.18 + Math.random() * 0.12;
      } else if (layer < 0.85) {
        speed = 8 + Math.random() * 3; // mid
        len = 12 + Math.random() * 8;
        thickness = 0.9;
        alpha = 0.28 + Math.random() * 0.14;
      } else {
        speed = 12 + Math.random() * 4; // near
        len = 18 + Math.random() * 10;
        thickness = 1.3;
        alpha = 0.4 + Math.random() * 0.2;
      }
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : -len,
        len,
        speed,
        thickness,
        alpha,
      };
    };

    const resize = () => {
      // Use the canvas's own layout box, not window.innerWidth/Height.
      // On mobile we render inside a rotated/scaled virtual stage, so the
      // window viewport doesn't match the actual rendering area — using it
      // produces rain only in a small strip (e.g. left side after rotation).
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with viewport area (capped).
      const target = Math.min(260, Math.max(120, Math.floor((width * height) / 6500)));
      drops.length = 0;
      for (let i = 0; i < target; i++) drops.push(makeDrop(true));
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.x += d.speed * WIND * 0.25;
        d.y += d.speed;

        ctx.strokeStyle = `rgba(190, 215, 235, ${d.alpha})`;
        ctx.lineWidth = d.thickness;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.speed * WIND * 0.6, d.y - d.len);
        ctx.stroke();

        if (d.y > height) {
          // Spawn a tiny splash for the closer (thicker) drops only.
          if (d.thickness > 1 && Math.random() < 0.55) {
            splashes.push({ x: d.x, y: height - 2, life: 0, max: 14 });
          }
          drops[i] = makeDrop(false);
        }
      }

      // Age splashes without drawing them. The rain is behind glass only;
      // viewport-bottom splashes would appear on the desk/interior.
      splashes.length = splashes.filter((s) => {
        s.life += 1;
        return s.life / s.max < 1;
      }).length;

      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      ro?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      style={{
        // CSS mask matches the artwork's object-cover exactly: same image,
        // same size mode, same position. White areas of the mask = rain
        // visible (window glass / sky). Black areas = rain hidden behind
        // curtains, frames, person, desk, monitor.
        WebkitMaskImage: `url(${rainMask})`,
        maskImage: `url(${rainMask})`,
        WebkitMaskSize: "cover",
        maskSize: "cover",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        // Treat brightness as alpha (luminance source). White=visible, black=hidden.
        ...({ WebkitMaskMode: "luminance", maskMode: "luminance" } as CSSProperties),
      }}
    />
  );
}
