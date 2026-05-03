import { memo, useEffect, useRef } from "react";
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

function HotspotImpl({ hotspot, reveal = false }: Props) {
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

  // Kontext-Cursor je nach Interaktionstyp (Broken-Sword-Stil).
  // Default ist "look" (Lupe): nur Info, keine echte Interaktion.
  // Hotspots, die wirklich etwas tun (use/talk/exit), markieren das explizit.
  // Bei Exit-Hotspots zeigt der Pfeil in die passende Richtung — entweder
  // explizit über `exitDir` oder automatisch aus der Position auf dem
  // Bildschirm (welcher Rand ist am nächsten?).
  const exitDirClass = (() => {
    if (hotspot.kind !== "exit") return "cursor-exit";
    const dir =
      hotspot.exitDir ??
      (() => {
        const cx = hotspot.x + hotspot.w / 2;
        const cy = hotspot.y + hotspot.h / 2;
        // Abstand zu den vier Rändern (in %).
        const distLeft = cx;
        const distRight = 100 - cx;
        const distTop = cy;
        const distBottom = 100 - cy;
        const min = Math.min(distLeft, distRight, distTop, distBottom);
        if (min === distLeft) return "left" as const;
        if (min === distRight) return "right" as const;
        if (min === distTop) return "up" as const;
        return "down" as const;
      })();
    return `cursor-exit-${dir}`;
  })();
  const kindCursorClass = drag.activeItem
    ? "cursor-copy"
    : hotspot.kind === "use"
      ? "cursor-use"
      : hotspot.kind === "talk"
        ? "cursor-talk"
        : hotspot.kind === "exit"
          ? exitDirClass
          : "cursor-look";

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
        // Drag-Drop-Pfad (Desktop): nur wenn gerade aktiv gezogen wird.
        if (!drag.dragItem) return;
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
        // Tap-to-Use-Pfad (Mobile): aktives selektiertes Item auf diesen
        // Hotspot anwenden, statt die normale Hotspot-Aktion auszuführen.
        if (drag.selectedItem) {
          const source = drag.consumeActive();
          if (!source) return;
          setCaption(null);
          combineItem(source.id, {
            api,
            targetId: hotspot.id,
            targetKind: "hotspot",
            targetLabel: hotspot.label,
          });
          return;
        }
        setCaption(null);
        hotspot.onUse(api);
      }}
      aria-label={hotspot.label}
      className={`hotspot-touch absolute z-20 rounded-sm border transition-colors duration-200 focus:outline-none ${
        drag.activeItem
          ? `${kindCursorClass} border-amber-glow/40 bg-amber-glow/5 hover:border-amber-glow hover:bg-amber-glow/20`
          : reveal
            ? `${kindCursorClass} border-amber-glow/80 bg-amber-glow/15 hover:border-amber-glow hover:bg-amber-glow/25 focus:border-amber-glow/80 focus:bg-amber-glow/10`
            : `${kindCursorClass} border-transparent`
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

/**
 * Memoisiert: Hotspot-Objekte stammen aus `scenes.ts` (modul-stabil), und
 * `reveal` ist ein boolean. Damit re-rendert ein Hotspot nur, wenn sich
 * sein eigener Datensatz oder der Reveal-Status ändert — nicht bei jedem
 * Caption-Tick aus dem GameContext.
 */
export const Hotspot = memo(HotspotImpl);