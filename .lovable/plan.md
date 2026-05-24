## Ziel

Wenn Layard in `sectorDoor` die entriegelte Schleuse anklickt, statt der heutigen 7-zeiligen Inline-Tafel (`feetWontMove`) eine vollwertige Cutscene im Stil der bestehenden `Act2BridgeCutscene` zeigen — schwarze Tafeln, Phosphor-Header, optisch kongruent zu `sectorDoor` / `passage` und Layards bisheriger Innenstimme. Während der Cutscene spielt der angehängte Track *The City Forgets*. Am Ende: Cutscene endet, `feetWontMove` + neue Marker-Flag gesetzt, Spieler landet in `passage`.

## Inhalt (4 Tafeln, Präsens, leicht gekürzt aus der Vorlage)

```text
Beat 1  · header "Sektor 28 · Schleuse · E67"  · style black
  "Und obwohl er intensiv daran denkt, durch die schwere Eisentüre zu gehen,
   raus aus E67 … seine Füße bewegen sich nicht."

Beat 2  · style amber
  "Wer bin ich, fragt sich Layard. Warum gehorcht mein Körper meinen Gedanken nicht?"
  "Vielleicht stimmt etwas nicht mit mir selbst. Die Beziehung zu ihm. Dieses Universum."
  "Er hat es sich lange nicht mehr angesehen. Dabei war er doch so neugierig."
  "Vielleicht, denkt er, lassen sich die Schichten des inneren Klumpens, der sich um
   seine Gefühle gelegt hat, abtragen. Dafür sollte er sie sich anschauen. Gründlich
   und furchtlos. Wie ein Krieger in Babylon. Woher kommt jetzt dieses Bild?"

Beat 3  · style amber
  "Was, so überlegt sich Layard, wenn ich dieses Protokoll nicht abliefere?
   Was ändert sich? Würde er bestraft werden?"
  "Die Idee, Freiheit zu besitzen, Handlungsfreiheit, hat fast etwas Verbotenes."
  "Andererseits: E71. Eine andere Welt. Ein Abenteuer? Ein Grund, den Quadranten
   zu verlassen. Eine Aufgabe."

Beat 4  · header "Sektor 28 · Schleuse · jenseits"  · style black
  "Seine Füße setzen sich in Bewegung. Layards Körper gehorcht ihm."
  "Das Öffnen der Tür, die milde Abendkälte auf der Haut —"
  "— das fühlt sich fast nach Freiheit an."
```

Sprache durchgängig Präsens (Memory-Regel `mem://preferences/tense.md`).

## Umsetzung (Code)

1. **Asset**
   `src/assets/music/The_City_Forgets.mp3` (Kopie der hochgeladenen Datei).

2. **Cutscene-Typ + Daten** (`src/game/types.ts`, `src/game/cutscenes.ts`)
   - `CutsceneId` um `"sectorThreshold"` erweitern.
   - In `cutscenes.ts` neuen Export `SECTOR_THRESHOLD_BEATS: Act2BridgeBeat[]` (gleiche `Act2BridgeBeat`-Shape wiederverwenden) + `SECTOR_THRESHOLD_UI_TEXT.skipHint = "Enter / Klick · weiter · Esc · überspringen"`.

3. **Komponente** `src/components/game/SectorThresholdCutscene.tsx`
   - Strukturell parallel zu `Act2BridgeCutscene`: Idx-State, Auto-Advance (Sockel 3.4 s + 1.6 s/Zeile), Crossfade, Click/Esc/Enter überspringt, Dev-Edit-Modus + Dev-Pause + `useDevStep` analog eingehängt (Konsistenz mit Wiedergabe-Panel der letzten Iterationen).
   - `finish()` setzt Flags `sectorThresholdSeen` und (für bestehende Logik) `feetWontMove`, ruft `endCutscene()` und `api.goTo("passage")`.
   - **Musik:** bei `active === true` einmalig `useMusic().setOverride("sectorThreshold")`; bei `finish()` `setOverride(null)`. Override wird in `MusicPlayer` registriert (siehe 4).

4. **Music-Override** (`src/audio/MusicPlayer.tsx`)
   - Import `trackCityForgets from "@/assets/music/The_City_Forgets.mp3"`.
   - In `MUSIC_OVERRIDES` Eintrag `sectorThreshold: { title: "The City Forgets", src: trackCityForgets }` ergänzen — kein Playlist-Eintrag, ausschließlich Override für die Cutscene.

5. **Hotspot in `src/game/scenes/sectorAct1.ts`**
   - `toPassage.onUse` ersetzen durch:
     ```ts
     if (!api.hasFlag("sectorThresholdSeen")) api.startCutscene("sectorThreshold");
     else api.goTo("passage");
     ```
   - Das alte `feetWontMove`-Inline-Text-Branch entfällt; `feetWontMove` wird durch die Cutscene gesetzt, damit abhängige Logik unverändert weiterläuft.

6. **Mount** in `src/components/game/GameShell.tsx` neben `Act2BridgeCutscene` (`<SectorThresholdCutscene />`).

7. **Dev-RoomSwitcher** (`src/dev/RoomSwitcher.tsx`)
   - In der `cutscenes`-Liste ergänzen: `{ id: "sectorThreshold", title: "Cutscene · Schleuse E67 → Passage" }`.

## Was bleibt unverändert

- `passage`-Szene, alle übrigen Hotspots in `sectorDoor`, Insa-Anruf-Logik, Akt-II-Bridge.
- Keine neuen Bild-Assets — Optik kommt aus dem schon etablierten schwarzen Tafel-Stil mit Amber/Phosphor-Header, derselbe Codepfad den `passage`/`sectorDoor` ästhetisch flankiert.
