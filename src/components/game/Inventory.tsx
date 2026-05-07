import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useInventoryDrag } from "@/game/InventoryDragContext";
import { combineItem } from "@/game/combine";
import { ItemIcon, BriefcaseIcon } from "./ItemIcon";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
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
  const { inventory, api, openHandbook, openIdCard, scene } = useGame();
  const drag = useInventoryDrag();
  const isCoarse = useCoarsePointer();
  const [open, setOpen] = useState(false);

  // Auto-Clear: wenn der Spieler die Szene wechselt, soll keine
  // Tap-to-Use-Selektion bestehen bleiben (verhindert versehentliche
  // Kombinationen in der nächsten Szene).
  useEffect(() => {
    drag.clearSelection();
    // Absichtlich nur auf `scene` reagieren.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // Hilfsfunktion: „ansehen" / lesen (geteilt zwischen Tap-Pfad-Long-Press
  // und Desktop-Klick).
  const examineItem = (item: InventoryItem) => {
    if (item.id === "e67Handbook") {
      api.setFlag("readHandbook");
      openHandbook();
    } else if (item.id === "residentId") {
      api.setFlag("examinedResidentId");
      openIdCard();
    } else if (item.id === "paragraphenNotizbuch") {
      api.openParagraphenNotizbuch();
    } else if (item.id === "painRadio") {
      api.openRadio();
    } else {
      api.showText([item.name, item.description]);
    }
  };

  // Touch-/Mobile-Pfad: kurzer Tap = selektieren (oder ab-selektieren),
  // Long-Press = ansehen. Kein Drag.
  const handleItemPointerDownTouch = (
    e: React.PointerEvent<HTMLButtonElement>,
    item: InventoryItem,
  ) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const startX = e.clientX;
    const startY = e.clientY;
    let longPressed = false;
    let cancelled = false;

    const timer = window.setTimeout(() => {
      longPressed = true;
      examineItem(item);
    }, 450);

    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };

    const onMove = (ev: PointerEvent) => {
      const dx = Math.abs(ev.clientX - startX);
      const dy = Math.abs(ev.clientY - startY);
      if (dx > 8 || dy > 8) {
        // Bewegung → Long-Press abbrechen, kein Tap.
        cancelled = true;
        cleanup();
      }
    };
    const onUp = () => {
      cleanup();
      if (longPressed || cancelled) return;
      // Kurzer Tap: Toggle-Selektion.
      if (drag.selectedItem?.id === item.id) {
        drag.clearSelection();
      } else {
        drag.selectItem(item);
        setOpen(false);
      }
    };
    const onCancel = () => {
      cancelled = true;
      cleanup();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

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
        examineItem(item);
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
    // Desktop-Drag-Drop-Pfad.
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

  // Tap-to-Use auf ein anderes Inventar-Item (Mobile-Pfad).
  const handleItemTapAsTarget = (target: InventoryItem) => {
    if (!drag.selectedItem) return false;
    if (drag.selectedItem.id === target.id) {
      drag.clearSelection();
      return true;
    }
    const source = drag.consumeActive();
    if (!source) return true;
    combineItem(source.id, {
      api,
      targetId: target.id,
      targetKind: "item",
      targetLabel: target.name,
    });
    return true;
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
                  const isSelected = drag.selectedItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={`${item.name} — ${item.description}`}
                      onPointerDown={(e) => {
                        if (isCoarse) {
                          // Mobile: zuerst prüfen, ob ein Tap-Target-Drop fällig ist.
                          if (drag.selectedItem && drag.selectedItem.id !== item.id) {
                            // Wird im onClick-Pfad behandelt — hier nichts tun.
                            return;
                          }
                          handleItemPointerDownTouch(e, item);
                        } else {
                          handleItemPointerDown(e, item);
                        }
                      }}
                      onPointerUp={(e) => {
                        if (isCoarse) return;
                        handleItemPointerUp(e, item);
                      }}
                      onClick={() => {
                        if (!isCoarse) return;
                        // Wenn ein anderes Item bereits selektiert ist:
                        // dieses hier ist das Ziel der Kombination.
                        if (drag.selectedItem && drag.selectedItem.id !== item.id) {
                          handleItemTapAsTarget(item);
                        }
                      }}
                      className={`group relative flex aspect-square items-center justify-center rounded-sm border bg-secondary/30 p-1 transition ${
                        isDragging
                          ? "border-amber-glow/30 opacity-30"
                          : isSelected
                            ? "border-amber-glow bg-amber-glow/15 shadow-[0_0_14px_rgba(255,170,60,0.45)]"
                            : "border-border hover:border-amber-glow/70 hover:bg-amber-glow/10"
                      }`}
                    >
                      <ItemIcon id={item.id} size={28} title={item.name} />
                      {(item.count ?? 1) > 1 && (
                        <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-sm border border-amber-glow bg-background px-1 font-mono-crt text-[10px] leading-none text-amber-glow">
                          {item.count}
                        </span>
                      )}
                      {/* Custom Hover-Tooltip mit Kurzinfo zum Item. */}
                      <span
                        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-44 -translate-x-1/2 rounded-sm border border-amber-glow/60 bg-background/95 px-2 py-1.5 text-left font-mono-crt text-[10px] leading-snug text-amber-glow/90 shadow-[0_4px_18px_rgba(0,0,0,0.7)] group-hover:block"
                      >
                        <span className="block font-display text-[10px] uppercase tracking-[0.15em] text-amber-glow">
                          {item.name}
                        </span>
                        <span className="mt-0.5 block text-muted-foreground normal-case tracking-normal">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-border/60 pt-2 font-mono-crt text-[10px] leading-relaxed text-muted-foreground">
                {isCoarse ? (
                  <>
                    Tippen: verwenden.
                    <br />
                    Halten: ansehen.
                  </>
                ) : (
                  <>
                    Klick: ansehen.
                    <br />
                    Halten + ziehen: kombinieren.
                  </>
                )}
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
