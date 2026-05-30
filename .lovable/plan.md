# Plan: Overlay-Verschieben im Dev-Modus verschlanken

## Ziel

Das Drag/Resize-Tool für Hotspots/NPCs/Decals bleibt wie es ist. Aber der Workflow rundherum wird aufs Wesentliche reduziert:

- **Keine OK / Fix / Skip Buttons mehr** und keine Status-Zählung (`✓ x · ✎ y · …`).
- **„Report kopieren"** baut automatisch einen kompakten, credit-schonenden Prompt aus genau dem, was sich seit dem letzten Kopieren geändert hat — neue Boxen, geänderte Boxen, gelöschte Boxen. Unverändertes wird weggelassen.
- Wenn nichts neues da ist: kurzer Hinweis statt leerem Report.

## Änderungen

### `src/dev/overlayQAState.ts`

- Entfernen: `QAStatus`, `getStatus`, `setStatus`, `clearAllStatus`, `STATUS_KEY`, `pushSnippet`, `getSnippets`, `getSnippetsBy`, `clearSnippets`, der gesamte `snippetBuffer`, sowie `isEditorForced` / `setEditorForced` (Editor ist ab jetzt einfach immer an, solange QA aktiv ist — ein Toggle weniger).
- Behalten: `isQAActive` / `setQAActive`, `BoxOverride`, `getOverridesFor`, `setOverride`, `clearOverridesFor`, `clearAllOverrides`, `getOverrideCount`, `useQA`.
- **Neu**: Snapshot-Mechanik für das Delta.
  - Key `e67.overlayQA.lastReport` enthält serialisiertes `AllOverrides` vom Zeitpunkt des letzten „Report kopieren".
  - `getLastReportSnapshot(): AllOverrides`
  - `setLastReportSnapshot(snap: AllOverrides)`
  - `diffSinceLastReport(): { added, changed, removed }` — vergleicht aktuellen `readAll()` mit Snapshot, gruppiert pro `sceneId`/`boxId`.

### `src/dev/OverlayQAOverlay.tsx`

- Entfernen: OK / Fix / Skip Buttons, Zähler-Zeile, `showReport`-Toggle samt `<pre>`-Vorschau, „Editor an/aus" Button, `goIdx`-Pfeile bleiben (Raum-Navigation ist nützlich).
- Übrig bleiben in der Toolbar: `QA starten/aktiv`, `Raster an/aus`, Szenen-Navigation `◀ scene ▶`, `Report kopieren`, `Reset`.
- `buildReport()` neu: ruft `diffSinceLastReport()` auf und baut einen Prompt im Stil:

  ```text
  Wende diese Overlay-Korrekturen an (Werte in % der Bühne):

  ## src/game/scenes/<file>.ts — sceneId: <id>
  - geändert: id "schreibtisch" → x: 12.4, y: 41.8, w: 18.0, h: 22.5
  - neu:      id "neuer-hotspot" → x: …, y: …, w: …, h: …
  - gelöscht: id "alt-hotspot"
  ```

  Pro Szene nur ein Block, nur Boxen mit Delta. Wenn `added+changed+removed === 0`: Text `"Keine Änderungen seit letztem Report."` kopieren und kurzen Toast/`alert` zeigen.

- Nach erfolgreichem `clipboard.writeText` → `setLastReportSnapshot(readAll())`, damit der nächste Klick wieder nur das Neue liefert.
- `Reset` löscht weiterhin alle Overrides **und** den Snapshot.

### `src/dev/HotspotEditor.tsx`

- Aufrufe von `pushSnippet(...)` / `setStatus(..., "fix")` entfernen (die Funktionen verschwinden). Drag-Ende ruft nur noch `setOverride(...)`.
- Editor-Aktivierung: statt `isEditorForced()` einfach `isQAActive()` prüfen (oder ein dedizierter `editor`-State wenn er anderswo gebraucht wird — siehe Such-Treffer unten verifizieren).

### `SceneView.tsx`, `GameShell.tsx`, `SectorThresholdCutscene.tsx`

- Nur die Importe/Aufrufe der entfernten Symbole anpassen (vermutlich `isEditorForced`); inhaltlich kein Verhaltenswechsel außer „Editor an, sobald QA aktiv".

## Technische Details

- Delta-Vergleich tolerant gegen Float-Rauschen: Werte vor dem Vergleich auf 1 Nachkommastelle runden (gleiche Präzision wie der ausgegebene Snippet), sonst gelten minimale Mausbewegungen schon als „geändert".
- Snapshot wird beim allerersten „Report kopieren" leer angenommen → erster Report enthält alles, was aktuell als Override vorliegt. Genau das Verhalten, das man will.
- `getOverrideCount()` bleibt für die Footer-Zeile.
- Keine Änderungen an Persistenz-Format der Overrides selbst → bestehende lokale Korrekturen gehen nicht verloren.

## Nicht im Scope

- Drag/Resize-Mechanik im Editor selbst.
- Original-Werte aus den Szenen-Dateien parsen (Prompt enthält nur die neuen Zielwerte; Lovable findet die zu ersetzende Box anhand `sceneId` + `id`).
