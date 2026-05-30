## Ziel

Das Phrasen-Duell läuft komplett in normalen Dialogen — wie jedes andere NPC-Gespräch. Kein eigenes UI, kein Overlay. Kowalk als ruhige Stimme aus dem Off (subtext) bei Bedarf. Punktezählung und Rundenlogik passieren über bestehende `setFlag`/Counter-Mechanik im Dialog.

## Kernregeln (alle vier vom Nutzer aus dem letzten Turn)

1. **Layard lernt nur durch fremde Konter.** Wenn er Brust angreift und Brust sauber kontert, lernt er nichts. Wenn Brust ihn angreift und Layard danebenliegt, **zeigt Brust den richtigen Konter** — und nur dann darf der Spieler ihn ins Phrasenbuch übernehmen.
2. **Brust muss sichtbar reagieren.** Greift Layard an, kontert Brust entweder souverän (Punkt für Brust) oder stottert sichtbar (Punkt für Layard). Kein stilles „verloren".
3. **Layards Angriffe sind bürokratische Abschiebephrasen** (Hausflur-Liste, Anlage 3, Sechs-Wochen-Frist, „steht im Protokoll", Vorgesetzten-Bluff von Bodo, Türschild-Klassiker von Helka). Keine Höflichkeit, kein Smalltalk, keine Resonanz-Anspielungen.
4. **Kein eigenes Interface.** Standard-Dialog-Overlay reicht. Kowalk-Kommentare laufen als `subtext` oder als `KOWALK`-Sprecher zwischen den Runden.

## Aufbau eines Trainingsfalls (3 Runden pro Fall, 3 Fälle nötig)

```text
Runde 1 — Brust greift an
  Brust:   <Phrase aus PHRASES>
  Spieler: 4 Konter-Optionen
    Treffer  → Punkt Layard, Kowalk (subtext): „Sitzt." → Runde 2
    Fehler   → Brust zeigt korrekten Konter
               Spieler: [Ins Phrasenbuch übernehmen] oder [Weiter]
               → Runde 2

Runde 2 — Layard greift an
  Spieler: 3–4 Angriffsphrasen (nur die, die er kennt; Standard-Pool +
           gelernte Bodo/Helka-Specials, falls vorhanden)
    Brust kennt sie  → souveräner Konter (Punkt Brust)
    Brust kennt sie nicht (nur Bodo/Helka-Specials)
                     → Brust stottert sichtbar (Punkt Layard)
    → Runde 3

Runde 3 — Brust greift an (wie Runde 1)

Auswertung des Falls:
  ≥ 2 Punkte Layard → Trainingsfall gewonnen, Counter +1
  sonst             → verloren, Counter zurück auf 0 (oder nicht erhöht)
```

Drei gewonnene Fälle in Folge → `vossbeckSummoned` setzen → Brust schickt zu Vossbeck. Drei Niederlagen in Folge bei **Vossbeck** → `duelEndgameLost` → Kowalk-Fälschungspfad (existiert schon).

## Vossbeck-Endrunde

Identische Struktur, 3 Runden, härterer Ton (Vossbeck-Phrasen aus `pE-*`), setzt `duelEndgameWon` oder `duelEndgameLost`.

## Datenmodell

`src/game/bureaucracyDuel.ts` bleibt **wie jetzt** (Phrasen, Konter, Angriffs-Phrasen, Konter-Replies, `opponentCounters()`-Helper). Keine Änderung nötig — der Korpus ist bereits passend.

## Neue Dialog-Bäume

In `src/game/dialogs/cafeteria.ts`:

- **`cafeteriaTrainingA`**, **`cafeteriaTrainingB`**, **`cafeteriaTrainingC`** — drei austauschbare Trainingsfälle, je 3 Runden. Brust wählt per Counter (`duelTrainingsRun`) den nächsten, damit kein Fall doppelt kommt.
- **`vossbeckDuel`** — Endrunde, 3 Runden, identische Mechanik mit härteren Phrasen.

Jeder Tree nutzt nur Standard-Mechanik: `choices`, `next`, `action: (api) => api.setFlag(...)`, lokale Tally über transiente Flags wie `duelRoundHit1/2/3`. Am Ende des Falls Auswertung in einer Auswertungs-Line, Cleanup der transienten Flags.

## Phrasenbuch-Übernahme

Bestehender Eintrag-Mechanismus bleibt: nach einer Fehlrunde bekommt der Spieler eine Wahl `[Ins Phrasenbuch übernehmen]`, die `api.learnCounter(id)` (oder das bestehende Äquivalent) aufruft. Das ist die **einzige** Lernquelle im Duell.

Bodo/Helka-Specials (`a-vorgesetzten-bodo`, `a-tuerschild-helka`) werden weiterhin außerhalb des Duells über die jeweiligen NPC-Dialoge gelernt — unverändert.

## Aufräumen

- **Löschen**: `api.openBureaucracyDuel` / `api.closeDuel`, `duelOpen`, `duelMode`, `duelTutorialShown`, alle Callsites in `cafeteria.ts` (`bDuelOffer`, `bDuelRetry`, `v6`) und `src/dev/ConsoleSwitcher.tsx` Zeile 70.
- **GameContext.tsx**: State + Setter + Provider-Werte entfernen (Zeilen 74–76, 125, 244–245, 468, 796, 1008–1009, 1058–1059).
- **types.ts**: `openBureaucracyDuel` aus `GameApi` entfernen, `duelTutorialShown` aus Flag-Union entfernen. Behalten: `duelTrainingWon1/2/3`, `duelEndgameWon`, `duelEndgameLost`.
- **GameShell.tsx**: bereits ohne Overlay (vorheriger Turn), nur noch prüfen, dass keine Reste übrig sind.
- **`bDuelOffer`**: aktualisiert auf `next: "cafeteriaTrainingA"` (bzw. via Counter auf B/C rotierend) — keine Overlay-Action mehr.
- **`v6`**: aktualisiert auf `next: "vossbeckDuel"`-Start, kein `openBureaucracyDuel`.

## Was bleibt unverändert

- `bureaucracyDuel.ts` (Datenmodul)
- Phrasenbuch-Inventar-Item (`ParagraphenNotizbuch`)
- Flags `duelTrainingWon1/2/3`, `duelEndgameWon`, `duelEndgameLost`
- Forgery-Pfad bei Kowalk (greift weiterhin auf `duelEndgameLost`)
- Vossbeck-Unready-Dialoge (`vossbeckUnready`, `vossbeckUnreadyOne`, `vossbeckUnreadyTwo`)

## Testfälle

1. Trainingsfall A starten, Runde 1 treffen, Runde 2 Standard-Phrase werfen (Brust kontert), Runde 3 treffen → 2 Punkte → gewonnen, Counter 1/3.
2. Trainingsfall A starten, Runde 1 daneben → korrekter Konter wird gezeigt → ins Phrasenbuch übernehmen → Phrasenbuch enthält neuen Eintrag.
3. Drei Fälle in Folge gewonnen → `vossbeckSummoned`, `bVossbeckHint` verfügbar.
4. Bodo-Phrase gelernt, in Runde 2 von Fall C werfen → Brust stottert, Punkt Layard.
5. Vossbeck-Endrunde gewinnen → `duelEndgameWon`, Kowalk-Stempel-Pfad öffnet.
6. Vossbeck-Endrunde 3× verlieren → `duelEndgameLost`, Fälschungspfad bei Kowalk öffnet.

## Größenordnung

Drei Trainings-Trees + ein Vossbeck-Tree ≈ 400–600 Zeilen Dialog in `cafeteria.ts`. Cleanup in 4 Dateien. Keine neuen Komponenten, keine neuen Module.
