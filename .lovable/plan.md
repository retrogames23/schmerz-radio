# Pflicht-Item-Rätsel für Akt I: „Der Code muss aufgeschrieben werden“

## Ausgangslage (geprüft)

- Es gibt bislang **eine** echte Item-Kombination im Spiel: Bleistiftstummel + Vollmacht 4317 (+ Quittungsblock) → Trockensiegel-Abdruck (`src/game/combine.ts`). Sie liegt im **optionalen** Fälschungspfad bei Kowalk.
- Der Pflichtpfad läuft laut `src/game/questGraph.ts` zwingend über: Tagescode an Miras Terminal lesen (`readTagescodeViaMira`) → Sektor-Schleuse E67 → E71 mit dem Tagescode öffnen (`sectorDoorOpen`) → Akt II.
- Heute genügt dort ein Blick auf den Bildschirm: Der Code steht im Verteiler, das Keypad akzeptiert ihn danach. Kein Gegenstand, kein Handgriff.

Genau hier setzt das neue Rätsel an — auf dem Pflichtweg, an dem **jeder** Spieler vorbeimuss.

## Das Rätsel

An Miras Maschine zeigt der Verteiler der Leitstelle den Tagescode nur als **flüchtige Zeile**: Der Verteiler blendet sie nach wenigen Sekunden aus und schreibt sie protokollpflichtig nicht erneut aus („AUSGABE EINMALIG — VERMERK DURCH EMPFÄNGER“). Layard ist Verwaltungsangestellter: Er merkt sich nichts, er **vermerkt**.

Damit braucht er zwei Dinge in der Hand, bevor er den Befehl absetzt:

1. **Bleistiftstummel** (`pencilStub`, liegt wie gehabt in 2612).
2. **Etwas Beschreibbares**: Blanko-Quittungsbogen Schicht B, Bodos Wartungsnotiz 5610, ein Aushang-Beleg — oder, als immer verfügbarer Notnagel, die leere Vorsatzseite des **Handbuchs E67** (hat Layard von Beginn an).

**Kombination:** Bleistift auf Papier ziehen → neues Item **„Notizzettel mit Tagescode“** — aber nur, wenn Layard den Code gerade vor Augen hatte. Reihenfolge und Rückmeldungen:

- Terminal ohne Schreibzeug → „Die Zeile steht drei Sekunden. Layard hat nichts, um sie festzuhalten.“ (setzt `sawTagescodeUnnoted`, damit die Hinweise greifen)
- Bleistift + Papier ohne vorherigen Blick auf den Verteiler → „Ein Zettel mit nichts drauf ist ein Zettel.“
- Bleistift + Papier nach dem Blick → Layard schreibt mit, Item entsteht, Flag `notedTagescode`.
- Am Keypad der Sektor-Schleuse ist ab jetzt der **Notizzettel** die Voraussetzung (statt nur des Flags `readTagescodeViaMira`). Ohne ihn: „Vier Ziffern. Layard hat sie gesehen. Gestern. Ungefähr.“

## Warum das funktioniert

- **Zwingend:** beide Zugangswege zu Miras Maschine (Vertrauenspfad und Heizungspfad) münden in dieselbe Terminal-Szene; die Schleuse ist der einzige Ausgang aus Akt I.
- **Logisch lösbar:** Bleistift und Handbuch sind beide unabhängig vom Rätsel erreichbar, das Handbuch besitzt Layard ohnehin. Es gibt also nie eine Sackgasse — auch nicht, wenn der Quittungsbogen längst bei Kowalk gelandet ist.
- **Lore-konform:** „Ausgabe einmalig, Vermerk durch Empfänger“ ist genau die Verwaltungslogik des Mandatsbunds; Layards Rolle als Aktenmensch wird zum Werkzeug statt zum Hindernis.
- **Charakter:** kein Aufbrechen, kein Hacken — er schreibt mit. Das ist die Figur.

## Hinweiskette (kein Ratespiel)

- Miras Terminal-Text nennt die Einmal-Ausgabe schon beim ersten Zugriff.
- Mira sagt trocken: „Mitschreiben. Die Leitstelle wiederholt sich nicht.“
- `src/game/hints.ts` bekommt zwei Stufen: „Layard braucht Schreibzeug“ → „Der Bleistift liegt in 2612; beschreibbar ist auch die Vorsatzseite des Handbuchs.“

## Umfang (technisch)

- `src/game/types.ts`: neues Item `tagescodeNotiz`, neue Flags `sawTagescodeUnnoted`, `notedTagescode`; Icon in `ItemIcon.tsx`.
- `src/components/game/Terminal.tsx`: Verteiler-Ausgabe zeigt die Einmal-Zeile, setzt `readTagescodeViaMira` weiterhin, zusätzlich `sawTagescodeUnnoted`, wenn nichts zum Mitschreiben da ist.
- `src/game/combine.ts`: neue Item-Paar-Regel Bleistift × (Quittungsbogen | Wartungsnotiz | Aushang-Beleg | Handbuch) mit den drei oben beschriebenen Zuständen.
- `src/components/game/Keypad.tsx`: Sektor-Schleuse verlangt den Notizzettel.
- `src/game/hints.ts`: zwei neue Hint-Stufen.
- `src/game/questGraph.ts`: Pflichtschritt `act1.notiereTagescode` zwischen `act1.tagescode` und `act1.sectorDoor` eintragen, damit `bun run quest:solve` die Lösbarkeit weiter beweist.
