import { useEffect, useRef, useState } from "react";
import rainMask from "@/assets/title/whisper-quest-v1-rain-mask.png";

/**
 * Canvas-based rain overlay. Renders ~220 falling streaks with three depth
 * layers (parallax) plus tiny splash sparks at the bottom of the viewport.
 * Honours `prefers-reduced-motion` by rendering nothing.
 */
export function RainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);

  // Preload the mask image once and convert black -> transparent so it can be
  // used as an alpha mask via the canvas 'destination-in' composite op.
  useEffect(() => {
    const img = new Image();
    img.src = rainMask;
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(img, 0, 0);
      const data = octx.getImageData(0, 0, off.width, off.height);
      const px = data.data;
      for (let i = 0; i < px.length; i += 4) {
        // Brightness drives alpha. White (rain visible) -> opaque. Black -> transparent.
        const lum = (px[i] + px[i + 1] + px[i + 2]) / 3;
        px[i + 3] = lum; // 0..255
      }
      octx.putImageData(data, 0, 0);
      setMaskCanvas(off);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!maskCanvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
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

    // Artwork is rendered with object-cover. Reproduce that mapping for the
    // mask so it lines up pixel-accurately with the painted scene.
    const ART_W = 1280;
    const ART_H = 853; // intrinsic aspect of whisper-quest-v1 (3:2)
    let coverW = 0;
    let coverH = 0;
    let coverX = 0;
    let coverY = 0;
    const computeCover = () => {
      const scale = Math.max(width / ART_W, height / ART_H);
      coverW = ART_W * scale;
      coverH = ART_H * scale;
      coverX = (width - coverW) / 2;
      coverY = (height - coverH) / 2;
    };

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
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with viewport area (capped).
      const target = Math.min(
        260,
        Math.max(120, Math.floor((width * height) / 6500)),
      );
      drops.length = 0;
      for (let i = 0; i < target; i++) drops.push(makeDrop(true));
      computeCover();
    };

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const tick = () => {
      ctx.globalCompositeOperation = "source-over";
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

      // Render & age splashes.
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.life += 1;
        const t = s.life / s.max;
        if (t >= 1) {
          splashes.splice(i, 1);
          continue;
        }
        const r = 1 + t * 4;
        ctx.strokeStyle = `rgba(200, 220, 240, ${0.35 * (1 - t)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // Mask: keep rain ONLY where the mask is bright (window-glass areas).
      // 'destination-in' multiplies existing pixels by the mask's alpha;
      // because the mask PNG is opaque everywhere, we instead use 'multiply'
      // by drawing the inverted mask via 'destination-out' for the dark areas.
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas, coverX, coverY, coverW, coverH);
      ctx.globalCompositeOperation = "source-over";

      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [maskCanvas]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
    />
  );
}