# Mobile Interaktion: Fokus-Sheet statt Drag-and-Drop

Desktop bleibt unangetastet. Alles unten beschriebene wird über `useCoarsePointer()` ausschließlich für Touch-Geräte aktiv. Die bestehende Tap-to-Use-Mechanik (Item antippen → Banner oben → Hotspot antippen) wird durch einen umgekehrten, „Context-First"-Flow ersetzt: zuerst das Ziel, dann der Gegenstand.

## Kritische Anpassung gegenüber dem Gemini-Entwurf

Der Vorschlag trennt „Untersuchen" und „Benutzen". Im Code hat ein `Hotspot` aber genau **eine** Aktion (`onUse`) — `label` ist nur die Bezeichnung. Eine Trennung wäre erfunden und müsste an hunderten Stellen nachgepflegt werden. Stattdessen leitet das Sheet seine Primär-Aktion aus `hotspot.kind` ab (`look | use | talk | exit`) und zeigt nur dort einen Item-Slot, wo Kombination Sinn ergibt.

Exits (`kind: "exit"`) und reine Talks bekommen kein Sheet, sondern lösen weiterhin direkt aus — alles andere wäre eine Bremse in jedem Türklick.

## Flow (mobil)

```text
Tap auf Hotspot (kind ≠ exit)
        │
        ▼
 Hintergrund dimmt + Hotspot bekommt CRT-Rahmen
        │
        ▼
 Bottom-Sheet slidet in die Thumb-Zone
   ┌────────────────────────────────┐
   │ FOKUS: <hotspot.label>         │
   │ [ Primär-Aktion ]              │  ← „Ansehen" / „Benutzen" / „Sprechen"
   │ [ Gegenstand verwenden… ]      │  ← nur wenn Inventar nicht leer
   │ [ Abbrechen ]                  │
   └────────────────────────────────┘
        │
        ▼ (bei „Gegenstand verwenden…")
   Item-Strip klappt darüber auf:
   horizontal scrollbar, 64×64-Buttons
        │
        ▼ Tap auf Item
   Sheet schließt, combineItem() läuft,
   Caption/Reaktion wie gewohnt
```

Shortcuts bleiben erhalten:
- Tap auf ein Inventar-Item öffnet weiter den bestehenden „selected"-Zustand (Banner oben). Ein darauffolgender Tap auf einen Hotspot wendet das Item direkt an, ohne das Sheet zu öffnen. Power-User-Pfad für wiederholte Kombinationsversuche.
- Doppelter Tap auf einen Exit ist nicht nötig — Exits umgehen das Sheet komplett.

## Was passiert in welcher Datei

**Neu: `src/components/game/mobile/FocusSheet.tsx`**
- Bottom-Sheet-Komponente (Tailwind, `fixed inset-x-0 bottom-0`, `safe-area-inset-bottom`, slide-in via `transition-transform`).
- Props: `hotspot`, `onClose`, `onPrimary`, `onUseItem(item)`.
- Rendert Primär-Aktion abhängig von `hotspot.kind`:
  - `look` → „Ansehen"
  - `use` (Default) → „Benutzen"
  - `talk` → „Sprechen"
- Item-Strip: horizontal scrollbar (`overflow-x-auto`, `snap-x`), Buttons mit `ItemIcon` + Kurzname, min. 64×64 dp.
- Stil aus dem bestehenden Design-System: `border-amber-glow`, `font-mono-crt`, `bg-background/95`, leichter Scanline-Overlay-Stil wie bei den anderen Overlays.
- Schließt bei Tap auf Backdrop, Escape, Hardware-Back (über `popstate`-History-Eintrag wie bei `DialogOverlay`).

**Neu: `src/game/mobile/focusSheetState.ts` (oder als Context in `InventoryDragContext`)**
- Globaler State `focusHotspot: Hotspot | null`, `open(hotspot)`, `close()`.
- Begründung Context: Hotspot lebt in `HotspotLayer`, das Sheet muss aber außerhalb der Bühne (über `<Game>`-Root) gerendert werden, damit Dimm-Backdrop und Sheet die ganze App überdecken. Ein dünner Context vermeidet Prop-Drilling.

**`src/components/game/Hotspot.tsx`**
- `onClick`: Wenn `useCoarsePointer()` true und `hotspot.kind !== "exit"` und `drag.selectedItem == null` → `focusSheet.open(hotspot)` statt `hotspot.onUse(api)`.
- Bestehender Shortcut (selectedItem gesetzt → direkt kombinieren) bleibt unverändert.
- Desktop-Pfad (kein coarse pointer) bleibt 1:1 wie heute (Klick = `onUse`, Drag = combine).

**`src/components/game/Game.tsx` (oder GameShell)**
- Einmal `<FocusSheet />` auf oberster Ebene mounten, liest aus dem neuen Context.
- Backdrop und Sheet selbst werden nur gerendert, wenn `focusHotspot && isCoarse`.

**`src/components/game/ActiveItemBanner.tsx`**
- Bleibt bestehen für den Shortcut-Pfad (Item zuerst angetippt). Kein Eingriff nötig.

**`src/components/game/Inventory.tsx`**
- Hilfetext im Floating-Panel (Zeilen ~285-297) anpassen für mobile: „Tippen: Ziel wählen → Aktion. Halten: ansehen." Sonst keine Logikänderung — das Panel bleibt sekundärer Zugang.

**`src/styles.css`**
- Bei Bedarf eine Utility-Klasse `.hotspot-touch` prüfen/erweitern, damit Hotspots auf coarse pointer ein Mindest-Hit-Target von 44×44 dp bekommen (über `::after`-Pseudo-Element, ohne das visuelle Layout zu verändern). Falls bereits vorhanden, nur Werte verifizieren.

## Audio / Haptik

- Sheet-Open: vorhandener `sfx.ui.tap`-Sound (falls existent, sonst stumm — keine neuen Assets in diesem Schritt).
- Optional: `navigator.vibrate?.(8)` beim Öffnen des Sheets. Mit Fallback `?.` — kein Bruch, wo nicht unterstützt.

## Was bewusst NICHT Teil dieses Plans ist

- Kein Kamera-Zoom auf den Hotspot (vom Gemini-Entwurf vorgeschlagen). Die Szenen sind handgemalt mit fixen Layouts, ein Zoom würde Pixel matschen und alle anderen Hotspots verdecken. Stattdessen reicht der CRT-Rahmen + Dimm-Backdrop.
- Keine Trennung „Untersuchen vs. Benutzen" (siehe oben).
- Keine Änderung an `Hotspot`-Datenmodell, keine Migration in `scenes/*`.
- Keine Desktop-Änderungen.

## Test-Szenarien

1. Aufzug E67: Tap auf Kartenschlitz-Hotspot → Sheet zeigt „Benutzen" + „Gegenstand verwenden…". Letzteres → Strip mit Bewohnerausweis → Tap → Etage freigeschaltet, Sheet zu.
2. Apartment, Bücherschrank (`kind: "look"`): Sheet zeigt „Ansehen" als Primär-Aktion.
3. NPC mit `kind: "talk"`: Sheet zeigt „Sprechen".
4. Korridor-Exit (`kind: "exit"`): Tap wechselt direkt die Szene, kein Sheet.
5. Shortcut: Inventar-Item antippen (Banner oben) → Tap auf Hotspot → direktes Combine, Sheet erscheint nicht.
6. Backdrop-Tap und Hardware-Back schließen das Sheet, ohne Aktion auszulösen.
7. Desktop (fine pointer): unverändertes Klick- und Drag-Verhalten, kein Sheet erscheint je.
