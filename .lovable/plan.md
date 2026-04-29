# Mobile-Inventar: Tap-to-Use statt Drag & Drop

## Ziel

Auf mobilen Geräten ersetzen wir die Drag-&-Drop-Kombinationsmechanik durch ein klassisches Adventure-Pattern:

- **Tap** auf ein Item = „in die Hand nehmen" (selektieren, dann mit Hotspot/Item kombinieren).
- **Long-Press** auf ein Item = ansehen / lesen (Beschreibung, Handbuch, Ausweis).
- Ein **Banner oben** zeigt das aktive Item: *„Verwende: Wartungskarte mit … [Abbrechen]"*.
- Aktentasche schließt sich automatisch nach Selektion, damit die Szene frei wird.
- **Tap auf Hotspot/NPC oder anderes Inventar-Item** löst dann `combineItem(...)` aus.

Auf Desktop (bzw. Geräten mit `pointer: fine`) bleibt alles wie heute: Drag & Drop, Klick = ansehen.

## Erkennung Mobile vs. Desktop

Über `window.matchMedia("(pointer: coarse)").matches` (auch reaktiv via Listener), kapselt in einem kleinen Hook `useCoarsePointer()` in `src/hooks/`. Damit bleibt es unabhängig vom `MobileStage`-Wrapper und funktioniert auch im Querformat-Tablet sauber.

## Architektur-Änderungen

### 1. `InventoryDragContext.tsx` erweitern

Neuen parallelen State einführen, ohne Drag-Logik anzufassen:

- `selectedItem: InventoryItem | null`
- `selectItem(item)` / `clearSelection()`
- Helper `activeItem` = `dragItem ?? selectedItem` für Drop-Empfänger (Hotspot/Inventory).

So müssen Hotspot und Inventory-Slots nur **eine** Quelle abfragen, egal ob Drag oder Tap-Selection.

### 2. `Inventory.tsx`

- Mobile-Pfad: `onClick` (kurzer Tap) → `selectItem(item)` und Panel schließen.
- `onPointerDown` startet einen 450-ms-Timer → bei Auslösung = „ansehen" (Beschreibung / Handbuch / Ausweis), wie heute beim einfachen Klick.
- Bewegt sich der Finger > 6 px oder Pointerup vor 450 ms → Tap-Pfad (Selektion).
- Desktop-Pfad: bestehende Drag-Logik bleibt 1:1.

### 3. `Hotspot.tsx`

- `onClick`: wenn `activeItem` gesetzt ist → `combineItem(...)` aufrufen, Selection clearen, statt `hotspot.onUse(api)`.
- Cursor-Stil `cursor-copy` zeigen, wenn `activeItem` (nicht nur `dragItem`).

### 4. Neue Komponente `ActiveItemBanner.tsx`

Wird in `Game.tsx` neben `DragCursorLayer` gemountet. Zeigt nur, wenn `selectedItem` gesetzt:

```
┌─────────────────────────────────────┐
│ ✋ Verwende: Wartungskarte mit …   │
│                          [Abbrechen]│
└─────────────────────────────────────┘
```

Position: oben mittig, `fixed`, hoher z-Index, in Amber-Glow-Stil passend zur UI. Tap auf Banner-Hintergrund oder Abbrechen-Button → `clearSelection()`.

### 5. Inventory-Slot zeigt Selektion

Aktiv selektiertes Item bekommt denselben „abgehobenen" Look wie heute beim Dragging (z. B. Amber-Border + Glow), damit klar ist, was in der Hand ist.

### 6. Auto-Clear beim Szenenwechsel

In `GameContext` (oder via Effect im Provider) bei Scene-Change automatisch `clearSelection()` aufrufen — verhindert, dass man mit ungewollt aktivem Item in eine neue Szene wechselt.

## UX-Details

- **Tap-auf-leeren-Bereich**: Tap auf die Bühne (außerhalb von Hotspots) bei aktiver Selektion → Selektion bleibt aktiv. Nur explizit über Banner abbrechen oder erneut auf das selbe Item tappen → Toggle off.
- **Item-auf-Item kombinieren**: Aktentasche bleibt nach Selektion zu. Spieler tippt erneut Aktentasche → öffnet → Tap auf Ziel-Item kombiniert. Quelle und Ziel werden visuell unterschiedlich hervorgehoben.
- **Long-Press-Visuelle-Rückmeldung**: optionaler dezenter Ring-Progress um das Item während der 450 ms.

## Geänderte / neue Dateien

- `src/hooks/useCoarsePointer.ts` (neu)
- `src/game/InventoryDragContext.tsx` — Selection-State ergänzen
- `src/components/game/Inventory.tsx` — Mobile-Tap-Pfad + Long-Press
- `src/components/game/Hotspot.tsx` — `activeItem` statt `dragItem`
- `src/components/game/ActiveItemBanner.tsx` (neu)
- `src/components/game/Game.tsx` — Banner mounten
- `src/game/GameContext.tsx` — Auto-Clear bei Scene-Change

## Nicht-Ziele

- Keine Änderung an `combineItem` oder den bestehenden Rätseln.
- Kein Bottom-Sheet-Redesign der Aktentasche (kann später folgen).
- Kein Radial-Menü, keine Spoiler-Hilfen.
