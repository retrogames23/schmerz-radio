

## Ziel

Das gesamte Spiel auf **16:9** umstellen — sauber, ohne dass Hintergründe beschnitten werden oder Hotspots an den falschen Stellen liegen.

## Ausgangslage

- Die Szene rendert aktuell mit `aspect-[4/3]` in `SceneView.tsx`.
- **Alle 17 Hintergrundbilder** in `src/assets/` sind im **4:3-Format** generiert.
- Hotspot-Koordinaten (`x`, `y`, `w`, `h` in `scenes.ts`) und NPC-Sprite-Positionen (z. B. Mira) sind als **Prozentwerte relativ zum 4:3-Bild** definiert.

Das heißt: Eine reine Container-Umstellung auf 16:9 reicht nicht — die Bilder würden entweder oben/unten beschnitten (bei `object-cover`) oder verzerrt (bei `object-fill`), und alle Hotspots würden verrutschen.

## Vorgeschlagene Lösung — „Letterbox-Ansatz“ (einfach, sicher, nicht-invasiv)

Der **äußere Spielrahmen** wird auf 16:9 umgestellt, aber die **Bühne (Bild + Hotspots)** bleibt intern 4:3 und wird mittig in den 16:9-Rahmen gesetzt — mit thematisch passenden schwarzen Balken links/rechts (Letterbox/Pillarbox, wie bei Retro-Adventures üblich).

### Vorteile
- **Keine Beschneidung** der Hintergründe — alles bleibt sichtbar.
- **Hotspots, NPC-Sprites und alle Prozent-Koordinaten bleiben exakt erhalten** — keine Datei in `scenes.ts` muss angefasst werden.
- **Keine Asset-Neugenerierung** nötig.
- 16:9-Container nutzt die Breite moderner Bildschirme besser; die schwarzen Seitenstreifen wirken wie ein Kino-/CRT-Rahmen und passen zur Ästhetik (Scanlines, Amber-Glow).

### Änderungen

**1. `src/components/game/SceneView.tsx`**
- **Äußerer Container**: `aspect-[16/9]` statt `aspect-[4/3]`. Behält `h-full max-h-full w-auto max-w-full`, damit er weiterhin in den verfügbaren Viewport-Platz passt (Höhe-getrieben, Breite folgt aus 16:9).
- **Innerer „Bühne“-Container**: Neu eingefügtes Element mit `aspect-[4/3] h-full mx-auto relative` — hier hinein kommen Hintergrundbild, NPCs, Hotspots, Caption, Vignette, Scene-Intro. Alle bestehenden Prozent-Koordinaten arbeiten weiterhin gegen diesen 4:3-Bereich.
- Der äußere 16:9-Container bekommt `bg-black` (sichtbar als seitliche Letterbox-Streifen) und behält `scanlines` + den `resonance-shake`-Effekt.

```text
+--------------------------------------------------+   <- 16:9 Außenrahmen (schwarz, scanlines)
|        +--------------------------+              |
|  ░░░   |   4:3 Bühne (Hotspots)   |   ░░░        |
|        +--------------------------+              |
+--------------------------------------------------+
```

**2. Overlays**
- `TextOverlay`, `DialogOverlay`, `RadioPanel`, `Terminal`, `Ending`, `PauseMenu` werden absolut auf den **äußeren 16:9-Rahmen** gelegt (statt wie bisher implizit auf den 4:3-Bereich), damit sie die volle Breite des neuen Formats nutzen können. Da diese Overlays in `Game.tsx` als Geschwister von `<SceneView />` im selben relativen Container liegen, ist das automatisch erfüllt — keine Code-Änderung nötig, nur Verifizierung in `Game.tsx`.

**3. Keine Änderungen an**:
- `scenes.ts` (Hotspot-Koordinaten bleiben gültig).
- Asset-Dateien (Hintergründe bleiben 4:3).
- `Game.tsx`-Layout, `TopBar`, `Inventory` (skalieren bereits flexibel mit).

### Effekt

- **Laptop (1366×768)**: 16:9-Rahmen ~1080×608, darin mittig 4:3-Bühne ~810×608 mit ~135px Letterbox-Streifen links/rechts.
- **Desktop (1920×1080)**: Rahmen ~1280×720, Bühne ~960×720, Streifen ~160px.
- **Schmale Viewports**: Über `max-w-full` greift die Breitenbegrenzung; Höhe folgt aus 16:9.

## Optional (später, falls gewünscht)

Falls du irgendwann **echte 16:9-Bilder ohne Letterbox** willst, müssten wir alle 17 Hintergründe neu generieren **und** sämtliche Hotspot-Koordinaten in `scenes.ts` neu vermessen. Das ist ein deutlich größerer Eingriff — der Letterbox-Ansatz oben ist die pragmatische Lösung und liefert sofort ein 16:9-Spielerlebnis.

