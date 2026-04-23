

## Ziel

Der Spieler darf **selbst entscheiden**, ob er die Ausgangsmeldung absetzt oder nicht. Beide Wege führen zu Stegmann, aber das Spiel **merkt sich die Entscheidung** und nutzt sie für spätere Reaktionen (Stegmann-Dialog, evtl. Leitstelle/Ending-Hinweise).

## Designprinzip

- Spieler erfährt von der Pflicht (Inbox + Telefon-Hinweis), entscheidet aber frei.
- **Kein Block** am Telefon — Stegmann ist immer anrufbar.
- **Zwei Flags** für die Entscheidung: `reportedExit` (gemeldet) und `skippedExitReport` (bewusst übersprungen — wird gesetzt, sobald Stegmann angerufen wird, ohne vorher gemeldet zu haben).
- Konsequenz ist **narrativ, nicht mechanisch**: Stegmann reagiert anders, je nachdem.

## Vorgeschlagener Ablauf

**1. Inbox-Nachricht [004]** (nach `calledInsa2`, nur solange `reportedExit` und `calledStegmann` nicht gesetzt sind):

```
Von:    Bauerfeind, I. (Leitstelle E67)
Betreff: Ausgangsmeldung — Standardprotokoll
Bitte melden Sie Ihren Ausgang aus E67 elektronisch:
  > report exit
Adressat: LEITSTELLE25@ZENTRAL.NETZ.
```

**2. Neuer Terminal-Befehl `report exit`** (in `help` aufgeführt nach `calledInsa2`):

- Zeigt:
  ```
  >> AUSGANGSMELDUNG → LEITSTELLE25@ZENTRAL.NETZ
  >> Verbindung zu ROUTER567.ZENTRAL.NETZ …
  >> ERROR 4567: ZENTRAL.NETZ nicht erreichbar.
  >> Meldung NICHT zugestellt.
  ```
- Setzt Flag `reportedExit` (Spieler hat es **versucht** — das zählt als Meldung).
- Beim zweiten Aufruf nur Kurzform.

**3. Telefon-Hotspot `phoneApt`** bleibt **immer aufrufbar**.
- Wird Stegmann angerufen, **bevor** `reportedExit` gesetzt ist → Flag `skippedExitReport` wird gesetzt.
- Wird Stegmann angerufen **nach** `reportedExit` → kein zusätzliches Flag.

**4. Stegmann-Dialog `stegmann.st1`** verzweigt anhand der Flags:

| Zustand | Stegmanns Eröffnung |
|---|---|
| `reportedExit` gesetzt | *„Ihre Ausgangsmeldung ist hier eingegangen — naja, der Versuch. Error 4567, ich weiß. Was brauchen Sie?“* |
| `skippedExitReport` (kein report) | *„Sie haben den Ausgang nicht gemeldet. Standardprotokoll, Herr Layard. Beim nächsten Mal bitte zuerst melden. — Was brauchen Sie?“* |

Beide Pfade münden danach im **identischen** Code-Übergabe-Flow (`st2` …). Keine Sackgasse, kein Lock.

**5. Optionaler späterer Hinweis** (klein, nicht aufdringlich): In `insa3` (Sanitäter-Anruf) oder im Ending kann ein zusätzlicher Halbsatz erscheinen, wenn `skippedExitReport` gesetzt ist — z. B. Bauerfeind erwähnt nebenbei *„Ihre Ausgangsmeldung steht übrigens noch aus.“* Hält die Entscheidung im Gedächtnis des Systems.

## Technische Änderungen

**`src/game/types.ts`**
- Neue Flags: `reportedExit`, `skippedExitReport`.

**`src/components/game/Terminal.tsx`**
- Neuer Branch `cmd === "report exit"` → Ausgabe + `setFlag("reportedExit")`.
- `COMMANDS`/`HELP_LINES`: Eintrag `report exit` (sichtbar nach `calledInsa2`).
- `inbox`: Eintrag `[004]` (sichtbar wenn `calledInsa2` && nicht `calledStegmann`).
- `read 004`: Mailtext mit explizitem Befehl-Hinweis.

**`src/game/scenes.ts`** — `phoneApt.onUse` (Stegmann-Zweig):
- Vor `startDialog("stegmann")`: wenn `!hasFlag("reportedExit")` → `setFlag("skippedExitReport")`.
- Kein Block, kein Hinweis-Text — Anruf geht immer durch.

**`src/game/dialogs.ts`** — `stegmann.st1`:
- Text-Variante anhand der Flags wählen (zwei kurze Eröffnungslinien, danach gemeinsamer Pfad).
- Optional: in `insa3` einen knappen Halbsatz ergänzen, wenn `skippedExitReport`.

## Was unverändert bleibt

- Story-Flow (insa2a → Stegmann → Code → Tür) bleibt identisch.
- Keine neuen Räume, Hotspots oder Assets.
- Inbox-Nachrichten 001–003 unverändert.

