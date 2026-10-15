import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Green-on-black CRT terminal background for the title screen.
 * Multiple vertical columns of slowly scrolling, real in-game commands —
 * Matrix-vibe but using actual CentralOS / Leitstelle / Router output.
 */

const LINES: string[] = [
  ">> CENTRALOS v2.3 — boot",
  "OK  load: kernel.crt",
  "OK  load: leitstelle.001",
  "AUTH 001 -> Bauerfeind, Insa",
  "open: ROUTER567.ZENTRAL.NETZ",
  "ERROR 4567: gateway auth failed",
  "retry x3 ... no carrier",
  "uplink: E67.NETZ stable",
  "uplink: E71.NETZ unreachable",
  "rsync /var/log/quadrant/E67",
  'echo "resonanz-hygiene" >> motd',
  "ps -ef | grep schmerz",
  "1046 4567 ?  S  schmerz_radio --tune 104.6",
  "tail -f /var/log/klopf.log",
  "klopf 26.13/26.15 amp=0.42",
  "klopf 26.13/26.15 amp=0.41",
  "klopf 26.13/26.15 amp=0.43",
  "DISPATCH paramedics -> 26.15",
  "PRINT protokoll @ E67/2613",
  "fall-id: 5245@E67@2613",
  "MAIL leitstelle25@zentral.netz",
  "GET /sektor/E67/door/code -> 401",
  "POST /sektor/E67/door/code -> 200",
  "decode door.code = #### ####",
  "verify layard.worag.2611 OK",
  "FREQ 104.6 signal_lock=true",
  "FREQ 104.6 drift=0.0008",
  "warn resonance 0.74 (lim 0.80)",
  "ALERT resonance 0.79",
  "ALERT resonance 0.81 — flush",
  "ZKS intercept @ 03:14",
  "snapshot -> game_saves/slot_2",
  "umount /home/layard",
  "wake: terminal 2611 active",
  "AUTH passwort123 -> philippe",
  "ls /home/philippe/notizen",
  "cat layard_persoenlichkeit.txt",
  "ROUTER567 -> reroute via E67",
  "trace 8 hops -> mikael@E71/1534",
  "elevator -> floor 1",
  "elevator -> floor 3",
  "quadrantenschleuse: ERROR 4567",
  "quadrantenschleuse: OK manual code",
  "ZENTRAL.LOG 0x4567 cleared",
  ">> ready.",
];

interface ColumnState {
  /** y offset in vh — moves negative over time (scrolls up). */
  y: number;
  /** scroll speed in vh per second. */
  speed: number;
  /** base x position in % of viewport width. */
  x: number;
  /** sequence of lines (long enough to fill the column twice). */
  text: string[];
  /** opacity multiplier for this column. */
  alpha: number;
}

function buildColumns(count: number): ColumnState[] {
  const cols: ColumnState[] = [];
  for (let i = 0; i < count; i++) {
    // Spread columns across the viewport.
    const x = (i / count) * 100 + (Math.random() * 6 - 3);
    const speed = 4 + Math.random() * 8; // vh/s
    const startY = -(Math.random() * 100); // start scattered
    const lineCount = 60;
    const lines: string[] = [];
    for (let j = 0; j < lineCount; j++) {
      lines.push(LINES[Math.floor(Math.random() * LINES.length)]);
    }
    cols.push({
      y: startY,
      speed,
      x,
      text: lines,
      alpha: 0.55 + Math.random() * 0.45,
    });
  }
  return cols;
}

export function CrtMatrixBackground() {
  const [columns, setColumns] = useState<ColumnState[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  // Build columns once on mount, sized to viewport.
  useEffect(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1280;
    const count = Math.max(8, Math.min(24, Math.round(w / 110)));
    setColumns(buildColumns(count));
  }, []);

  // Animate by mutating a ref array and triggering re-render via state tick.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (columns.length === 0) return;
    const animate = (t: number) => {
      const last = lastRef.current || t;
      const dt = Math.min(0.1, (t - last) / 1000);
      lastRef.current = t;
      setColumns((prev) =>
        prev.map((c) => {
          let y = c.y - c.speed * dt;
          // When the column has scrolled out the top by one full page, loop.
          if (y < -200) y += 200;
          return { ...c, y };
        }),
      );
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = 0;
    };
    // We only want to (re)start when the column count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns.length]);

  // Suppress the unused setter warning above by referencing setTick.
  void setTick;

  const lineHeightVh = 1.6;

  const cols = useMemo(() => columns, [columns]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-black"
      style={{ contain: "strict" }}
    >
      {cols.map((c, idx) => (
        <div
          key={idx}
          className="absolute font-mono-crt whitespace-pre"
          style={{
            left: `${c.x}%`,
            top: `${c.y}vh`,
            color: "#39ff7a",
            opacity: c.alpha,
            textShadow: "0 0 6px rgba(57,255,122,0.65)",
            fontSize: "11px",
            lineHeight: `${lineHeightVh}vh`,
            letterSpacing: "0.02em",
            transform: "translateZ(0)",
          }}
        >
          {c.text.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ))}
      {/* Soft top/bottom fade so columns disappear gracefully. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}