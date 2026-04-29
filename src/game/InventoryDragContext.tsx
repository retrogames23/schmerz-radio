import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { InventoryItem } from "./types";

interface DragState {
  /** Aktuell gezogenes Item, oder null. */
  dragItem: InventoryItem | null;
  /** Cursor-Position in Viewport-Koordinaten. */
  cursor: { x: number; y: number } | null;
  startDrag: (item: InventoryItem, x: number, y: number) => void;
  updateCursor: (x: number, y: number) => void;
  /**
   * Beendet den Drag.
   * @returns das gerade gezogene Item — der Aufrufer (z.B. Hotspot bei
   *   pointerup) entscheidet dann, ob/wie er es kombiniert.
   */
  endDrag: () => InventoryItem | null;
  /**
   * Tap-to-Use-Selektion (vor allem für Mobile): per Tap „in die Hand
   * genommen", bleibt aktiv, bis der Spieler ein Ziel antippt oder
   * abbricht.
   */
  selectedItem: InventoryItem | null;
  selectItem: (item: InventoryItem) => void;
  clearSelection: () => void;
  /**
   * Gemeinsamer Helper für Drop-Empfänger (Hotspot/Inventar-Slot):
   * liefert das gerade „aktive" Item — egal ob Drag (Desktop) oder
   * Tap-Selection (Mobile).
   */
  activeItem: InventoryItem | null;
  /**
   * Konsumiert das aktive Item: gibt es zurück und löscht beide States
   * (Drag & Selection). Für Drop-Handler beim Kombinieren.
   */
  consumeActive: () => InventoryItem | null;
}

const InventoryDragContext = createContext<DragState | null>(null);

export function InventoryDragProvider({ children }: { children: ReactNode }) {
  const [dragItem, setDragItem] = useState<InventoryItem | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const dragItemRef = useRef<InventoryItem | null>(null);
  dragItemRef.current = dragItem;
  const selectedItemRef = useRef<InventoryItem | null>(null);
  selectedItemRef.current = selectedItem;

  // Globaler Pointermove-Listener: Cursor-Position aktualisieren, damit das
  // Item-Sprite dem Mauszeiger folgt — egal über welchem Element wir sind.
  useEffect(() => {
    if (!dragItem) return;
    const onMove = (e: PointerEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    const onCancel = () => {
      // Wenn der Pointer den Browser verlässt: Drag abbrechen.
      setDragItem(null);
      setCursor(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [dragItem]);

  // Sicherheit: Wenn die Maus losgelassen wird und kein Drop-Ziel reagiert,
  // beenden wir den Drag still.
  useEffect(() => {
    if (!dragItem) return;
    const onUp = () => {
      // Mikro-Delay, damit Hotspot/Item Drop-Handler zuerst feuern können.
      setTimeout(() => {
        setDragItem(null);
        setCursor(null);
      }, 0);
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, [dragItem]);

  const startDrag = useCallback(
    (item: InventoryItem, x: number, y: number) => {
      setDragItem(item);
      setCursor({ x, y });
    },
    [],
  );

  const updateCursor = useCallback((x: number, y: number) => {
    setCursor({ x, y });
  }, []);

  const endDrag = useCallback((): InventoryItem | null => {
    const it = dragItemRef.current;
    setDragItem(null);
    setCursor(null);
    return it;
  }, []);

  const selectItem = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const consumeActive = useCallback((): InventoryItem | null => {
    const drag = dragItemRef.current;
    const sel = selectedItemRef.current;
    setDragItem(null);
    setCursor(null);
    setSelectedItem(null);
    return drag ?? sel;
  }, []);

  return (
    <InventoryDragContext.Provider
      value={{
        dragItem,
        cursor,
        startDrag,
        updateCursor,
        endDrag,
        selectedItem,
        selectItem,
        clearSelection,
        activeItem: dragItem ?? selectedItem,
        consumeActive,
      }}
    >
      {children}
    </InventoryDragContext.Provider>
  );
}

export function useInventoryDrag() {
  const ctx = useContext(InventoryDragContext);
  if (!ctx) throw new Error("useInventoryDrag must be used within provider");
  return ctx;
}
