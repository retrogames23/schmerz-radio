import { useGame } from "@/game/GameContext";
import { useInventoryDrag } from "@/game/InventoryDragContext";
import { combineItem } from "@/game/combine";
import type { Hotspot as HotspotType } from "@/game/types";

interface Props {
  hotspot: HotspotType;
}

export function Hotspot({ hotspot }: Props) {
  const { api, setCaption, flags } = useGame();
  const drag = useInventoryDrag();

  if (hotspot.requires?.some((f) => !flags.has(f))) return null;
  if (hotspot.hiddenWhen?.some((f) => flags.has(f))) return null;
  if (hotspot.visible && !hotspot.visible(api)) return null;

  return (
    <button
      type="button"
      onMouseEnter={() => setCaption(hotspot.label)}
      onMouseLeave={() => setCaption(null)}
      onFocus={() => setCaption(hotspot.label)}
      onBlur={() => setCaption(null)}
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
          : "cursor-crosshair border-amber-glow/0 hover:border-amber-glow/80 hover:bg-amber-glow/10 focus:border-amber-glow/80 focus:bg-amber-glow/10"
      }`}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.w}%`,
        height: `${hotspot.h}%`,
      }}
    />
  );
}