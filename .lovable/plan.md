# Drei leise Hinweise auf die verschenkten Schmerz-Radios

Ziel: Der Spieler stolpert in Akt II beiläufig über die Verteilung der Geräte, ohne dass schon jemand eine Erklärung hat. Erst Elsners Anruf (Großbestellung) und Hanne (Geld) setzen die Teile später zusammen. Alle Hinweise erscheinen nur in Akt II, nichts davon ist Pflicht.

## Hinweis 1: „Zu verschenken“-Box im Gemeinschaftsraum E71
- Ort: Gemeinschaftsraum 1530 in E71, weil dort die Nerds sitzen (im Gemeinschaftsraum E67 gibt es keine Nerds).
- Neue Klickfläche: eine fest angeschraubte Holzbox „ZU VERSCHENKEN“ an der Wand. In Akt II liegt darin ein kleines Gerät ohne Typenschild mit einem handgeschriebenen Zettel: „Für schlaflose Nächte. Einfach einschalten.“
- Layard nimmt es nicht mit (er hat schon ein eigenes Schmerz-Radio). Kommentar: Er erkennt die Bauart wieder.
- Neue Dialogoption bei Detlef, Sigi oder Ruven, sobald Layard die Box angesehen hat: „Was ist das für ein Gerät in der Box?“
  - Sigi: „Ach ja, dieses komische Gerät ist seit gestern da drin. In der Box liegt sonst höchstens mal eine abgelaufene Dose Fisch oder, wenn man Glück hat, ein paar Comichefte.“
  - Ruven: „Hat keiner reingelegt. Also, keiner, den wir kennen.“
- Bildänderung: Die Box muss ins Szenenbild gemalt werden. Gleicher Raum, gleiche Perspektive, die Klickflächen der Nerds bleiben gleich. Falls das Bild nicht exakt passt, nehmen wir einen bereits sichtbaren Wandbereich und beschreiben die Box nur im Text.

## Hinweis 2: Fundsache im Konbini E67
- Ein neuer Laufband-Text (nur Akt II): „FUNDSACHE: kleines Funkgerät, braun, ohne Typenschild. Abzuholen bei der Kasse.“
- Neue Dialogoption bei Uwe Kroll: „Sie haben ein Funkgerät gefunden?“
  - Kroll: „Lag im Postfachraum, auf den Briefkästen. Mit Zettel, so ein Geschenk-Ding. Schon das zweite diesen Monat. Holt keiner ab.“
- So wird klar: Die Geräte tauchen auch in E67 auf und werden verschenkt, nicht verkauft.

## Hinweis 3: Ralfs Beobachtung am Fenster
- Ralf sieht von seiner Fensternische auf den Hof und die Laderampe. Neue Option, sobald Ralf Layard vertraut (nach einem der Gefallen):
  - „Komisch war das im Spätsommer. Ein Lieferwagen ohne Aufschrift, nachts an der Rampe. Kartons, alle gleich groß, Schuhkarton-Format. Zwei Leute haben ausgeladen, einer hat dabei geraucht, die andere hat gezählt.“
- Passt zu Elsners späterer Aussage „Lieferung an eine Laderampe in Sektor 28“ und vertieft Ralfs Rolle als Beobachter.
- Keine Namen, keine Gesichter: Ralf kann niemanden identifizieren.

## Was bewusst nicht passiert
- Niemand sagt „Zero is Infinity“ oder nennt Tür 1531.
- Keine behördliche Reaktion auf die Geräte (Verwaltung bleibt gleichgültig, keine Radio-Bürokratie).
- Kein neues Inventarobjekt, kein neues Rätsel.

## Technische Details
- Neue Flags: `sawGiveawayRadio`, `askedNerdsGiveaway`, `askedKrollFundsache`, `ralfToldDelivery`.
- `commonRoomE71.ts`: Hotspot `giveawayBox` (Text je nach `act2Started`); `e71Nerds.ts`: Option mit `requires: ["sawGiveawayRadio"]`.
- `konbiniTicker.ts`: E67-Eintrag nur für Akt II; Uniqueness-Test bleibt grün. Kroll-Dialog: Option mit `requires: ["act2Started"]`.
- `ralf.ts`: Thema `tDelivery`, sichtbar mit `act2Started` und einem Gefallen-Flag.
- `docs/STORY_PROGRESSION.md`: drei Hinweise als [UMGESETZT] unter „Verbreitung der Schmerz-Radios“ eintragen.
- Danach Story-, Lore- und Lösbarkeits-Checks laufen lassen.
