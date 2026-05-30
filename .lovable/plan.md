## Ziel

Phrasen-Duell von Grund auf neu aufsetzen — komplett in normalen Dialog-Bäumen, ohne eigenes Overlay. Mechanik so, dass sie zu den vier Beobachtungen passt.

## Neues Konzept

### Grundregeln (anders als bisher)

1. **Lernen passiert nur durch fremde Konter.** Wenn Layard falsch kontert, lernt er **nichts**. Er lernt nur:
   - wenn **Brust** ihm im Trainingsfall den richtigen Konter vorführt (Brust korrigiert mit Phrase + Konter, Layard kann „[ ins Phrasenbuch übernehmen ]“ wählen),
   - wenn andere Bewohner (Bodo, Helka, Kowalk) ihm eine Phrase/einen Konter beibringen (bleibt wie bisher).
2. **Wenn Layard angreift, muss Brust sichtbar reagieren.** Entweder Brust kontert souverän (Layard-Phrase war linkisch oder Brust kennt sie) — oder Brust stottert sichtbar (Bodo/Helka-Spezialphrase). Kein stiller Punktverlust mehr.
3. **Layards Angriffsphrasen sind Behörden-Abschiebephrasen,** kein Smalltalk und keine Resonanz-Anspielungen. Beispiele: „Stehen Sie nicht auf der Liste für die Hausflurreinigung?“, „Den Antrag hätten Sie vor sechs Wochen stellen müssen.“, „Das fällt unter Anlage 3 — bitte den korrekten Stempel besorgen.“
4. **Kein eigenes Interface.** Alles läuft im normalen Dialog-Overlay. Kowalk wird als halblaute Erzähler-/Off-Stimme unter Brusts Zeilen eingebaut (das `subtext`-Feld bzw. zusätzliche Dialogzeilen mit Sprecher KOWALK).

### Spielablauf eines Trainingsfalls (rein dialogisch)

Ein Trainingsfall = ein neuer DialogTree `cafeteriaTraining` (zufällig aus mehreren möglich) mit drei „Runden“:

```
Runde 1  Brust-Angriff  → Layard wählt aus 4 Konter-Optionen
   Treffer : Brust knickt ein. Kowalk-Aside: „Sitzt.“ → Punkt für Layard.
   Fehler  : Brust liefert den richtigen Konter nach. Spieler darf
             [ ins Phrasenbuch übernehmen ] (lernt jetzt erst) → Brust-Punkt.

Runde 2  Layard-Angriff → Layard wählt aus 4 Angriffs-Phrasen
   Phrase aus Phrasenbuch + Brust kennt keinen Konter
        → Brust stottert sichtbar, Kowalk: „Volltreffer.“ → Punkt für Layard.
   Phrase aus Phrasenbuch + Brust kennt sie
        → Brust kontert souverän (ein Satz) → Brust-Punkt.
   Linkische Eigen-Phrase (Smalltalk / Bitte)
        → Brust kontert souverän → Brust-Punkt.

Runde 3  Brust-Angriff (wie Runde 1)
```

Ergebnis: 2 Punkte = Trainingsfall gewonnen → Streak +1, Kowalk-Off („Du wirst besser, Worag.“). Sonst verloren, Streak resettet.

Drei Trainingsfälle in Folge → Flag `duelTrainingWon3` → Brust verweist auf Vossbeck.

### Vossbeck-Endrunde

Eigener DialogTree `vossbeckDuel`: identische Mechanik, Phrasen aus dem Endgame-Pool, drei Runden Vossbeck-Brust-Vossbeck. Bei Sieg `duelEndgameWon`, bei Niederlage `duelEndgameLost`.

## Datenmodell

`src/game/bureaucracyDuel.ts` wird zu einem reinen **Daten- und Helfer-Modul** (keine Round/Session-Logik fürs Overlay mehr). Behalten:

- `PHRASES`, `COUNTERS`, `ATTACK_PHRASES`, `FICTIONAL_COUNTERS`, `FICTIONAL_ATTACKS`, `ATTACK_COUNTER_LINES`, `getCounter`, `getPhrase`, `getAttack`, `opponentCounters`, `BRUST_KNOWS_ATTACKS`, `VOSSBECK_KNOWS_ATTACKS`.

Geändert/entfernt:

