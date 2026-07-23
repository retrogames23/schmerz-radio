## Ziel

Zwei kleine, chirurgische Eingriffe am Bürokratie-Duell:

1. **Weniger Meta, mehr Welt.** Brust und Kowalk erklären das Duell aktuell wie eine Spielanleitung („Trainingsfall … drei in Folge … Phrasenbuch … zwei Treffer mehr als Fehler: bestanden"). Das fällt aus der Rolle. Beide sollen nur noch andeuten, dass Vossbeck einen „vorbereiteten" Bewohner erwartet, und Brust das prüft — ohne Regelvokabular.

2. **Runde 2 sichtbar machen.** Wenn Layard eine Phrase gegen Brust wirft, steht das Ergebnis („Brust stottert" vs. „Brust kontert souverän") derzeit nur im `subtext` — der wird ausschließlich mit aktivem Schmerz-Radio angezeigt. Trainingsduelle laufen aber in der Kantine, meist ohne Radio → der Spieler sieht nur Brusts Konter-Text und kann nicht einordnen, ob er getroffen hat.

## Änderungen

### A) Erklärungen kürzen & entmetaisieren

`src/game/dialogs/cafeteria.ts`:
- Kowalks lange „Trainingsfall/Phrasenbuch/drei in Folge"-Erklärungen (drei Stellen: `insaSentToKowalkForCode`-Zweig ab „Brust gibt das Formblatt nicht jedem…", der ausführliche 4317-Zweig, sowie der Wiederholungs-Zweig) auf 1–2 Sätze pro Zeile eindampfen. Kernaussage in Kowalks Ton: *„Herr Brust lässt Sie nicht unvorbereitet bei Vossbeck vorsprechen. Reden Sie mit ihm — er weiß, was gemeint ist."* Kein „Trainingsfall", kein „Phrasenbuch", keine Trefferzahl.
- Brusts Duell-Intro (`cafeteriaBrust`-Zweig „Ich würde mit Ihnen einen Trainingsfall durchgehen." + Folgezeilen mit „zwei Treffer mehr als Fehler: bestanden / drei Fehler: für heute schließen wir") auf trockene Amtssprache reduzieren: *„Setzen Sie sich. Wir gehen einen Fall durch. Ich eröffne, Sie antworten."* Der Button bleibt „[ Beginnen ]".
- Regel-Details (drei in Folge, Formblatt am Ende) NICHT wiederholen — Kowalk hat sie kurz angerissen, Brust bestätigt sie beiläufig nach dem ersten Sieg.

`src/game/dialogs/bureaucracyDuel.ts`:
- `r2Intro`-Text („Zweite Runde. Sie sind dran, Bewohner Worag. Schicken Sie eine Phrase.") ebenfalls entmetaisieren: *„Ihre Eröffnung, Bewohner Worag."*
- `duelTrainingResultBranching`: `checkWon2` / `checkWon1` von „Zwei Trainingssiege auf Ihrem Konto" auf trockenes Amtsdeutsch: *„Notiert. Weiter."* / *„Erste saubere Runde. Weiter."*

### B) Runde-2-Feedback sichtbar machen

Das Problem ist strukturell: `subtext` ist im `DialogOverlay` an `radioActive` gebunden und dient explizit dem Schmerz-Radio-Kanal. Dort etwas zu ändern wäre invasiv. Stattdessen im Duell-Modul selbst arbeiten:

`src/game/dialogs/bureaucracyDuel.ts`, Funktion `attackChoices`:
- Bei jeder Konter-Line einen sichtbaren, kurzen Ergebnis-Marker in den `text` selbst einbauen — als Amtston, nicht als „✓/✗":
  - Fehl-Konter (Brust/Vossbeck pariert souverän): Konter-Line beibehalten, aber zusätzlich eine knappe Nachbemerkung im selben Text-Feld, z. B. Brust: *„… — Punkt Brust."* / Vossbeck: *„… — Punkt Verwaltung."*
  - Treffer (Bodo-/Helka-Special): analog *„… — Punkt Worag."*
- Die `subtext`-Zeilen bleiben zusätzlich für Radio-Hörer erhalten (sie geben die stimmungsvolle Version), aber der Klartext-Marker steht garantiert im sichtbaren Haupttext.
- Analog für Runde 1/3 (`r1Miss` / `r3MissResolve` / `r1Hit` / `r3HitResolve`): die Kowalk-„Sitzt."-Line wird um ein Wort ergänzt („Sitzt. — Punkt Worag."), Brusts Miss-Line endet mit „— Punkt Brust." Das ist die einzige Ergänzung, keine Umformulierung.

## Nicht-Ziele

- Keine Änderung an Duell-Mechanik, Flags, Reihenfolge, Formblatt-Ausgabe, Vossbeck-Endduell-Struktur.
- Kein Umbau von `DialogOverlay` oder der Subtext/Radio-Kopplung.
- Keine neuen UI-Elemente (kein Tally-Widget, keine Trefferanzeige) — das Feedback bleibt rein textlich, im Amtston.
