# Akt II: Morgenänderungen auch für den Teil von E71, den man aus Akt I kennt

## Festlegungen
- Akt I spielt **abends**, Akt II am nächsten Vormittag.
- In E71 kennt Layard nur die Bewohner-Etage (Korridor 11 mit Setsuko, Walter, Hanne) erst ab Akt II. Diese Figuren bleiben unverändert.
- Alles andere in E71 und auf dem Weg dorthin kann Layard schon aus Akt I kennen. Dort gelten dieselben Regeln wie in E67: je eine einmalige, beiläufige Morgenzeile, nichts über den Auftrag, höchstens fällt die Mappe auf.

## Ralf (bereits neu gebaut, nur nachschärfen)
- Die Gefallen (Tee aus 3602, Laufband vorlesen), die drei Vertrauensstufen, die Akt-II-Begrüßung und die vorbereitete Warnbrief-Beobachtung bleiben, wie sie sind.
- Seine Zeitangaben werden an „abends“ angepasst: „Gestern Abend ohne Ziel, heute früh mit Ziel.“
- Wer Ralf in Akt I nicht getroffen hat, lernt ihn in Akt II neu kennen. Sein erstes Gespräch passt dann zum Vormittag (statt „um diese Zeit“ und „Ich konnte nicht schlafen“ eine Variante wie „Ich habe einen Termin drüben.“).

## E71-Figuren mit Morgenzeile
- **Herbert (Bibliothek):** Morgenzeile, dazu bleibt sein zufälliger Fakt.
- **Dr. Okwu (1532) und Mikael Stegmann (1534):** Am Vormittag ist Sprechzeit bzw. Dienst. Die Zeile ist sachlich, keine Questverknüpfung.
- **Die Nerds (Gemeinschaftsraum E71):** Morgenzeile bzw. Kommentar.
- **Rosa Minden (Konbini E71):** Regelverkauf läuft. Wie in E67 gibt es keinen Einkauf, nur angepasste Look-Texte zu Kühlfach, Regal und Kasse.
- **Kneipe „Zum stillen Funk“:** Am Vormittag geschlossen. Beim Klick auf die Tür sagt Layard das beiläufig. Hier brauche ich eine Entscheidung, siehe unten.

## Räume mit Morgen-Beschreibung
- E71-Empfang, Korridor 15, Bibliothek, Kino, Gemeinschaftsraum E71, Verbindungsgang (Licht, Leute auf dem Weg zur Arbeit), Fensternische.
- Bereits umgesetzte E67-Texte mit „Nacht“ werden auf „Abend“ korrigiert, zum Beispiel Korridor 56 „heller als gestern Abend“.

## Szenenbilder
- Keine Änderung.

## Offene Entscheidung
- Kneipe am Vormittag: geschlossen (Tür zu, kurzer Kommentar) oder normal geöffnet wie in Akt I?

## Technische Details
- Die neuen Morgenzeilen kommen in die gemeinsame Begrüßungsliste in `dialogs/act2Greetings.ts`. Die Bäume dafür werden aus `herbert.ts`, `okwu.ts`, `mikael.ts`, `e71Nerds.ts` und `minden.ts` ermittelt. Dazu kommen neue Flags `<npc>Act2Greeted` in `types.ts`.
- Ralf: In `ralf.ts` werden Zeitangaben angepasst, und `ralfIntro` bekommt Zeilen für Akt II (über `requires`/`hiddenWhen` mit `act2Started`).
- Szenen-`intro` und Look-Texte bekommen `act2Started`-Varianten in `sectorAct1.ts`, `corridor11.ts` (nur Flur 15, falls dort), `libraryE71.ts`, `cinemaE71.ts`, `commonRoomE71.ts`, `elevatorE67.ts` (Verbindungsgang), `windowNiche.ts`, `konbiniE71.ts` und `pub.ts`.
- In `mem/features/konbini.md` wird „Spielzeit nachts“ zu „Akt I abends, Akt II vormittags“ korrigiert.
- Danach laufen Typecheck sowie Quest-, Solve-, Lore- und Hinweis-Checks.
