## Ziel

Sicherstellen, dass jeder Tipp in `src/game/hints.ts` zu der Quest passt, die er beschreibt — d.h. dass `isActive`/`isResolved` zu den realen Story-Flags und Items passen, und dass die Tipp-Texte (Stufe 1–3) tatsächlich zum nächsten möglichen Spielerzug führen.

Hintergrund: Nach der jüngsten Story-Umarbeitung in Akt I (Insa als Hinweisgeberin, Vorgang 4317 als roter Faden, neuer Kowalk/Vossbeck/Brust-Pfad statt Server-Tap/Akte-Quest) besteht Risiko, dass einzelne Hinweise noch auf alte Trigger oder verschwundene Items verweisen.

## Vorgehen

### 1. Statisches Audit (automatisiert)

Erweiterung von `scripts/quest-check.mjs` (oder neues Geschwister-Skript `scripts/hints-check.mjs`), das pro `HINT_QUESTS`-Eintrag prüft:

- **Flag/Item-Existenz**: Jeder Flag in `isActive`/`isResolved` muss in `src/game/types.ts` deklariert und mindestens einmal per `setFlag` gesetzt werden. Jedes `hasItem(...)` muss zu einem realen Item-Producer passen.
- **Erreichbarkeit**: Es muss mindestens einen Pfad geben, in dem `isActive` true wird, ohne dass `isResolved` schon vorher zwingend true ist.
- **Auflösbarkeit**: Mindestens einer der `isResolved`-Flags muss durch eine im Code erreichbare Aktion gesetzt werden.
- **Reihenfolge**: Hint-Quests mit `priority < 20` (kritischer Pfad Akt I) müssen in der real spielbaren Reihenfolge nicht-überlappend werden — nur eine kritische Quest darf pro Spielzustand offen sein (Soft-Warnung).
- **Tipp-Wortlaut-Heuristik**: Für jede Quest die in den Tipps genannten Schlüsselwörter (Türnummern, NPC-Namen, Item-Namen, Flag-trigger­nde Hotspot-IDs) gegen die im Code referenzierten Strings abgleichen. Beispiel: Tipp 3 von `act1.callInsaForCode` nennt „Telefon in 2611"; im Scene-File `apartmentAct1.ts` muss ein Hotspot mit Telefon-Aktion existieren, der `calledForCode` setzt.

Output wie `quest-check`: Markdown-Report unter `/mnt/documents/hints-check-report.md` mit Pass/Fail je Quest und Hard/Soft-Buckets.

### 2. Manueller Lore-/Wording-Review

Liste aller 25 HINT_QUESTS durchgehen und jede Quest in einer Tabelle bewerten:

| Quest-ID | Trigger noch korrekt? | Tipps lösen wirklich? | Wording aktuell (Insa-Tonalität, neue 4317-Story)? |

Schwerpunkte nach der jüngsten Umarbeitung:
- `act1.callInsaFor5610`, `act1.kowalkBrief`, `act1.stamp4317`, `act1.send4317K`, `act1.callInsaForCode` — gesamter neuer Vorgang-4317-Pfad
- `act1.serverRoom5610` — ist das wirklich noch optional? In den Hints klingt es nach Spurensuche, die früher Pflicht war
- `act1.b3Authorization`, `act1.bureaucracyDuel`, `act1.vossbeckEndgame` — Verzahnung mit dem 4317-Hauptpfad (B3 fällt jetzt als Bonus mit raus)
- Akt-II-Eröffnung: `act2.visitInsa`, `act2.akte1978` — Türnummer 4602 stimmt mit aktuellen Scenes?

### 3. Spot-Check im Spielbetrieb

Für die 3–5 Quests, die im Audit auffällig wurden: tatsächlich im Spiel den jeweiligen Spielstand herstellen (über DevTool / Flag-Setzer) und prüfen, ob Stufe 3 des Tipps die Quest in einem einzigen Klick auflöst.

## Lieferumfang

- `scripts/hints-check.mjs` (oder erweitertes `quest-check.mjs`) mit den oben genannten Checks und Markdown-Report.
- Findings-Liste in der Antwort an dich, gruppiert in:
  - **Hart falsch** (Tipp verweist auf nicht existierendes Flag/Item/Türnummer)
  - **Veraltet** (Tipp beschreibt alte Story, müsste umformuliert werden)
  - **Unscharf** (Tipp technisch ok, aber Stufe 3 löst die Quest nicht eindeutig auf)
- Für jeden Fund: Vorschlag für die Korrektur (Flag-Tausch, Text-Patch, Quest-Streichung).

## Out of Scope

- Keine Code-Änderungen an `hints.ts` oder Scenes selbst — der Plan endet beim Findings-Bericht. Korrekturen bespreche ich mit dir und setze sie im Anschluss in einem zweiten Schritt um.
- Keine Übersetzungen / i18n-Refactors.
