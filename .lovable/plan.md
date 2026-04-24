

## Overlay-Position Tür 5610 korrigieren

### Problem
Der Hotspot für Tür 5610 liegt aktuell bei `x:24, y:32, w:14, h:50` und damit **rechts neben** der eigentlichen Tür im Hintergrundbild. Der orangene Rahmen markiert leere Wand statt der Tür mit der „5610"-Aufschrift.

### Korrektur
In `src/game/scenes.ts` (Hotspot `door5610` in der Szene `corridor56`) die Koordinaten auf die tatsächliche Türposition im Hintergrund anpassen:

```text
vorher:  x: 24, y: 32, w: 14, h: 50
nachher: x:  8, y: 16, w: 16, h: 74
```

Damit deckt der klickbare Bereich die komplette Stahltür von oben (Türrahmen) bis zum Boden ab und liegt links im Bild — exakt da, wo „5610" steht.

### Nicht betroffen
- Sichtbarkeitslogik (Mira/Radio/Philippe-Sonden) bleibt unverändert.
- `onUse`-Verhalten (Erstkontakt → Keypad) bleibt unverändert.
- Andere Hotspots im Korridor (Mira, Aufzug, etc.) werden nicht angefasst.

### Technische Details
Eine einzige Änderung im Hotspot-Objekt `door5610` in `src/game/scenes.ts` (~Zeile 1715–1720). Keine weiteren Dateien betroffen.

