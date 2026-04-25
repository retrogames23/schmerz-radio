import { useEffect, useRef } from "react";
import { useGame } from "@/game/GameContext";
import { useInventoryDrag } from "@/game/InventoryDragContext";
import { combineItem } from "@/game/combine";
import type { Hotspot as HotspotType } from "@/game/types";

interface Props {
  hotspot: HotspotType;
  /** Wenn true, wird der Hotspot mit Rahmen und Label sichtbar dargestellt
   *  (z. B. wenn der Spieler die Leertaste gedrückt hält). */
  reveal?: boolean;
}

export function Hotspot({ hotspot, reveal = false }: Props) {
  const { api, setCaption, flags } = useGame();
  const drag = useInventoryDrag();
  const hoveredRef = useRef(false);

  // Sicherheitsnetz: Falls dieser Hotspot beim Hover entfernt wird
  // (Szenenwechsel oder Flag-Änderung lässt ihn verschwinden), würde
  // onMouseLeave nie feuern. Beim Unmount Caption explizit clearen.
  useEffect(() => {
    return () => {
      if (hoveredRef.current) setCaption(null);
    };
  }, [setCaption]);

  if (hotspot.requires?.some((f) => !flags.has(f))) return null;
  if (hotspot.hiddenWhen?.some((f) => flags.has(f))) return null;
  if (hotspot.visible && !hotspot.visible(api)) return null;

  return (
    <button
      type="button"
      onMouseEnter={() => {
        hoveredRef.current = true;
        setCaption(hotspot.label);
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        setCaption(null);
      }}
      onFocus={() => {
        hoveredRef.current = true;
        setCaption(hotspot.label);
      }}
      onBlur={() => {
        hoveredRef.current = false;
        setCaption(null);
      }}
      onPointerUp={(e) => {
        if (!drag.dragItem) return;
        // Drop eines Inventar-Items auf diesen Hotspot → Kombinieren
        e.preventDefault();
        e.stopPropagation();
        const source = drag.endDrag();
        if (!source) return;
        setCaption(null);
        combineItem(source.id, {
          api,
          targetId: hotspot.id,
          targetKind: "hotspot",
          targetLabel: hotspot.label,
        });
      }}
      onClick={() => {
        // Wenn gerade ein Drag aktiv ist (oder gerade abgeschlossen wurde),
        // soll der Klick nicht zusätzlich die normale Hotspot-Aktion auslösen.
        if (drag.dragItem) return;
        setCaption(null);
        hotspot.onUse(api);
      }}
      aria-label={hotspot.label}
      className={`absolute z-20 rounded-sm border transition-colors duration-200 focus:outline-none ${
        drag.dragItem
          ? "cursor-copy border-amber-glow/40 bg-amber-glow/5 hover:border-amber-glow hover:bg-amber-glow/20"
          : reveal
            ? "cursor-crosshair border-amber-glow/80 bg-amber-glow/15 hover:border-amber-glow hover:bg-amber-glow/25 focus:border-amber-glow/80 focus:bg-amber-glow/10"
            : "cursor-crosshair border-amber-glow/0 hover:border-amber-glow/80 hover:bg-amber-glow/10 focus:border-amber-glow/80 focus:bg-amber-glow/10"
      }`}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.w}%`,
        height: `${hotspot.h}%`,
      }}
    >
      {reveal && (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm border border-amber-glow/60 bg-background/85 px-1.5 py-0.5 font-mono-crt text-[10px] leading-none text-amber-glow amber-glow"
        >
          {hotspot.label}
        </span>
      )}
    </button>
  );
}