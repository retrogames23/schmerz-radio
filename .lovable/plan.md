# Hanne: die drei Gerüchte und der Erfinder des Schmerz-Radios

## Ziel
Hanne kennt alle drei Gerüchte über 104,6 und den Erfinder des Schmerz-Radios. Sie erzählt davon nicht sofort. Erst muss Layard ihr in mehreren Gesprächen gezeigt haben, dass er zuhört, nachfragt und widerspricht.

## Lore bleibt unverändert
- Öffentlich bleibt der Erfinder unbekannt. Almanach, LORE.md und die gestrichene Marteau-Spur bleiben, wie sie sind.
- Hanne kennt ihn privat aus der Bastlerszene der 70er. Es gibt keine Firma mehr.
- Die Gerüchte sind für Hanne Hörensagen. Sie wertet sie auf ihre Weise und kennt weder ZERO IS INFINITY noch den Verstärker.
- Den Begriff „Engel-Trauer“ benutzt nur Layard. Hanne sagt „die Hundertvierkommasechs“.

## a) Vertrauen statt Schalter
Hanne sammelt im Hintergrund Punkte, die zeigen, wie ernst sie Layard nimmt. Er bekommt einen Punkt, wenn er:
- einen Themenstrang zu Ende verfolgt (USA, Fuller, Mumford, Whole Earth, Beats, Mac, Psychologie);
- an markierten Stellen widerspricht, eine eigene Deutung anbietet oder etwas Persönliches sagt (Autor früher, Verwaltung heute);
- Für schnelles Weggehen gibt es keinen Abzug.

Stufen:
```text
Stufe 1  ab 3 Punkten  Gerücht 1 — Schmerz-Radio hat neue Hörer gefunden
Stufe 2  ab 5 Punkten  Gerücht 2 — Menschen werden süchtig nach 104,6
Stufe 3  ab 7 Punkten  Gerücht 3 — die Verschwörungstheorie, die sie zerlegt
Stufe 4  alle 3 Gerüchte besprochen + 2 weitere Punkte  der Erfinder
```

## Organischer Einbau
Die Gerüchte bekommen keinen eigenen Menüpunkt. Hanne bringt sie an Stellen ein, an denen sie gedanklich passen, und nur einmal:
- **Gerücht 1** im Psychologie-Strang (Gemütlichkeit als Betäubung) oder am Ende des Strangs USA/Rückkehr: Einsame Nachbarn hören auf einmal ein altes Bastlergerät, „weil es das Einzige ist, das noch weh tut“. Danach folgt Layards Reaktion. Er kann zugeben, dass er selbst zuhört, oder schweigen.
- **Gerücht 2** im Mumford- oder Mac-Strang (Abhängigkeit von Technik): Leute, die ihre Wohnung nicht mehr verlassen, ohne vorher eingeschaltet zu haben. Hanne vergleicht das mit Fernsehen und Valium und lässt den Vergleich dann selbst nicht gelten.
- **Gerücht 3** im Beats-Strang (Burroughs’ Kontrollbegriff) oder bei Fuller: Die Verwaltung, das Ausland oder Außerirdische sollen den Sektor lahmlegen. Hanne nimmt die Theorie ernst genug, um sie zu widerlegen: „Diese Verwaltung kann keinen Heizplan senden. Wie soll sie eine Stimmung senden?“ Dabei bleibt ein Rest Unbehagen.
- Ist ein passender Strang schon durch, bietet der kurze Wiedereinstieg im Hub einmalig an: „Sie wollten mir neulich noch etwas erzählen.“ So geht kein Gerücht verloren.
- Jede Stelle bietet die Wahl: nachfragen, zweifeln, nicht weiter darüber sprechen oder gehen.

## b) Der Erfinder
- Das Gespräch kommt erst ab Stufe 4 und wieder nur, wenn es passt: Layard fragt, woher so ein Gerät überhaupt kommt. Diese Frage erscheint erst, nachdem alle drei Gerüchte gefallen sind.
- Hanne zögert und erzählt von einem Funkbastler, den sie Mitte der 70er bei einem Amateurfunktreffen kennengelernt hat. Er hat nie ein Patent angemeldet, die Vertriebsfirma der 80er ist längst pleite, und er will nicht gefunden werden.
- Sie nennt seinen Namen und seine Telefonnummer und warnt: „Rufen Sie ihn nicht als Beamter an.“
- Layard notiert beides. Das wird als Wissen gespeichert, also im Wissensregister und in Layards Notizen. Ein neuer Ort, ein Anruf oder eine Quest entstehen dadurch noch nicht.
- Name und Nummer sind meine Vorschläge, zum Beispiel „Konrad Elsner“ mit einer sechsstelligen Nummer im Sektor-28-Format. Bitte gib mir den echten Namen und die echte Nummer, falls du sie schon festgelegt hast.

## Was gleich bleibt
- Bestehende Dialogpfade, Wohnung, Bild und Hotspots.
- Hannes Ton: Sie bleibt gesprächig und warm und erzählt Gerüchte nicht esoterisch, sondern analytisch.
- Für Sasse in 5011 wird nichts neu gebaut. Die neuen Wissenseinträge sind vorbereitet, aber noch nicht abfragbar.

## Technische Details
- `types.ts`: Flags `hanneRumor1`, `hanneRumor2`, `hanneRumor3`, `hanneInventor`, außerdem Zähler-Flags für Vertrauenspunkte (bzw. `hanneTrust1..N` im bestehenden Flag-System, falls es keine Zähler gibt). Das prüfe ich vor dem Bau.
- `dialogs/hanne.ts`: Ein Helfer `trust(api)` liest die Punkte. An Strangenden und an markierten Einwand-Optionen kommt `addTrust` dazu. In die genannten Knoten kommen bedingte Choices oder `next`-Weichen, dazu der einmalige Hub-Wiedereinstieg und der Erfinder-Knoten.
- `knowledge.ts`: Einträge `rumorRadioRevival`, `rumor1046Addiction`, `rumorConspiracy`, `radioInventorContact` mit `askedAt5011: false`.
- Name und Nummer des Erfinders kommen als Projektwissen in die Memory, nicht in die öffentliche Lore. Danach wird LORE.md um einen kurzen Hinweis ergänzt: Hanne kennt ihn privat, öffentlich bleibt er unbekannt.
- Prüfungen: Erreichbarkeit aller Dialogziele, `solve-check`, `lore-check`, Typecheck.
