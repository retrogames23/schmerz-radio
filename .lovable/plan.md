# Kowalk-Dialog: Recap-Option korrekt gaten

## Ursache

`knowsVossbeckPath` wird schon in `src/game/dialogs/insa.ts` (Zeilen 217 und 226) gesetzt, sobald Insa Layard zu Kowalk schickt. Zu diesem Zeitpunkt kennt Layard aber nur den Hinweis "geh zu Kowalk" — nicht den eigentlichen Weg (Brust → Formblatt 17/V → Vossbeck). Deshalb erscheint im Kowalk-Dialog sofort:

- "Was war nochmal der Weg?" (recap, ergibt noch keinen Sinn)
- "[ Frau Kowalk … Brust gibt mir kein Formblatt. Gibt es einen anderen Weg? ]" (Fälschungs-Notausgang, obwohl Brust noch nie erwähnt wurde)

Kowalk selbst setzt `knowsVossbeckPath` bereits an drei richtigen Stellen (`cafeteria.ts` Z. 141, 149, 298) — erst nach ihrer Briefing-Sequenz zu Brust/Formblatt/Endduell.

## Fix

1. In `src/game/dialogs/insa.ts` in beiden `idCode3`-Choice-Actions nur noch `insaSentToKowalkForCode` und `skippedExitReport` setzen. Das `api.setFlag("knowsVossbeckPath")` in beiden Zweigen entfernen.

2. Verhalten danach:
   - Nach Insa: nur der Einstiegs-Choice "Frau Kowalk — Insa sagt, Sie wissen …" ist sichtbar (gated by `insaSentToKowalkForCode`, hiddenWhen `knowsVossbeckPath`).
   - Erst wenn Kowalk das Briefing zu Brust/Formblatt/Endduell abgeschlossen hat, kippt `knowsVossbeckPath` auf true. Dann tauchen "Was war nochmal der Weg?" (Recap) und der Fälschungs-Notausgang auf.
   - `triedVossbeckEarly`-Zweig (`kantinenverwaltung3603.ts` Z. 38) und die Hints in `src/game/hints.ts` (Z. 235/236/249/393) bleiben unverändert, weil sie ohnehin auf denselben, jetzt sauber gesetzten Zustand hören.

## Nicht Teil dieses Plans

Keine Änderungen an Kowalks Dialogtexten, Brust, Vossbeck oder Hint-Logik.
