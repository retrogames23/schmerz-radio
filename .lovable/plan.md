# Credits sparen bei OpenRouter (und Sprachausgabe)

Ziel: die laufenden Kosten deutlich senken, ohne dass sich das Spiel für neugierige Erstbesucher*innen billig anfühlt. Grundidee: **günstig für alle, gut für Unterstützer*innen, hartes Netz gegen Ausreißer-Sessions.**

## 1. Sprachausgabe: klug begrenzen statt ganz sperren

Bereits vertonte Zeilen liegen dauerhaft im Sprach-Cache und kosten nichts — die bleiben für alle hörbar. Geld kostet nur **neu erzeugte** Sprache (fast nur im KI-Chat mit NSCs und beim DSA-Meister, weil dort die Texte jedes Mal anders sind).

Vorschlag:
- Feste Spieltexte (alles, was schon einmal vertont wurde): weiter für alle.
- Neu zu erzeugende Sprache aus KI-Antworten: nur für angemeldete Unterstützer*innen. Für alle anderen bleibt der Text sichtbar, die Vorlesen-Taste zeigt einen freundlichen Hinweis.
- Zusätzlich ein Tageslimit an neuen Sprach-Sekunden pro Konto, damit auch Unterstützer*innen keine Kostenlawine auslösen können.

Effekt: die teuren, nie wiederverwendbaren Vertonungen fallen fast komplett weg, die Atmosphäre im Hauptspiel bleibt erhalten.

## 2. DSA-Meister: günstiges Standardmodell für Gratis-Runden

Heute läuft für alle dasselbe Modell (GPT-5.6 Luna). Neu:
- **Nicht angemeldet / ohne Unterstützung:** das günstigste brauchbare Modell (Gemini 3.1 Flash Lite) — spürbar billiger, für ein Schnupper-Abenteuer völlig ausreichend.
- **Unterstützer*innen:** Luna als Standard, Haiku und Sonnet weiter wählbar.

Das macht das Schnuppern fast kostenlos und den Unterschied zur Unterstützung deutlich fühlbar.

## 3. Härtere, aber faire Limits

- Anonymes Schnupper-Abenteuer: **30 → 20 Meisterwenden**.
- Angemeldet ohne Unterstützung: statt 50 Anfragen insgesamt ein **Tagesbudget von 25 Anfragen**, das sich täglich erneuert (fühlt sich großzügiger an und deckelt trotzdem).
- Gruppenspiel: pro Raum und Tag ein gemeinsames Rundenbudget, damit ein Raum nicht stundenlang durchläuft.

## 4. Kleinere Stellschrauben mit großer Wirkung

- Für das Gratis-Modell: kürzeres Gedächtnisfenster (6 → 4 Nachrichten), kürzere Antworten (800 → 600), maximal 2 statt 4 Nachschlage-Runden im Regelwerk.
- NSC-Gespräche und Fastweb-Chat laufen heute auf dem teuren Haupt-Modell; dort reicht das günstige Modell für alle außer Unterstützer*innen.
- Antwortlängen dort von 600 auf 400 bzw. 240 auf 180 Zeichenbudget senken.

## 5. Notbremse statt „Zugriff verweigert"

Aus der vorhandenen Kosten-Telemetrie ein **Tages-Kostenbudget** berechnen. Ist es erreicht, antwortet der Meister mit einer freundlichen Meldung („Der Meister ruht heute") statt mit einem technischen Fehler — und Unterstützer*innen spielen weiter. So läuft der Schlüssel nie mehr komplett leer.

## Erwartete Wirkung

Zusammen sollten die Punkte 1–4 die Kosten pro Gratis-Session grob um **80–90 %** senken; Punkt 5 verhindert, dass ein einzelner Tag das Guthaben aufbraucht.

## Technische Umsetzung

- `src/lib/aiModel.ts`: neuer Export `AI_MODEL_DSA_FREE = "google/gemini-3.1-flash-lite"`; `resolveDsaMasterModel(requested, donor)` fällt für Nicht-Spender auf das Free-Modell zurück; Limits-Eintrag Free: `maxTokens 600, historyWindow 4, maxToolRounds 2`.
- `src/routes/api/public/dsa-master.ts` / `dsa-group.ts`: `ANON_MAX_TURNS 30 → 20`; `HARD_LIMIT` durch eine tagesbasierte Zählung ersetzen (neue RPC `try_increment_daily_request_count` mit `last_reset_date` in `profiles`); Donor-Flag an die Modellwahl durchreichen.
- `src/routes/api/tts.ts`: neuer Pflicht-Parameter `dynamic: boolean`. Bei `dynamic=true` Auth prüfen (`donation_unlocked`) plus Tagesbudget in Zeichen; Cache-Treffer aus `tts-cache` weiterhin ohne Auth ausliefern. Client (`src/audio/speech.ts`, NSC-/DSA-Aufrufe) setzt das Flag und blendet die Vorlesen-Taste sonst mit Hinweis aus.
- `src/routes/api/public/npc-chat.ts` / `fastweb-chat.ts`: `AI_MODEL_MAIN` nur für Spender, sonst `AI_MODEL_LIGHT`; `max_tokens` 600 → 400 bzw. 240 → 180.
- Tagesbudget-Notbremse: Aggregat über die bestehende Telemetrie-Tabelle (Summe Tokens des laufenden Tages), Schwelle als Konstante; bei Überschreitung 402 mit eigenem `code: "budget_reached"`.