- `FICTIONAL_ATTACKS` und `f-*` Konter werden gesäubert: die unpassenden Einträge (`f-warm`, `f-resonanz`, `fa-warm`, `fa-resonanz`, `fa-vorlauf` als „drei Wochen Vorlauf“) werden ersetzt durch behördentaugliche Abschiebe-Phrasen / linkische Höflichkeitsversuche, die ins Setting passen.
- Neue Angriffs-Phrasen ergänzen (Spezialitäten von Bodo / Helka / Kowalk-Training): „Hausflurreinigung“, „Anlage 3“, „Stempel besorgen“, „Sechs-Wochen-Frist“. Quelle (`source`) zuordnen, damit das Phrasenbuch sie korrekt listet.
- `TRAINING_ROUNDS`, `ENDGAME_ROUNDS`, `buildTrainingSession`, `buildEndgameSession`, `buildRoundCounters`, `buildLayardAttackOptions`, `pickTrainingRounds`, `pickEndgameRounds`, `DUEL_UI_TEXT` werden gelöscht — der neue Ablauf braucht sie nicht. Was an Ablauftexten wiederverwendbar ist (z.B. `onHit`, `onMiss`, `kowalkAside`), zieht in die neuen Dialog-Bäume um.

## Neue Dialog-Bäume

In `src/game/dialogs/cafeteria.ts` (oder neue Datei `src/game/dialogs/trainingDuel.ts`, dann im `dialogs/index.ts` einhängen):

- `cafeteriaTrainingA`, `cafeteriaTrainingB`, `cafeteriaTrainingC` — drei austauschbare Trainingsfälle, je mit Runde 1/2/3 wie oben.
- `vossbeckDuel` — Endrunde, drei feste Runden gegen Vossbeck.

Brusts `bDuelOffer` ruft nicht mehr `api.openBureaucracyDuel("training")`, sondern springt direkt in einen Trainingsfall-Baum. Welcher Baum gewählt wird: zufällig in einer kleinen Helper-Funktion in `_helpers.ts` oder per Counter-Flag (`duelTrainingsRun`).

Kowalk-Asides werden als eigene `KOWALK`-Zeilen (kursiv via Sprecher-Styling, wie schon bei `kowalkAside` in der `cafeteriaKowalk`-Szene) zwischen Brusts Zeilen eingebaut, nicht in `subtext`.

### Phrasenbuch-Übernahme

Jeder „[ ins Phrasenbuch übernehmen ]“-Choice setzt einen Flag pro Konter-ID (`learnedCounter:c-stapel` o.ä.), den der Phrasenbuch-Overlay liest. Das ist parallel zu Bodos/Helkas existenten Übernahme-Choices und ersetzt das implizite Lernen aus dem Overlay.

## Aufräumen

Komplett löschen:

- `src/components/game/BureaucracyDuelOverlay.tsx`
- alle `duelOpen`/`duelMode`/`openBureaucracyDuel`/`closeDuel`-Felder in `GameContext.tsx` und `types.ts`
- der Render-Aufruf in `GameShell.tsx`
- Flag `duelTutorialShown` (kein Overlay-Tutorial mehr nötig)

Bleibt erhalten:

- `ParagraphenNotizbuchOverlay` (Phrasenbuch) — das ist ein normaler Inventarslot.
- Flags `duelStarted`, `duelTrainingWon1/2/3`, `duelEndgameWon`, `duelEndgameLost` — werden jetzt aus den Dialog-`action`-Hooks gesetzt.

## Testliste (nach Implementierung)

- Brust-Trainingsfall durchspielen: Treffer in Runde 1, Fehler in Runde 1 → Übernahme-Choice sichtbar → Konter erscheint im Phrasenbuch.
- Runde 2 mit nur linkischen Phrasen: Brust kontert immer souverän, keine Verwirrung.
- Runde 2 mit gelernter Bodo-Phrase: Brust stottert sichtbar, Punkt für Layard.
- Drei Trainingsfälle in Folge gewinnen → `bVossbeckHint` erreichbar.
- Vossbeck-Duell: Sieg setzt `duelEndgameWon`, Niederlage `duelEndgameLost`.
- Keine Console-Errors zu fehlendem `duelOpen` / `BureaucracyDuelOverlay`.
