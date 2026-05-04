## Ziel

Eine einfache, **credit-günstige** Methode, mit der du die Overlay-Korrektheit (Hotspots, NPCs, Decals) für **alle Räume** systematisch prüfen und direkt nachjustieren kannst — ohne dass dabei AI-Credits verbraucht werden. Es geht rein um lokale UI-Tooling-Erweiterungen, kein LLM, kein Server.

## Idee in einem Satz

Ein neuer Dev-Modus „**Overlay-QA**“ läuft alle Szenen automatisch durch, zeigt dir pro Raum sofort alle Overlays über dem Bild, du klickst „OK“ oder korrigierst mit dem bestehenden HotspotEditor, und am Ende bekommst du einen kompletten Report, welche Räume du als „geprüft“ markiert hast und welche Korrekturen du in der Zwischenablage gesammelt hast.

## Was neu gebaut wird

### 1. `OverlayQAOverlay` (neu, `src/dev/OverlayQAOverlay.tsx`)
Ein dünnes Dev-Overlay (nur bei `?dev=1` aktiv), das oben im Screen eine Leiste einblendet:

```text
[◀ Prev] [Raum 5/19: corridor56] [Skip] [✓ OK] [✎ Korrigieren] [Next ▶]   (3 OK / 1 todo)
```

- Iteriert automatisch durch `Object.keys(scenes)` in fester Reihenfolge.
- Beim Wechsel ruft es `api.goTo(sceneId)` auf — keine Story-Flags ändern (nutzt vorhandene Switcher-Mechanik).
- Blendet **dauerhaft** alle Hotspot-Rahmen ein (forciert `revealHotspots=true` für die QA-Session), damit du nicht Space halten musst.
- Zeigt eine Mini-Checkliste pro Raum: „Anzahl Hotspots: N · NPCs: M · Decals: K“.
- Status pro Raum wird in `localStorage` gespeichert (`e67.overlayQA.<sceneId>` = `ok|todo|skip`), damit man die QA in mehreren Sessions machen kann.

### 2. „Korrigieren“-Button bindet bestehenden HotspotEditor ein
- Klick auf „✎ Korrigieren“ schaltet den vorhandenen `HotspotEditor` an (statt nur über Space). Der Editor existiert schon und kopiert Snippets in die Zwischenablage — keine neue Logik nötig.
- Zusätzlich sammelt das QA-Overlay alle kopierten Snippets in einem In-Memory-Buffer und zeigt unten einen ausklappbaren „Patch-Report“ (Liste pro Raum), den man am Ende mit einem Klick als ganzen Block in die Zwischenablage kopieren kann.

### 3. Visuelles Pixel-Raster (optional einblendbar)
- Toggle „Raster“ legt ein 5%-Prozentraster über die Bildfläche (nutzt bereits das pixelgenau berechnete `imgRect` aus `SceneView`). Das macht Sicht-Korrekturen drastisch schneller, weil man Kanten direkt am Raster ablesen kann.

### 4. Report-Export
- Knopf „Report kopieren“ erzeugt einen Markdown-Block:
  ```text
  ## Overlay-QA-Report
  - apartment        ✓ ok
  - hallway          ✓ ok
  - corridor56       ✎ korrigiert (3 Snippets)
  - elevator         ⚠ todo
  ...
  ```
  Du kannst den Report dann im Chat einfügen, und ich übernehme die gesammelten Snippets in einem einzigen Folge-Loop in `src/game/scenes/*.ts` — das ist der credit-sparende Teil: **eine** AI-Runde für viele Räume statt einer Runde pro Raum.

### 5. Kleine SceneView-Hooks
- `SceneView.tsx` bekommt eine optionale Prop bzw. liest einen Dev-Context, der `revealHotspots` und „Editor immer an“ erzwingen kann, wenn die QA läuft. Kein Verhalten für normale Spieler.

## Was NICHT gebaut wird

- **Kein automatischer Bild-Vergleich / kein Vision-LLM.** Das wäre teuer und für 19 Räume Overkill — du siehst Fehlausrichtungen in 1–2 Sekunden pro Raum mit dem Auge.
- **Keine Server-Roundtrips.** Alles läuft im Browser, daher null Backend-Kosten.
- **Kein automatisches Schreiben in `src/game/scenes/*.ts`.** Bleibt manuell/per AI-Folgeloop, weil sonst Risiko, dass „falsch korrigierte“ Werte direkt eingespielt werden.

## Workflow für dich

1. `?dev=1` öffnen → neuer Button „QA“ unten links neben dem ⚡-Switcher.
2. Auf „QA starten“ klicken → Spiel springt zu Raum 1, alle Overlays sichtbar, optional Raster an.
3. Pro Raum: kurz draufschauen → „✓ OK“ oder „✎ Korrigieren“ → im Editor die Box ziehen → Snippet wird automatisch kopiert → „Next ▶“.
4. Am Ende: „Report kopieren“ → Report + Snippets in den Chat → ich pflege die Korrekturen in **einem einzigen** Loop in die Szenen-Dateien ein.

## Geänderte / neue Dateien

- **neu** `src/dev/OverlayQAOverlay.tsx` — die QA-Leiste, Status-Persistenz, Raster, Report.
- **neu** `src/dev/overlayQAState.ts` — kleiner Zustand (localStorage + Snippet-Buffer + Event-Bus).
- **bearbeitet** `src/components/game/SceneView.tsx` — liest QA-State und erzwingt `revealHotspots` + Dauer-Editor, wenn aktiv; rendert das Raster-Overlay über `imgRect`.
- **bearbeitet** `src/dev/HotspotEditor.tsx` — meldet jedes kopierte Snippet zusätzlich an den QA-Buffer (kleine Erweiterung, bestehende Funktion bleibt).
- **bearbeitet** `src/dev/RoomSwitcher.tsx` (oder neue eigene Floating-Button-Datei) — zweiter Floating-Button „QA“ neben dem ⚡-Symbol, damit Einstieg klar ist.

## Aufwand & Credit-Bilanz

- Implementierung: 1 kompakter Loop, keine neuen Pakete, kein Backend, kein LLM.
- Laufende Kosten der QA selbst: **0 Credits** (alles clientseitig).
- Folgekorrekturen aller Räume in **einer** AI-Runde statt vieler Einzelrunden — genau wie beim aktuellen „Overlays Hallway / corridor56 korrigieren“-Schema, nur gebündelt.
