import { memo, useEffect, useRef } from "react";

/** Outdoor rain in the same local image box as the walkers and foreground. */
export const PlazaRain = memo(function PlazaRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let previous = 0;
    let raf = 0;
    let color = getComputedStyle(canvas).getPropertyValue("--plaza-rain-ink").trim();
    let drops: { x: number; y: number; depth: number; floor: number }[] = [];
    const resize = () => {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = getComputedStyle(canvas).getPropertyValue("--plaza-rain-ink").trim();
      drops = Array.from({ length: Math.min(220, Math.max(80, Math.round(width * height / 7000))) }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        depth: Math.random(), floor: 0.59 + Math.random() * 0.41,
      }));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const draw = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      context.clearRect(0, 0, width, height);
      if (!motion.matches && !document.hidden) {
        context.strokeStyle = color;
        for (const drop of drops) {
          const speed = height * (0.55 + drop.depth * 0.65);
          drop.y += speed * dt;
          drop.x += speed * dt * 0.085;
          const length = height * (0.008 + drop.depth * 0.013);
          context.globalAlpha = 0.13 + drop.depth * 0.19;
          context.lineWidth = 0.45 + drop.depth * 0.55;
          context.beginPath();
          context.moveTo(drop.x, drop.y);
          context.lineTo(drop.x - length * 0.085, drop.y - length);
          context.stroke();
          if (drop.y > height * drop.floor || drop.x > width) {
            drop.y = -length;
            drop.x = Math.random() * width;
          }
        }
        context.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="plaza-rain pointer-events-none absolute inset-0 h-full w-full" />;
});