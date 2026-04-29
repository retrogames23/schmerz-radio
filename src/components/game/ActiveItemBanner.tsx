import { useInventoryDrag } from "@/game/InventoryDragContext";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { ItemIcon } from "./ItemIcon";

/**
 * Mobile-Banner: zeigt das gerade per Tap selektierte Inventar-Item
 * („in der Hand"). Solange das Banner sichtbar ist, wendet ein Tap auf
 * einen Hotspot oder ein anderes Item die Kombination an.
 *
 * Auf Desktop blenden wir es aus — dort gibt der Drag-Cursor schon
 * sichtbares Feedback.
 */
export function ActiveItemBanner() {
  const drag = useInventoryDrag();
  const isCoarse = useCoarsePointer();
  if (!isCoarse) return null;
  if (!drag.selectedItem) return null;
  const item = drag.selectedItem;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-2 z-[70] flex justify-center px-2"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-sm border-2 border-amber-glow/80 bg-background/90 px-2 py-1.5 shadow-[0_0_18px_rgba(255,170,60,0.45)] backdrop-blur">
        <ItemIcon id={item.id} size={22} title={item.name} />
        <div className="font-mono-crt text-[11px] uppercase tracking-wider text-amber-glow">
          Verwende: {item.name} mit …
        </div>
        <button
          type="button"
          onClick={() => drag.clearSelection()}
          className="ml-1 rounded-sm border border-amber-glow/60 bg-background/70 px-2 py-0.5 font-mono-crt text-[10px] uppercase tracking-wider text-amber-glow/90 hover:border-amber-glow hover:text-amber-glow"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
