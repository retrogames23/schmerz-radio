## Änderungen

### 1. Composer im Gruppen-Spielraum erweitern (`src/routes/dsa.gruppe.$roomId.spiel.tsx`)

Bisher gibt es im Gruppen-Spielraum nur eine `Sagen`-Schaltfläche. Im Solo-Modus (`DsaLlmAdventureScene.tsx`) existiert daneben bereits ein **Outtime**-Knopf (stellt dem Meister eine Meta-/Regel-Frage; intern wird `Outtime: …` vor den Text gehängt) und eine Checkbox **„Enter = Abschicken"** mit Persistenz über `localStorage` (`dsa:composer:enterSubmits`).

Diese beiden Elemente werden 1:1 in den Gruppen-Composer übernommen:

- Outtime-Knopf links neben „Sagen", gleiches Styling. Beim Klick wird `submitAction` mit `Outtime: <text>` aufgerufen (Prefix nur setzen, wenn nicht schon vorhanden — wie in der Solo-Variante).
- Checkbox „Enter = Abschicken" in der Fußzeile, gleiches Layout wie im Solo-Composer (versteckt auf groben Pointern via `useCoarsePointer`). State wird aus demselben `localStorage`-Key gelesen/geschrieben, damit die Einstellung über Solo und Gruppe hinweg geteilt ist.
- `onKeyDown` der Textarea respektiert `enterSubmits` und ignoriert Composing-Events (`e.nativeEvent.isComposing`), analog zur Solo-Implementierung.

### 2. Eröffnungstext des Meisters entschärfen (`src/routes/api/public/dsa-group.ts`, Zeile ~702)

Aktuell steht im Spielleiter-Cue:

> „… weise darauf hin, dass jeder seine Aktion eintippt und du ALLE Aktionen einer Runde gemeinsam auswertest."

Daraus macht das LLM Sätze wie „achtet stets darauf, eure Taten gemeinsam einzureichen", was Spieler glauben lässt, sie müssten sich absprechen. Sie müssen nicht — jeder reicht unabhängig ein, der Meister wartet nur kurz und fasst dann zusammen.

Der Cue wird so umformuliert, dass dieser falsche Eindruck nicht entsteht. Neuer Text (sinngemäß, ohne „gemeinsam"):

> „(SPIELLEITER-CUE: Eröffne das Gruppenabenteuer. Begrüße kurz alle Helden namentlich in genau einer [TJARK]-Zeile. Erkläre knapp, dass jeder selbst eintippt, was sein Held tut — eine Absprache ist nicht nötig; du wartest kurz, sammelst die Aktionen ein und erzählst dann alles in einem Zug weiter. Setze die Szene mit [SCENE: …] in 2–4 Sätzen. Schließe mit einer offenen Frage „Was tut ihr?".)"

Die interne Regel in `src/game/dsa/group/prompt.ts` (Zeile 107, „Pro Runde reichen die Spieler PARALLEL Aktionen ein …") bleibt unverändert — sie ist sachlich korrekt und nur fürs Modell.

## Nicht geändert

- Lobby-Bildschirm (`dsa.gruppe.$roomId.tsx`) — dort gibt es keinen Composer.
- Solo-Composer, Server-Routen, RLS, Migrationen.
