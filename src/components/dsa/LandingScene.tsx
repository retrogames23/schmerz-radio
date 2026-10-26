import { useEffect, useRef } from "react";
import landingBg from "@/assets/dsa/landing-bg-noflag.jpg";
import flagSrc from "@/assets/dsa/landing-flag.png";

/**
 * Startscreen-Kulisse: Hintergrund (ohne eingebackene Flagge) in einer
 * 1920×1080-Bildbox mit cover-Verhalten; darauf wehendes Reichsbanner
 * (goldener Greif auf Rot), Wind in den Baumkronen und Kaminrauch.
 * Alle Koordinaten sind Bildkoordinaten, damit alles auf jedem Bildschirm sitzt.
 */
const W = 1920;
const H = 1080;
// Fahnenstange bei x≈1246, Tuch beginnt oben bei y≈42
const FLAG = { x: 1247, y: 22, w: 230, h: 140, clothW: 196, clothTop: 20 };

/** Gemeinsame Windstärke (0..1) – Flagge folgt ihr direkt, Bäume/Rauch per gleichem Rhythmus. */
function gust(t: number) {
  return 0.55 + 0.25 * Math.sin(t * 0.41) + 0.2 * Math.sin(t * 0.13 + 1.7);
}

function WavingFlag() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scale = 2;
    canvas.width = FLAG.w * scale;
    canvas.height = FLAG.h * scale;
    const img = new Image();
    img.src = flagSrc;
    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = reduce ? 0 : (now - start) / 1000;
      const g = gust(t);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, FLAG.w, FLAG.h);
      const cw = FLAG.clothW * (0.9 + 0.1 * g); // bei Flaute hängt das Tuch etwas
      const ch = cw * (img.height / img.width);
      const strips = 64;
      const sw = img.width / strips;
      const dw = cw / strips;
      const amp = 4 + 7 * g;
      const droop = (1 - g) * 18;
      for (let i = 0; i < strips; i++) {
        const u = i / strips;
        const phase = t * (5 + 3 * g) - u * 9;
        const env = Math.pow(u, 0.85); // an der Stange fixiert
        const dy = env * (amp * Math.sin(phase) + 2.5 * Math.sin(phase * 2.3 + 1)) + droop * u * u;
        const stretch = 1 - 0.06 * env * Math.cos(phase);
        const x = i * dw;
        const y = FLAG.clothTop + dy + (ch * (1 - stretch)) / 2;
        ctx.drawImage(img, i * sw, 0, sw + 0.6, img.height, x, y, dw + 0.6, ch * stretch);
        // Licht/Schatten der Falten
        const shade = env * Math.cos(phase);
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = shade > 0 ? `rgba(255,225,170,${shade * 0.18})` : `rgba(30,5,0,${-shade * 0.35})`;
        ctx.fillRect(x, 0, dw + 0.6, FLAG.h);
        ctx.globalCompositeOperation = "source-over";
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    img.onload = () => {
      raf = requestAnimationFrame(draw);
    };
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      className="absolute"
      style={{
        left: `${(FLAG.x / W) * 100}%`,
        top: `${(FLAG.y / H) * 100}%`,
        width: `${(FLAG.w / W) * 100}%`,
        height: `${(FLAG.h / H) * 100}%`,
      }}
    />
  );
}

const CHIMNEYS = [
  { x: 810, y: 660 },
  { x: 1128, y: 640 },
];

export function LandingScene() {
  return (
    <div className="dsa-landing-bg absolute inset-0" style={{ containerType: "size" }}>
      <div className="dsa-landing-box">
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <filter id="dsa-wind" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="4" result="n" />
              <feOffset in="n" result="m">
                <animate attributeName="dx" values="0;160" dur="9s" repeatCount="indefinite" />
              </feOffset>
              <feDisplacementMap in="SourceGraphic" in2="m" xChannelSelector="R" yChannelSelector="G" scale="7">
                <animate attributeName="scale" values="5;10;6;12;5" dur="15s" repeatCount="indefinite" />
              </feDisplacementMap>
            </filter>
            <radialGradient id="dsa-crown-fade">
              <stop offset="55%" stopColor="#fff" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
            <mask id="dsa-crowns">
              <ellipse cx="430" cy="170" rx="560" ry="300" fill="url(#dsa-crown-fade)" />
              <ellipse cx="1730" cy="330" rx="260" ry="250" fill="url(#dsa-crown-fade)" />
              <ellipse cx="1420" cy="610" rx="170" ry="120" fill="url(#dsa-crown-fade)" />
              <ellipse cx="640" cy="600" rx="170" ry="150" fill="url(#dsa-crown-fade)" />
            </mask>
            <filter id="dsa-smoke-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          <image href={landingBg} width={W} height={H} />
          <g mask="url(#dsa-crowns)">
            <image href={landingBg} width={W} height={H} filter="url(#dsa-wind)" />
          </g>
          <g filter="url(#dsa-smoke-blur)">
            {CHIMNEYS.map((c, ci) =>
              Array.from({ length: 6 }).map((_, i) => (
                <circle
                  key={`${ci}-${i}`}
                  className="dsa-smoke"
                  cx={c.x}
                  cy={c.y}
                  r={14}
                  style={{ animationDelay: `${-(i * 7) / 6 - ci * 2.3}s` }}
                />
              )),
            )}
          </g>
        </svg>
        <WavingFlag />
      </div>
    </div>
  );
}
