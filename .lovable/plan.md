## Ziel

1. Hotspot-Rahmen sind im Normalbetrieb komplett unsichtbar — sichtbar nur, solange die Leertaste gehalten wird.
2. Hotspot-Boxen liegen pixelgenau über den jeweiligen Objekten im Hintergrundbild — auch ohne sichtbaren Rahmen.
3. Das gesamte Spiel arbeitet konsistent in **16:9**.

## Befund

Der Versatz kommt aus `src/components/game/SceneView.tsx`: Das Hintergrundbild liegt in der **äußeren 16:9-Bühne** (`object-contain`, füllt die volle Breite), der Hotspot-Layer dagegen in einem inneren **4:3-Container** (75 % der Breite, mittig). Das war ein Workaround aus der Zeit, als die Bilder unterschiedliche Seitenverhältnisse hatten.

Die meisten Hintergrundbilder sind bereits 16:9 (1376×768, 1280×720, 1920×1080). Vier Ausnahmen:
- `scene-elevator.jpg` (1024×768, 4:3)
- `scene-corridor-46.jpg` (1536×1024, 3:2)

Die Hotspot-/NPC-/Decal-Koordinaten in `src/game/scenes/*.ts` sind heute in **Prozent des 4:3-Kastens** angegeben (498 Koordinatenzeilen).

## Umsetzung

### 1. Bühne und Hotspot-Layer auf 16:9 vereinheitlichen

`SceneView.tsx`:
- Den inneren 4:3-Container entfernen — Hintergrund-`<img>`, NPCs, Decals, Hotspots, Caption etc. teilen denselben 16:9-Container (= die Bühne selbst).
- `<img>` bekommt `object-cover` (statt `contain`) mit `object-position: center`. Damit füllt das Bild den 16:9-Rahmen exakt aus; bei nicht-16:9-Bildern (Aufzug, Korridor 46) wird minimal beschnitten — der 4:3-Bereich, in dem alle Objekte liegen, bleibt erhalten.
- Nach späterer Re-Generierung dieser zwei Bilder als 16:9 entfällt jegliches Beschneiden.

### 2. Vorhandene Koordinaten von 4:3 → 16:9 umrechnen

Mechanische Transformation: alter 4:3-Kasten ist 75 % breit und zentriert in 16:9.

```
neu_x = 12.5 + alt_x * 0.75
neu_w = alt_w * 0.75
neu_y = alt_y
neu_h = alt_h
```

Gleiches gilt für `caption.x`, NPC-Positionen, Decal-Positionen, `bgFocus.originX`. Wir schreiben ein einmaliges Node-Skript (`scripts/migrate-coords-16-9.mjs`), das alle `src/game/scenes/*.ts` parst und numerische Felder konsistent umrechnet. Vor dem Schreiben gibt das Skript einen Diff aus zur Sichtprüfung.

Skript-Strategie: AST-frei mittels regex auf den Objektliteralen wäre fragil. Stattdessen: das Skript verwendet `ts-morph` (oder einfach das in TanStack vorhandene `typescript`-Paket) und manipuliert Literale gezielt anhand der Property-Namen `x`, `y`, `w`, `h`, `originX`, `originY` innerhalb von `hotspots`, `npcs`, `decals`, `caption`, `bgFocus`.

Nach der Migration prüfen wir 4–6 Szenen visuell mit gehaltener Leertaste auf Pass-genauigkeit; bei Restdrift wird per HotspotEditor (bereits vorhanden, `?dev=1` + Leertaste) nachjustiert.

### 3. Hotspot-Hover unsichtbar

`Hotspot.tsx`:
- Wenn `reveal === false` und kein Inventar-Drag aktiv: **keine** Hover-/Focus-Klassen mehr (heute: `border-amber-glow/80 bg-amber-glow/10` beim Hover) — nur Cursor-Kontext + Caption-Label unten als Feedback.
- `reveal === true` (Leertaste): unverändert Rahmen + Label-Pille.
- Drag-Pfad (`drag.activeItem`): unverändert dezenter Drop-Hinweis.

### 4. Hilfe-Hinweis ergänzen

`HelpOverlay.tsx`: kurzen Eintrag „Leertaste halten – alle Objekte einer Szene anzeigen", falls noch nicht vorhanden.

## Geänderte / neue Dateien

- `src/components/game/SceneView.tsx` — 4:3-Inner-Container entfernen, `<img>` auf `object-cover`.
- `src/game/scenes/*.ts` (alle 5) — Koordinaten via Skript umgerechnet.
- `src/components/game/Hotspot.tsx` — Hover-Reveal entfernen.
- `src/components/game/HelpOverlay.tsx` — Hinweis ergänzen.
- `scripts/migrate-coords-16-9.mjs` (neu, einmalig) — Migrationsskript.

## Folgeschritte (separat, nicht Teil dieses PRs)

- `scene-elevator.jpg` und `scene-corridor-46.jpg` perspektivisch als 16:9 neu generieren, damit kein Beschnitt mehr nötig ist. Bis dahin sorgt `object-cover` dafür, dass die für Hotspots relevante Bildmitte sichtbar bleibt.
