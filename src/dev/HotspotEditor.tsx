import { useEffect, useRef, useState } from "react";
import type { Hotspot, NpcSprite, SceneDecal } from "@/game/types";

/**
 * Dev-only Hotspot/NPC/Decal-Editor.
 *
 * Sichtbar nur, wenn `?dev=1` in der URL steht UND der Spieler die
 * Space-Taste hält (gleicher Trigger wie das normale Hotspot-Reveal).
 * Erlaubt Drag & Resize jedes Bereichs direkt in der Szene und
 * loggt/kopiert die neuen Prozentkoordinaten — perfekt zum schnellen
 * Nachjustieren nach Hintergrund-Änderungen.
 *
 * Werte werden NICHT in den globalen State zurückgespielt: nach dem
 * Loslassen erscheint der bearbeitete Bereich wieder an seiner
 * Original-Position. Die korrekten Werte müssen aus der Konsole /
 * Zwischenablage manuell in `src/game/scenes.ts` übernommen werden.
 */

type Box = { id: string; label: string; x: number; y: number; w: number; h: number; kind: "hotspot" | "npc" | "decal" };

type Drag =
  | { mode: "move"; id: string; startX: number; startY: number; box: Box }
  | { mode: "resize"; id: string; corner: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"; startX: number; startY: number; box: Box }
  | null;

function pct(v: number) {
  return Math.round(v * 10) / 10;
}

function snippet(b: Box): string {
  return `id: "${b.id}", x: ${pct(b.x)}, y: ${pct(b.y)}, w: ${pct(b.w)}, h: ${pct(b.h)},`;
}

export function HotspotEditor({
  sceneId,
  hotspots,
  npcs,
  decals,
}: {
  sceneId: string;
  hotspots: Hotspot[];
  npcs?: NpcSprite[];
  decals?: SceneDecal[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Box>>({});
  const [drag, setDrag] = useState<Drag>(null);
  const [hover, setHover] = useState<string | null>(null);

  // Reset overrides when scene changes.
  useEffect(() => {
    setOverrides({});
    setDrag(null);
  }, [sceneId]);

  const initialBoxes: Box[] = [
    ...hotspots.map<Box>((h) => ({ id: h.id, label: h.label, x: h.x, y: h.y, w: h.w, h: h.h, kind: "hotspot" })),
    ...(npcs ?? []).map<Box>((n) => ({ id: `npc:${n.id}`, label: n.alt || n.id, x: n.x, y: n.y, w: n.w, h: n.h, kind: "npc" })),
    ...(decals ?? []).map<Box>((d) => ({ id: `decal:${d.id}`, label: d.id, x: d.x, y: d.y, w: d.w, h: d.h, kind: "decal" })),
  ];

  const boxes = initialBoxes.map((b) => overrides[b.id] ?? b);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;
    const b = drag.box;
    let next: Box = { ...b };
    if (drag.mode === "move") {
      next = { ...b, x: b.x + dxPct, y: b.y + dyPct };
    } else {
      const c = drag.corner;
      let { x, y, w, h } = b;
      if (c.includes("e")) w = b.w + dxPct;
      if (c.includes("s")) h = b.h + dyPct;
      if (c.includes("w")) {
        x = b.x + dxPct;
        w = b.w - dxPct;
      }
      if (c.includes("n")) {
        y = b.y + dyPct;
        h = b.h - dyPct;
      }
      next = { ...b, x, y, w: Math.max(1, w), h: Math.max(1, h) };
    }
    setOverrides((o) => ({ ...o, [drag.id]: next }));
  };

  const onMouseUp = () => {
    if (!drag) return;
    const final = overrides[drag.id];
    if (final) {
      const s = snippet(final);
      // eslint-disable-next-line no-console
      console.info(`[HotspotEditor] ${sceneId} — ${s}`);
      try {
        navigator.clipboard?.writeText(s);
      } catch {
        /* ignore */
      }
    }
    setDrag(null);
  };

  // Copy on "C" while hovering.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "c" && e.key !== "C") return;
      if (!hover) return;
      const target = document.activeElement;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      )
        return;
      const b = boxes.find((x) => x.id === hover);
      if (!b) return;
      const s = snippet(b);
      // eslint-disable-next-line no-console
      console.info(`[HotspotEditor:copy] ${sceneId} — ${s}`);
      try {
        navigator.clipboard?.writeText(s);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hover, boxes, sceneId]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30"
      style={{ pointerEvents: "auto" }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {boxes.map((b) => {
        const color =
          b.kind === "npc" ? "rgb(168 85 247)" : b.kind === "decal" ? "rgb(34 197 94)" : "rgb(251 191 36)";
        const handles: Array<{ c: Drag extends null ? never : "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"; style: React.CSSProperties }> = [
          { c: "nw", style: { left: -4, top: -4, cursor: "nwse-resize" } },
          { c: "ne", style: { right: -4, top: -4, cursor: "nesw-resize" } },
          { c: "sw", style: { left: -4, bottom: -4, cursor: "nesw-resize" } },
          { c: "se", style: { right: -4, bottom: -4, cursor: "nwse-resize" } },
          { c: "n", style: { left: "50%", top: -4, marginLeft: -4, cursor: "ns-resize" } },
          { c: "s", style: { left: "50%", bottom: -4, marginLeft: -4, cursor: "ns-resize" } },
          { c: "e", style: { right: -4, top: "50%", marginTop: -4, cursor: "ew-resize" } },
          { c: "w", style: { left: -4, top: "50%", marginTop: -4, cursor: "ew-resize" } },
        ];
        return (
          <div
            key={b.id}
            onMouseEnter={() => setHover(b.id)}
            onMouseLeave={() => setHover((h) => (h === b.id ? null : h))}
            onMouseDown={(e) => {
              e.preventDefault();
              setDrag({ mode: "move", id: b.id, startX: e.clientX, startY: e.clientY, box: b });
            }}
            className="absolute"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              height: `${b.h}%`,
              border: `2px solid ${color}`,
              background: `${color.replace("rgb", "rgba").replace(")", " / 0.15)")}`,
              cursor: "move",
              boxShadow: hover === b.id ? `0 0 0 1px white inset` : undefined,
            }}
          >
            <div
              className="pointer-events-none absolute -top-5 left-0 whitespace-nowrap rounded bg-black/85 px-1 font-mono text-[10px] text-white"
              style={{ color }}
            >
              {b.label} · {pct(b.x)},{pct(b.y)} {pct(b.w)}×{pct(b.h)}
            </div>
            {handles.map((h) => (
              <div
                key={h.c}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDrag({ mode: "resize", id: b.id, corner: h.c, startX: e.clientX, startY: e.clientY, box: b });
                }}
                className="absolute h-2 w-2"
                style={{ background: color, ...h.style }}
              />
            ))}
          </div>
        );
      })}
      <div className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/80 px-2 py-1 font-mono text-[10px] text-amber-300">
        DEV · drag/resize · "C" copies hovered box · scene: {sceneId}
      </div>
    </div>
  );
}