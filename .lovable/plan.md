# Hotspots gegen neue 16:9-Hintergründe ausrichten

## Problem

Durch das Outpainting auf 16:9 hat sich der Bildinhalt in jeder Szene innerhalb des 4:3-Safe-Zone-Layers leicht verschoben (Beispiel Apartment: das Schmerz-Radio steht jetzt deutlich weiter rechts; der `radio`-Hotspot bei `x: 0, y: 52` markiert noch die alte Wand). Das betrifft potenziell alle ~150 Hotspots in 19 Szenen sowie NPC- und Decal-Positionen.

Beim Repaint können sich außerdem Details verändern (Fenster verschoben, Möbel umgestellt) — eine reine mathematische Umrechnung reicht nicht. Wir brauchen einen **schnellen, visuellen QA-Loop pro Szene**.

## Werkzeug: Dev-Hotspot-Editor

Wir nutzen den vorhandenen "Space-halten zeigt alle Hotspots"-Mechanismus aus `SceneView.tsx` und erweitern ihn nur im Dev-Modus (`devMode.ts`, schon im Projekt) zu einem leichtgewichtigen Inline-Editor:

- Bei aktivem Dev-Mode + gehaltener Space-Taste:
  - Jeder Hotspot bekommt 8 Resize-Griffe + Drag-Handle.
  - Drag verschiebt den Hotspot, Eckziehen ändert `w`/`h`.
  - Werte werden live als Prozent (1 Nachkommastelle) im Hotspot-Label und in der Browser-Konsole angezeigt.
  - "C"-Taste über einem Hotspot kopiert dessen aktuelle Koordinaten als JSON-Snippet (`{ x, y, w, h }`) in die Zwischenablage.
- Gleicher Editor für `npcs` und `decals` (sie nutzen identisches Koordinatenschema).
- Kein Persistieren in der DB — der Editor ist nur ein Mess-/Kopierwerkzeug. Eingefügte Werte werden manuell in `src/game/scenes.ts` übernommen.

Das Tool gibt es nur, wenn `devMode` aktiv ist; im Produktionsbuild bleibt das Verhalten unverändert.

## Vorgehen pro Szene (≈ 1–2 Minuten)

```
1. Szene öffnen (Dev-Mode an)
2. Space halten → alle Hotspots/NPCs sehen
3. Falsch sitzende Hotspots per Drag/Resize über das gemeinte
   Objekt legen
4. "C" über jedem geänderten Hotspot → Koordinaten in Clipboard
5. In scenes.ts die x/y/w/h-Werte ersetzen
6. Reload, mit Maus durchklicken: jeder Hotspot zeigt korrekten
   Cursor + Caption über dem richtigen Objekt
```

## Reihenfolge der 19 Szenen

Nach Häufigkeit der Spielerinteraktion und Komplexität:

1. apartment (höchste Prio, sichtbar bug — Radio, Terminal, Bett, Telefon, Box B2, Tür, Fenster)
2. hallway / hallway-2615-sealed / hallway-elevator-sealed / hallway-elevator-and-2615-sealed (4 Varianten desselben Flurs — gleiche Hotspots)
3. apt2612 (mit/ohne Bodo) und apt2613
4. corridor15, corridor36 (+philippe), corridor46, corridor56
5. elevator, sectorDoor, e71Lobby, floor1Lobby, passage
6. room1532, room1534, serverRoom5610
7. commonRoomE67, cafeteriaE67 (waren schon nativ 16:9 — vermutlich nichts zu tun, trotzdem kurz prüfen)
8. aptMira4601 (war schon 16:9)

Die nativ-16:9-Szenen (10 Stück) müssten unverändert korrekt sein, werden aber als Sanity-Check trotzdem einmal kurz aufgerufen.

## Prüf-Checkliste pro Szene

Pro Szene jeweils festhalten:

- [ ] alle Hotspots: Cursor erscheint exakt über dem visuellen Objekt
- [ ] Caption erscheint mit passendem Label
- [ ] NPCs (falls vorhanden) stehen korrekt im Raum, nicht in Wand/Möbel
- [ ] Decals (TV im Common Room/Kantine) sitzen auf dem realen Bildschirm
- [ ] Exits führen zu erwarteten Szenen
- [ ] Falls Konditionalitäten (`requires`/`hiddenWhen`): mindestens einen positiven & negativen Zustand prüfen

Ergebnis: Häkchen-Liste in `.lovable/plan.md`, damit beim nächsten Pass nachvollziehbar ist, was bereits abgenommen wurde.

## Technische Details

### Neue Datei: `src/dev/HotspotEditor.tsx`

- Komponente, die innerhalb der 4:3-Safe-Zone in `SceneView.tsx` gerendert wird, wenn `isDevMode() && revealHotspots`.
- Nimmt `hotspots`, `npcs`, `decals` der aktuellen Szene als Props.
- Zustand lokal: `dragging | resizing | null`, aktuelle `{x,y,w,h}` der bearbeiteten Box.
- Mausposition wird relativ zum 4:3-Container in Prozent umgerechnet (`getBoundingClientRect`).
- Neue Werte werden **nicht** in den globalen State zurückgespielt — sie überschreiben nur die visuelle Darstellung lokal und werden geloggt/kopiert.
- Beim Loslassen: `console.info` mit Snippet `id: "<id>", x: 12.3, y: 45.6, w: 18.0, h: 22.4,` ready zum Einfügen.

### Anpassung `src/components/game/SceneView.tsx`

- Innerhalb der bestehenden 4:3-Safe-Zone den `HotspotEditor` zusätzlich montieren, wenn Dev + Space.
- Bestehende `Hotspot`-Komponente weiterhin verwenden (Maus-Interaktion bleibt aktiv, damit normales Spielen funktioniert).
- Editor-Layer liegt darüber mit `z-30`, akzeptiert Pointer-Events nur während aktivem Drag/Resize.

### Keine Änderungen an

- `src/game/scenes.ts`-Schema oder Typen (`src/game/types.ts`) — wir editieren nur die Werte.
- Mobile Stage / Aspect-Ratio-Logik — die ist mit dem 4:3-Layer + 16:9-Bühne richtig.
- Hotspot-Koordinatensystem (bleibt Prozent vom 4:3-Layer; das hat sich bewährt und vermeidet doppelte Umrechnungen).

## Liefer-Reihenfolge

1. Editor-Werkzeug bauen + dokumentieren (1 Schritt).
2. Szene 1–6 (Apartment + 4 Flure + apt2612/13) korrigieren — größte sichtbare Bugs.
3. Szene 7–13 (Korridore, Aufzug, Lobbies, Passage).
4. Szene 14–17 (Räume, Server-Raum).
5. Szene 18–19 (Common Room, Kantine, Mira-Apartment) — Sanity-Pass.
6. Final: kurzer End-to-End-Run durch Akt I, in dem jede Szene mindestens einmal besucht und jeder Pflicht-Hotspot benutzt wird.

Die Korrektur-Schritte 2–5 lassen sich auf mehrere Antworten aufteilen, damit du jederzeit zwischendrin reviewen kannst.
