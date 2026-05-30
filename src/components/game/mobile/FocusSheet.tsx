import { useEffect } from "react";
import { useGame } from "@/game/GameContext";
import { useInventoryDrag } from "@/game/InventoryDragContext";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { combineItem } from "@/game/combine";
import type { InventoryItemId } from "@/game/types";
import { ItemIcon } from "../ItemIcon";

/**
 * Mobiles Fokus-Sheet (Bottom-Sheet) für Hotspot-Interaktion.
 *
 * Aktiviert nur auf Coarse-Pointer-Geräten. Sobald der Spieler einen
 * Hotspot antippt, slidet dieses Sheet aus der Thumb-Zone hoch und
 * zeigt:
 *  - die Hotspot-Bezeichnung (Fokus)
 *  - eine kontextuelle Primär-Aktion (Ansehen / Benutzen / Sprechen),
 *    abgeleitet aus `hotspot.kind`
 *  - einen horizontal scrollbaren Inventar-Strip, sofern Items
 *    vorhanden sind, mit dem ein Item auf das Ziel angewandt wird.
 *
 * Desktop bleibt komplett unberührt — der Sheet rendert dort nichts.
 */
export function FocusSheet() {
  const isCoarse = useCoarsePointer();
  const drag = useInventoryDrag();
  const { api, inventory, setCaption } = useGame();
  const hotspot = drag.focusHotspot;

  // History-Eintrag, damit Hardware-Back das Sheet schließt statt die App
  // zu verlassen (gleiches Muster wie DialogOverlay).
  useEffect(() => {
    if (!hotspot || !isCoarse) return;
    const onPop = () => drag.closeFocus();
    window.history.pushState({ focusSheet: true }, "");
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // Eintrag wieder zurückrollen, wenn das Sheet auf anderem Weg schließt.
      if (window.history.state?.focusSheet) {
        window.history.back();
      }
    };
  }, [hotspot, isCoarse, drag]);

  // Escape schließt das Sheet (Tastaturen an Tablets).
  useEffect(() => {
    if (!hotspot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        drag.closeFocus();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [hotspot, drag]);

  if (!isCoarse || !hotspot) return null;

  const primaryLabel =
    hotspot.kind === "look"
      ? "Ansehen"
      : hotspot.kind === "talk"
        ? "Sprechen"
        : "Benutzen";

  const handlePrimary = () => {
    setCaption(null);
    const h = hotspot;
    drag.closeFocus();
    h.onUse(api);
  };

  const handleItem = (itemId: InventoryItemId) => {
    const h = hotspot;
    setCaption(null);
    drag.closeFocus();
    drag.clearSelection();
    combineItem(itemId, {
      api,
      targetId: h.id,
      targetKind: "hotspot",
      targetLabel: h.label,
    });
  };

  return (
    <>
      {/* Backdrop — dunkelt die Szene ab und schließt bei Tap. */}
      <button
        type="button"
        aria-label="Schließen"
        onClick={() => drag.closeFocus()}
        className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-150"
      />

      {/* Sheet — fixiert am unteren Rand, in der Daumen-Zone. */}
      <div
        role="dialog"
        aria-label={`Fokus: ${hotspot.label}`}
        className="fixed inset-x-0 bottom-0 z-[61] border-t-2 border-amber-glow/70 bg-background/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom duration-200"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono-crt text-[10px] uppercase tracking-widest text-amber-glow/70">
              Fokus
            </div>
            <div className="truncate font-display text-sm uppercase tracking-[0.2em] text-amber-glow">
              {hotspot.label}
            </div>
          </div>
          <button
            type="button"
            onClick={() => drag.closeFocus()}
            className="shrink-0 rounded-sm border border-border bg-secondary/40 px-3 py-1.5 font-mono-crt text-[11px] uppercase tracking-wider text-muted-foreground active:border-amber-glow/60 active:text-amber-glow"
          >
            Abbrechen
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrimary}
          className="mb-3 w-full rounded-sm border-2 border-amber-glow/70 bg-amber-glow/15 py-3 font-display text-sm uppercase tracking-[0.25em] text-amber-glow shadow-[0_0_16px_rgba(255,170,60,0.25)] active:bg-amber-glow/30"
        >
          {primaryLabel}
        </button>

        {inventory.length > 0 && (
          <div className="border-t border-border/60 pt-2">
            <div className="mb-1.5 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
              Gegenstand verwenden…
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {inventory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItem(item.id)}
                  className="flex h-20 w-20 shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-sm border border-border bg-secondary/30 p-1 active:border-amber-glow active:bg-amber-glow/15"
                >
                  <ItemIcon id={item.id} size={28} title={item.name} count={item.count} />
                  <span className="w-full truncate text-center font-mono-crt text-[10px] leading-none text-amber-glow/90">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}