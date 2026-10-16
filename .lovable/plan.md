# Akt II in E67: subtile Änderungen nach einer Nacht

## Grundsätze
- Zwischen Akt I und II liegt nur eine normale Nacht. Akt II ist der nächste Vormittag.
- Neu ist allein Layards Rolle: Er hat die Dienstmail 28/1194 und (nach 3603) das Legitimationsschreiben. Niemand in E67 weiß Genaueres. Höchstens fällt jemandem die Aktenmappe auf.
- Es gibt keinen neuen Sanitätereinsatz und kein Großereignis. Die Verwaltung bleibt gleichgültig. Mira bleibt in 4601 und hört 104,6 nicht. Der Kellerstrang ist kein Auslöser.
- Nur E67 ist betroffen. E71 kennt Layard erst ab Akt II (Ralf, Herbert, Setsuko, Walter, Hanne, Okwu, Mikael bleiben unverändert).
- Ein Szenenbild bekommt nur dann eine Akt-II-Variante, wenn sie exakt denselben Raum zeigt: gleiche Perspektive, gleiche Möbel, gleiche Klickflächen. Nur Licht oder kleine Gegenstände ändern sich.
- Jede Änderung ist optional. Kein Rätsel und kein Pflichtweg hängt davon ab.

## Figuren (nur Dialoge)
- **Philippe (2613 / Etagen 3–5):** Eine neue Einstiegszeile am Morgen, zum Beispiel ein beiläufiger Blick auf die Mappe: „Dienstlich heute?“ Seine üblichen Themen bleiben.
- **Bodo (2612):** Er bleibt in seiner Wohnung bzw. auf seinen Hausmeister-Wegen. Dazu kommt eine Morgenzeile zu seiner Routine (Kontrollgang, Tee). Wenn die Thermoskanne zurückgegeben wurde, kann er sie erwähnen.
- **Helka (Tür 2610):** Das Türgespräch bekommt einen Morgen-Satz. Ihr Grundton bleibt.
- **Ennis:** Eine Morgenvariante der Begrüßung, mehr nicht.
- **Mira (4601):** Bereits über ihren Zustand aus Akt I geregelt (Zettel, Riegel oder Schritte). Bei Bedarf gibt es nur eine passende Türzeile je Zustand, kein neuer Inhalt.
- **Tjark und die Jugendlichen (Gemeinschaftsraum):** Am Vormittag sind sie wohl in der Schule, siehe die Bildvariante unten. Dazu kommt ein Layard-Kommentar zum leeren Tisch.
- **Kowalk und Brust (Kantine 3602):** Frühstücksausgabe statt Abendbetrieb, eine neue Begrüßungszeile.
- **Kroll (Konbini):** Am Tag ist Regelverkauf. Er erwähnt das in einer Zeile, ein Einkauf bleibt aber weiterhin ausgeblendet.
- **Insa und Vossbeck:** Schon für Akt II geschrieben, keine Änderung.

## Räume (Beschreibungen und Look-Texte)
- **2611 Layard:** Schon umgesetzt, keine Änderung.
- **Korridor 26 / 2615:** Die Versiegelung von 2615 bleibt so, wie sie seit Akt I ist. Nur der Look-Text wird nüchterner („Das Siegel hängt noch.“).
- **Korridor 36 (Versorgungsachse):** Ein Morgen-Text mit mehr Durchgangsverkehr.
- **Korridor 46 / 56, Aufzug, Lobby:** Je eine Morgenzeile zum Licht, zu Geräuschen und zum Aufzug.
- **Lobby-Fernseher:** Ein Morgenprogramm statt Nachtmodus, falls das mit dem vorhandenen Senderplan geht.
- **Konbini-Laufband:** Bleibt unverändert, es läuft schon ohne Wiederholung.
- **Kantine, Gemeinschaftsraum, Serverraum, Keller:** Höchstens ein angepasster Einstiegssatz.

## Szenenbilder (nur Varianten desselben Raums)
1. **Gemeinschaftsraum:** Dieselbe Szene ohne die drei Jugendlichen. Würfel und Regelwerk liegen weggeräumt bzw. zugeklappt auf dem Tisch. Die Klickflächen der Jugendlichen werden in Akt II ausgeblendet.
2. **Wohnung 2611 (optional):** Dieselbe Ansicht in Morgenlicht. Nach der Abholung liegt das Schreiben auf dem Tisch, dazu ein Becher.
3. **Kantine 3602 (optional):** Dasselbe Bild mit Frühstücksausgabe, zum Beispiel einem Brotkorb und einer Kanne. Kowalk und Brust stehen an derselben Stelle.

Alle anderen Bilder bleiben, wie sie sind.

## Vor der Umsetzung zu klären
- Ist Akt I tatsächlich nachts? Davon hängen der Morgen-Kontrast und die fehlenden Jugendlichen ab.
- Sollen die Bildvarianten 2 und 3 überhaupt kommen?

## Technische Details
- Bedingung überall `api.hasFlag("act2Started")`. Bilder über das vorhandene `background: (api) => ...`, Texte über `intro: (api) => ...`.
- Dialoge: Akt-II-Einstiegsknoten in `philippe.ts`, `bodo.ts`, `helka.ts`, `ennis.ts`, `cafeteria.ts`, `kroll.ts` und `misc.ts` (Tjark) ergänzen. Die bestehenden Bäume bleiben, die `endsDialog`-Regel gilt weiter.
- Szenen: `apartmentAct1.ts`, `corridorsE67.ts`, `elevatorE67.ts`, `communalE67.ts`, `konbiniE67.ts`.
- Bildvarianten entstehen als Bearbeitung des vorhandenen Bildes (gleiche Komposition). Danach werden die Klickflächen per Screenshot geprüft.
- Story- und Lore-Checks sowie der Build laufen danach.
- In `docs/STORY_PROGRESSION.md` wird ein Eintrag „Akt II in E67: subtile Morgenänderungen“ ergänzt. Dabei wird dort auch Layards Wohnung (2611, nicht 4601) korrigiert.
