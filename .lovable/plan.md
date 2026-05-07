## Ziel

Im Bürokratie-Duell soll der Spieler aus jeder Antwortoption schon erkennen können, ob der zitierte Paragraph zum Fall passt. Statt nackter §-Nummern enthält jede Antwort eine kurze Inhaltsangabe — Spaß durch Lesbarkeit, nicht durch Auswendiglernen.

## Was geändert wird

Nur Texte in `src/game/bureaucracyDuel.ts`. Keine Mechanik, keine UI-Änderung, keine neuen Komponenten.

### 1. Antwort-Counter (TRAINING_ROUNDS + ENDGAME_ROUNDS)

Jede `counters[].text` bekommt das Schema:

> **§-Bezeichnung — kurze Inhaltsbeschreibung, die zum Fall in Bezug gesetzt ist.**

Beispiele für die Umformulierung:

- vorher: `"Aushang sieben Punkt eins."`
- nachher: `"Aushang 7.1 (1991): Gegenzeichnungen aus Nachbarschichten gelten als gleichwertig — und nie widerrufen."`

- vorher: `"§3 Abs. 4 — nahtlose Übergabe."`
- nachher: `"Schichtordnung §3 Abs. 4: Übergabezeit, Vorgänge dürfen schichtübergreifend abgeschlossen werden."`

- vorher: `"Generalvorbehalt §99."`
- nachher: `"Generalvorbehalt §99: Verwaltung entscheidet in Zweifelsfällen — also auch hier."`

Alle 5 Trainingsrunden × 4 Counter und alle 3 Endgame-Runden × 4 Counter werden so überarbeitet (32 Strings).

### 2. Fiktive Kantinen-Paragraphen (FICTIONAL_PARAGRAPHS)

Diese kommen über `buildRoundCounters()` als Füll-Optionen in die Auswahl. Der bisherige Code strippt das Präfix per Regex (`text: f.fullText.replace(...)`), sodass nur der nackte Inhalt erscheint — z. B. „Brötchen sind vor der Suppe auszugeben."

Damit das Format mit den echten Optionen konsistent ist (jeweils „§-Label: Inhalt"), ändere ich den Bau in `buildRoundCounters` so, dass auch fiktive Optionen als `"<shortLabel>: <inhalt>"` formatiert werden. Dadurch sehen alle vier Optionen gleich aufgebaut aus, und der Spieler kann an Wortlaut und Plausibilität entscheiden — nicht am Stilbruch.

### 3. Ton

Antworten bleiben in Layards Stimme (er trägt sie schließlich vor): knapp, sachlich, pointiert. Kein Erklärbärton, keine Mehrzeiler. Ziel: ein Halbsatz, der den Inhalt verrät und zur Falllage Stellung nimmt.

### 4. Was nicht geändert wird

- `PARAGRAPHS` (Notizbuch-Volltexte) — bleiben.
- `opening`, `onHit`, `onMiss`, Kowalk-Asides — bleiben.
- Mechanik (`buildRoundCounters`, Trefferlogik, Lernsystem) — bleibt, abgesehen vom o. g. Format-Fix für fiktive Optionen.
- `BureaucracyDuelOverlay.tsx` — kein Edit nötig.

## Ergebnis

Der Spieler liest vier Sätze, von denen einer offensichtlich zum geschilderten Fall spricht und die anderen entweder unpassend oder absurd sind. Das Duell wird zu einem Lese- und Argumentationsspaß, nicht zu einem Memory-Spiel mit §-Nummern.
