# Hanne: Das Plattenhüllen-Rätsel (Erfinder-Telefonnummer)

## Ziel
Bevor Hanne den Erfinder des Schmerz-Radios (Konrad Elsner, Sektor 14, 014 / 30 72 19) nennt, löst Layard ein kleines Rätsel: Elsner hat ihr die Nummer 1975 hastig auf die Innenhülle einer Schallplatte gekritzelt — bei dem Stück, über das die beiden damals eine ganze Nacht diskutiert haben. Layard muss die richtige Platte im Plattenregal finden und die Innenhülle herausziehen.

## Ablauf

```text
Vertrauen erreicht (alle 3 Gerüchte erzählt)
        |
Hanne: „Konrad hat mir die Nummer damals auf eine Plattenhülle gekritzelt.
        Das Stück, über das wir die ganze Nacht geredet haben."
        |
Hub-Option: „Welche Platte habt ihr damals noch gleich gehört?"
        |   (jederzeit wiederholbar — auch nach Wiederbesuch)
        v
Hanne gibt Hinweis: Dylan, das Ausgeliefertsein — „It's Alright, Ma"
        |
Layard untersucht Plattenregal (Hotspot records1104)
        |
   ├─ ohne Hinweis gehört: allgemeiner Betrachten-Text (wie bisher)
   ├─ mit Hinweis, falsche Wahl/unsicher: Hinweis erneut erfragbar
   └─ mit Hinweis: neue Option „Die Dylan-Platten durchsehen"
        v
Auswahl unter 3 Dylan-Alben (nur eines korrekt)
   ├─ falsch: kurze, warme Korrektur von Hanne, erneut wählbar
   └─ richtig: Innenhülle herausziehen
        v
Fund: verblasste Bleistiftnotiz „K.E. — Sektor 14 — 014 / 30 72 19"
        |
Hanne bestätigt: Konrad Elsner, Amateurfunktreffen 1975,
Firma pleite, kein Patent. Flag hanneInventor gesetzt.
```

## Lösbarkeit ohne genaues Lesen
- Die Frage **„Welche Platte habt ihr damals noch gleich gehört?"** steht im Hub dauerhaft zur Verfügung, sobald Hanne die Hüllen-Geschichte einmal erwähnt hat (Flag `hanneSleeveHint`). Sie kann beliebig oft gestellt werden — auch bei späteren Besuchen.
- Wer den Hinweis vergessen hat, fragt einfach erneut nach; Hanne wiederholt ihn gern („Ich sagte doch: Dylan. Das Ausgeliefertsein.").
- Falsche Alben-Wahl ist kein Dead End: Hanne korrigiert freundlich, die Auswahl bleibt offen.

## Umsetzung

### Dialoge (`src/game/dialogs/hanne.ts`)
- Die bisherige Erfinder-Übergabe (Ende der `rumors`-Kette, `inv_8`/`inv_9`) wird umgebaut: Statt die Nummer direkt zu diktieren, erzählt Hanne nur die Hüllen-Geschichte und setzt Flag `hanneSleeveHint`. Name und Nummer nennt sie erst **nach** dem Fund.
- Neue Hub-Option „Welche Platte habt ihr damals noch gleich gehört?" — sichtbar ab `hanneSleeveHint`, ohne `hiddenWhen` (bleibt dauerhaft wiederholbar), führt zu `hanneSleeveHintLine`.
- Neuer Mini-Dialog `hanneSleeve` (gestartet vom Plattenregal-Hotspot, wenn `hanneSleeveHint` gesetzt und `hanneInventor` noch nicht): Auswahl aus drei Dylan-Alben. Falsche Wahl → kurze Korrektur-Zeile, zurück zur Auswahl. Richtige Wahl → Fund-Text, Hanne nennt Konrad Elsner / Sektor 14 / 014 / 30 72 19, setzt `hanneInventor`.
- Nach `hanneInventor`: Plattenregal zeigt wieder den normalen Betrachten-Text; die Hub-Hinweis-Frage verschwindet (nicht mehr nötig).

### Szene (`src/game/scenes/apt1104.ts`)
- Hotspot `records1104` bekommt Logik: `hanneSleeveHint && !hanneInventor` → `api.startDialog("hanneSleeve")`, sonst bisheriger Betrachten-Text.

### Typen & Flags (`src/game/types.ts`)
- Neue Story-Flags: `hanneSleeveHint` (Hüllen-Geschichte gehört), `hanneInventor` existiert bereits.

### Quest-Graph (`src/game/questGraph.ts`)
- `hanneSleeveHint` als Zwischenschritt vor `hanneInventor` eintragen, damit solve-check die Kette prüft.

## Texte (Ton)
- Hanne bleibt warm und spöttisch: „Siebenundzwanzig Jahre, und ich finde meine eigene Plattensammlung nicht mehr ohne fremde Hilfe."
- Falsche Wahl: „Nein, nicht die. Hören Sie genauer hin — das Ausgeliefertsein."
- Fund-Moment bleibt leise: keine Fanfare, nur Hannes kurzes Nicken und die Diktatur der Zahlen.

## Technische Details
- Dateien: `src/game/dialogs/hanne.ts`, `src/game/scenes/apt1104.ts`, `src/game/types.ts`, `src/game/questGraph.ts`.
- Kein neues Inventar-Item, kein neuer Ort, keine Quest — nur Dialog + Hotspot-Logik (wie besprochen).
- Danach: `bunx tsgo --noEmit`, `bun run scripts/solve-check.mjs`, `bun run scripts/lore-check.mjs`, Build prüfen.
