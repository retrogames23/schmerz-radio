# Akt-II-Einstieg bei Insa — motivieren statt setzen

## Was nicht stimmt

1. **Doppelte Szene.** Die Bridge-Cutscene zeigt schon das Treffen bei Insa: Tee, Kapsel auf den Tisch, „Ich hätte da etwas. Falls Sie ohnehin unterwegs sind", Layard nickt. Danach landet er bei Okwu und zu Hause. Wenn er später freiwillig in die Leitstelle zurückgeht und Insa anspricht, spielt der Dialog `insaAct2InPerson` faktisch dieselbe Begegnung ein zweites Mal („Setzen Sie sich. Ich habe Sie mir größer vorgestellt." — das war schon).
2. **Layards Existenzfragen kommen aus dem Nichts.** Die drei Auswahlzeilen („Warum bin ich so, wie ich bin?" / „Warum ist das ein Krankheitsbild?" / „Wer hat das Schmerz-Radio erfunden?") sind die größten Fragen des Spiels — und er stellt sie einer Disponentin, die er bisher nur als Telefonstimme kennt. Es gibt keinen Grund, ausgerechnet sie das zu fragen.
3. **Die Quest fällt aus der Schublade.** Insa zieht eine 20 Jahre alte Akte hervor, in der zufällig genau Layards Symptom beschrieben ist, mit dem Gutachter Marteau, den Layard angeblich „aus einem ganz anderen Mund" kennt — nur hat ihn vorher nie jemand erwähnt. Sertl/1978/E12/5710 sind komplett neue Begriffe ohne Vorsaat.

## Ziel

Der Quest-Einstieg muss aus dem ergeben, was Layard und der Spieler bis dahin wissen — nicht aus einer freundlichen Frage, die zufällig den richtigen Aktendeckel öffnet.

## Plan

### 1. Bridge & In-Person sauber trennen

Die Bridge endet damit, dass Insa **andeutet** — sie nimmt die Kapsel, sagt „ich hätte da etwas, kommen Sie morgen vorbei, wenn der Tee kalt geworden ist", aber **gibt noch nichts heraus**. Layard nickt, weiß nicht worauf. Die Akte wird erst beim zweiten, freiwilligen Besuch in der Leitstelle übergeben — das ist dann `insaAct2InPerson`.

Änderungen:
- `ACT2_BRIDGE_BEATS` Beats 4–6 leicht umschreiben: Kapsel-Übergabe ja, „etwas für Sie" als vage Einladung, aber keine Akte, kein Marteau, kein 5710. Tee wird angeboten und nicht getrunken.
- Doku-Kommentar in `leitstelleE67.ts` anpassen: „zweiter Besuch in der Leitstelle".

### 2. Marteau und 1978 vorpflanzen

Damit Insa keine neuen Namen aus dem Hut zieht, müssen Marteau, Sertl und „1978 / Resonanz-Überlastung" mindestens **zweimal vor dem Insa-Termin** kurz fallen — beiläufig, nicht erklärend.

- **Mikael** (Akt I, beim Zurückgeben der Kapsel oder im Pub): ein Satz wie „Das ist nicht das erste Mal. In den Siebzigern hat einer namens Marteau aufgeschrieben, was so jemand wie Sie hört. Niemand wollte es lesen."
- **Adaeze/Okwu** in der Bridge-Cutscene (clinical-Beat): statt nur „Sieben Tage kein Schmerz-Radio" — eine Zeile wie „Sie sind nicht der erste Hörer mit diesen Werten. Der letzte hieß Sertl. 1978." Trocken, ohne Erklärung. Layard kann das Gespräch nicht aufmachen, weil Okwu schon Brille aufgesetzt hat.

Beide Sätze sind Saatkörner — der Spieler weiß: da war was, das niemand erklärt hat. Wenn Insa später dieselben Worte benutzt, fügen sich zwei Splitter zusammen, statt einer Akte aus dem Nichts.

### 3. Layards Frage erden

Der In-Person-Dialog beginnt nicht mit „Was haben Sie auf dem Herzen?" sondern mit dem **Anlass**: Layard kommt wegen einer von drei konkreten Sachen, die er aus Akt I / Bridge mitschleppt:

- die Kapsel und Mikaels Satz („Sie sagte, in den Siebzigern hätte einer …"),
- Okwus „Sertl, 1978",
- die vage Einladung „kommen Sie morgen vorbei".

Die drei Wahlmöglichkeiten werden konkrete Aufhänger:
- „Mikael hat einen Namen erwähnt. Marteau."
- „Okwu hat Sertl gesagt. 1978. Sie hat nicht weitergeredet."
- „Sie haben gesagt, Sie hätten etwas für mich."

Insas Antwort ist auf alle drei dieselbe Akte — aber jetzt als **Antwort auf Layards Frage**, nicht als ungebetenes Geschenk. „Sie haben den Namen gehört. Gut. Dann muss ich Ihnen nicht erklären, warum ich Ihnen das hier gebe."

Die existenziellen Fragen („warum bin ich so") verschieben sich nach hinten in den Dialog oder in `insaAct2InPersonAfter` — als das, was Layard fragen kann, **nachdem** er die Akte gelesen / das Archiv gesucht hat. Da gehören sie hin, da sind sie verdient.

### 4. Mira-Splitter bleibt

Die Zeilen `ip10friendly` / `ip10skeptical` funktionieren weiter — sie hängen am Ende, nicht am Anfang.

## Technischer Anteil

- `src/game/cutscenes.ts`: Beats 4–6 von `ACT2_BRIDGE_BEATS` neu texten (kein Marteau, kein 5710, keine Akte). Okwu-Beat (Index 8) um eine Sertl-Zeile ergänzen.
- `src/game/dialogs/mikael.ts` (oder die Pub-/Kapsel-Szene): einen Marteau-Saatsatz einbauen, hinter einer Bedingung, die nur greift, wenn Mikael die Kapsel zurückgibt.
- `src/game/dialogs/insa.ts` `insaAct2InPerson`: Einstieg umschreiben (Anlass-Wahl statt Existenzfrage), Akten-Übergabe als Antwort framen. `onEnd` bleibt (Item + Flags).
- `src/game/scenes/leitstelleE67.ts`: Doku-Kommentar präzisieren.
- Keine neuen Flags nötig — `mikaelKapselZurueck` o. ä. existiert bereits oder wird sowieso vor dem Insa-Termin gesetzt; ggf. checken.

## Was bewusst offen bleibt

- Archiv 5710 als Schauplatz, der Mira-/Skeptical-Pfad dorthin und die Marteau-Spur sind weiterhin der nächste Planschritt — der hier vorgeschlagene Fix macht nur den **Übergabemoment** glaubwürdig.