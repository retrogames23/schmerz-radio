# Item-Kombinations-Rätsel für Akt I: „Regler vier klemmt“

## Ausgangslage (geprüft)

- Es gibt bereits genau **eine** echte Item-Kombination: Bleistiftstummel + Vollmacht 4317 (+ Quittungsblock) → Trockensiegel-Abdruck (`src/game/combine.ts`). Alles andere sind Reaktionstexte, wenn man ein Item auf eine Person zieht.
- Mehrere Items werden praktisch nie gebraucht: **Ölkännchen** (nur MARV), **Vierkantschlüssel** (nur die Kellertür), Kaugummi, Maske.
- Der Heizungspfad im Keller E67 (`src/game/scenes/kellerE67.ts`) ist heute ein einziger Klick: Wartungsbuch lesen → Regler drehen → Mira verlässt die Wohnung. Der Vertrauenspfad (drei Aushänge für Mira) bleibt die gleichwertige Alternative — deshalb darf der Heizungspfad ruhig ein echtes Rätsel sein.

## Das Rätsel

Im Keller ist bei Regler vier (Steigstrang 46) der Alu-Drehknopf abgebrochen. Übrig ist ein **Vierkantstummel** an der Spindel: verharzt/festgerostet — und die Spindel sitzt direkt am Vorlauf, also heiß.

Layard braucht drei Dinge, in dieser Reihenfolge:

1. **Ölkännchen auf den Regler** → das Öl kriecht in das Gewinde. („Jetzt ginge er. Wenn man ihn anfassen könnte.“)
2. **Lappen von der Wäscheleine** (neues, im Keller aufnehmbares Item am bestehenden Hotspot „Wäscheleinen“).
3. **Lappen + Vierkantschlüssel kombinieren** → „umwickelter Vierkantschlüssel“. Damit den Regler bedienen → Strang 46 auf Maximum, wie bisher.

Alle drei Schritte geben bei falscher Reihenfolge einen Text, der den nächsten Schritt benennt (trocken, in Layards Ton) — kein Raten.

## Warum das logisch und lore-konform ist

- Betriebstechnik, die seit 1994 niemand mehr wartet: abgebrochener Knopf, festes Gewinde, heiße Steigleitung. Kein Sci-Fi, kein Resonanz-Zauber.
- Der Vierkantschlüssel kommt von Bodo, gehört also ohnehin ins Wartungsmilieu; der Lappen hängt seit Jahren im selben Raum.
- Layard bleibt Verwaltungsangestellter: er improvisiert vorsichtig, er bricht nichts auf.

## Keine Sackgassen

- **Ölkännchen wird nicht mehr verbraucht.** Heute verschwindet es beim Ölen von MARV; künftig bleibt es im Inventar (nur das Flag `marvOiled` wird gesetzt). Damit kann die Reihenfolge Kneipe/Keller nie zum Dead End führen.
- Wer das Kännchen nie holt: Der Vertrauenspfad über die drei Aushänge bleibt unverändert offen — Miras Terminal ist also weiterhin garantiert erreichbar.
- Zwei Hinweisgeber: das Wartungsbuch im Keller („Regler vier, Knopf fehlt seit 94, Spindel ölen“) und Bodo, der beim Übergeben des Vierkantschlüssels beiläufig „nichts mit bloßer Hand anfassen“ sagt.
- Das Rätsel wird in `src/game/hints.ts` als eigene Hint-Stufe geführt, damit das Hinweissystem den Spieler nicht hängen lässt.

## Umfang (technisch)

- `src/game/types.ts`: zwei neue Item-IDs (`lappen`, `vierkantschluesselUmwickelt`), Icons in `ItemIcon.tsx`.
- `src/game/scenes/kellerE67.ts`: Wäscheleinen-Hotspot wird aufnehmbar; `heatingControl` bekommt die Zustandslogik (verharzt → geölt → bedienbar) mit den Flags `reglerVierGeoelt`, `reglerVierGaengig`.
- `src/game/combine.ts`: Regel „Ölkännchen → heatingControl“ (Hotspot) und „Lappen + Vierkantschlüssel“ (Item-Paar); Ölkännchen bei MARV nicht mehr entfernen.
- `src/game/hints.ts`: neue Hint-Einträge.
- `src/game/questGraph.ts`: Heizungspfad-Schritt um die neuen Vorbedingungen ergänzen, damit `bun run quest:solve` die Kette weiter als lösbar prüft.
