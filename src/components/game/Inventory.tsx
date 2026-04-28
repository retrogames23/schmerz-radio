import { useState } from "react";
import { useGame } from "@/game/GameContext";
import { useInventoryDrag } from "@/game/InventoryDragContext";
import { combineItem } from "@/game/combine";
import { ItemIcon, BriefcaseIcon } from "./ItemIcon";
import type { InventoryItem } from "@/game/types";

/**
 * Klassisches 16-Bit-Adventure-Inventar:
 * - Aktentaschen-Button rechts unten öffnet das kompakte Floating-Panel.
 * - Linksklick auf ein Item: anschauen (Beschreibung).
 * - Linksklick + halten + ziehen: Item kombinieren mit Hotspot/NPC oder
 *   einem anderen Item (Drop-Ziele sind die Hotspots und die anderen
 *   Item-Slots in diesem Panel).
 */
export function Inventory() {
  const { inventory, api, openHandbook, openIdCard } = useGame();
  const drag = useInventoryDrag();
  const [open, setOpen] = useState(false);

  // Pointerdown auf einem Item: Drag erst nach kleiner Bewegung starten
  // (sonst feuert ein einfacher Klick versehentlich auch einen Drag).
  const handleItemPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    item: InventoryItem,
  ) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let started = false;

    const onMove = (ev: PointerEvent) => {
      if (started) return;
      const dx = Math.abs(ev.clientX - startX);
      const dy = Math.abs(ev.clientY - startY);
      if (dx > 4 || dy > 4) {
        started = true;
        drag.startDrag(item, ev.clientX, ev.clientY);
      }
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      // Reiner Klick (kein Drag): Beschreibung zeigen.
      if (!started) {
        // Spezielle „Lese“-Items: eigenes Overlay statt nüchterner Beschreibung.
        if (item.id === "e67Handbook") {
          api.setFlag("readHandbook");
          openHandbook();
        } else if (item.id === "residentId") {
          api.setFlag("examinedResidentId");
          openIdCard();
        } else {
          api.showText([item.name, item.description]);
        }
      } else {
        // Wenn beim Loslassen kein Drop-Ziel über uns lag, beendet der
        // globale Listener den Drag von selbst. Hier nichts zu tun.
        void ev;
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Drop eines Items auf einen anderen Item-Slot.
  const handleItemPointerUp = (
    e: React.PointerEvent<HTMLButtonElement>,
    target: InventoryItem,
  ) => {
    if (!drag.dragItem) return;
    e.preventDefault();
    e.stopPropagation();
    const source = drag.endDrag();
    if (!source || source.id === target.id) return;
    combineItem(source.id, {
      api,
      targetId: target.id,
      targetKind: "item",
      targetLabel: target.name,
    });
  };

  return (
    <>
      {/* Aktentaschen-Button rechts unten */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={open ? "Aktentasche schließen" : "Aktentasche öffnen"}
        aria-label="Inventar"
        className={`pointer-events-auto fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-sm border-2 transition-all duration-200 ${
          open
            ? "border-amber-glow bg-amber-glow/20 shadow-[0_0_18px_rgba(255,170,60,0.45)]"
            : "border-amber-glow/50 bg-background/85 hover:-translate-y-0.5 hover:border-amber-glow hover:shadow-[0_0_14px_rgba(255,170,60,0.35)]"
        }`}
      >
        <BriefcaseIcon size={32} />
        {inventory.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-sm border border-amber-glow bg-background font-mono-crt text-xs text-amber-glow">
            {inventory.length}
          </span>
        )}
      </button>

      {/* Floating-Panel */}
      {open && (
        <div
          className="pointer-events-auto fixed bottom-24 right-4 z-40 w-72 rounded-sm border-2 border-amber-glow/60 bg-background/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur"
          role="dialog"
          aria-label="Aktentasche"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="font-display text-xs uppercase tracking-[0.3em] text-amber-glow/80">
              Aktentasche
            </div>
            <div className="font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
              {inventory.length}/6
            </div>
          </div>

          {inventory.length === 0 ? (
            <div className="py-6 text-center font-mono-crt text-xs italic text-muted-foreground/70">
              — leer —
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2">
                {inventory.map((item) => {
                  const isDragging = drag.dragItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.name}
                      onPointerDown={(e) => handleItemPointerDown(e, item)}
                      onPointerUp={(e) => handleItemPointerUp(e, item)}
                      className={`group relative flex aspect-square items-center justify-center rounded-sm border bg-secondary/30 p-1 transition ${
                        isDragging
                          ? "border-amber-glow/30 opacity-30"
                          : "border-border hover:border-amber-glow/70 hover:bg-amber-glow/10"
                      }`}
                    >
                      <ItemIcon id={item.id} size={28} title={item.name} />
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-border/60 pt-2 font-mono-crt text-[10px] leading-relaxed text-muted-foreground">
                Klick: ansehen.
                <br />
                Halten + ziehen: kombinieren.
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Cursor-Layer: zeigt das gerade gezogene Item an der Mauszeigerposition.
 * Wird von Game.tsx auf oberster Ebene eingebunden.
 */
export function DragCursorLayer() {
  const drag = useInventoryDrag();
  if (!drag.dragItem || !drag.cursor) return null;
  return (
    <div
      className="pointer-events-none fixed z-[80]"
      style={{
        left: drag.cursor.x - 16,
        top: drag.cursor.y - 16,
      }}
    >
      <div className="rounded-sm border border-amber-glow/80 bg-background/85 p-1 shadow-[0_0_18px_rgba(255,170,60,0.6)]">
        <ItemIcon id={drag.dragItem.id} size={28} title={drag.dragItem.name} />
      </div>
    </div>
  );
}
