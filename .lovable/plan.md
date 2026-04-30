## Quest-Logik-Test (statische Analyse + LLM-Review)

### Worum es geht

Das Spiel hat ~150 Story-Flags, ~25 Inventar-Items und ein einziges Ende (`api.setEnding()` im Dialog `insaAct2Return`). Pfade hängen über `requires`/`hiddenWhen` und freie Closures (`onUse`, `action`) zusammen. Ein vollständiger Solver wäre ohne das Spiel auszuführen unmöglich — pragmatisch leistbar (und sehr aussagekräftig) ist eine **statische Analyse über Quelltext-Patterns**, plus ein **optionaler LLM-Pass** für inhaltliche Widersprüche.

Ergebnis: ein neues Skript `scripts/quest-check.mjs` (analog zu `lore-check.mjs`) plus zwei npm-Skripte.

### Was das Skript prüft

**1. Tote Flags (Dead Ends)**
- Jeder Flag in `StoryFlag` muss irgendwo gesetzt UND gelesen werden.
  - Nur gesetzt, nie gelesen → toter Schreib-Flag (Code-Müll oder vergessenes Gate).
  - Nur gelesen, nie gesetzt → unerreichbares Gate (echter Dead End).
- Gleiches für Items: jedes `InventoryItemId` muss `addItem`-Quelle UND `hasItem`-Senke haben.

**2. Reachability zum Ende**
- Endzustand = Dialog `insaAct2Return` wird gestartet (= setzt `ending`).
- Skript baut einen groben Producer/Consumer-Graph:
  - "Wer setzt Flag X?" (`setFlag("X")` mit umgebender Region: Dialog-ID oder Hotspot-ID per AST-Suche um die Fundstelle).
  - "Wer braucht Flag X?" (`requires: ["X"]` und `hasFlag("X")`).
- Für jeden `requires`-Flag eines Pflicht-Hotspots/Dialogs auf dem Hauptpfad zum Ende: gibt es mindestens einen Producer, der NICHT selbst hinter einem `hiddenWhen` mit demselben Flag steht?
- Hard-Failures, die das Skript meldet:
  - Pflicht-Flag wird nur an einer Stelle gesetzt, die durch `hiddenWhen` einer ihrer Voraussetzungen blockiert wird.
  - Pflicht-Item wird nur an einer Stelle vergeben, deren Hotspot `hiddenWhen` einen Flag nennt, der aus dem Item-Erhalt resultiert ("Item kann ich nur kriegen, bevor ich es habe — also nie wieder").

**3. Pfadabhängigkeits-Konsistenz**
- `hiddenWhen`/`requires`-Konflikte: kein Hotspot/Dialog/Choice darf einen Flag gleichzeitig in `requires` UND `hiddenWhen` haben.
- `requires`-Zyklus: A.requires B, B.requires A → Skript meldet.
- `hiddenWhen` auf Flags, die der eigene `onUse`/`action` selbst setzt, ohne vorher ein Wirkergebnis zu produzieren ("Hotspot deaktiviert sich, bevor er etwas tut").
- Verwaiste String-Literale: `setFlag("xyz")`/`hasFlag("xyz")`/`requires: ["xyz"]`, deren Flag-Name NICHT in der `StoryFlag`-Union steht (Tippfehler-Detektor — TS fängt das oft, aber nicht in dynamisch zusammengebauten Arrays).

**4. Item-Logik**
- Jedes in `combine.ts` erwähnte Item ist auch ein gültiges `InventoryItemId`.
- Jedes Pflicht-Combine (z. B. `pencilStub × b3Authorization → siegelAbdruck`): alle Quell-Items existieren als `addItem`-Producer in einer Szene/Dialog, die vor der Combine-Stelle erreichbar ist.

**5. Lore-Konsistenz (optional, `--llm`)**
- Der LLM-Judge bekommt pro NPC: HardFacts + Biografie + alle `dialogSummaries` der NPC-Dialoge.
- Aufgabe des Judges: Widersprüche zwischen statischem Dialog-Text und Biografie/HardFacts melden (z. B. NPC behauptet im Dialog X über sich selbst, was Biografie widerspricht).
- Lauf pro NPC-Persona; Report wie beim Lore-Check.

### Output

- Konsole: knappe Pass/Fail-Liste pro Kategorie, exit code != 0 bei Fehlern.
- `/mnt/documents/quest-check-report.md`: Markdown mit allen Funden, gruppiert nach Schweregrad (HARD = Pfadbruch, SOFT = toter Flag/Stilbruch, INFO = Auffälligkeit).

### Was das Skript NICHT kann (ehrlich)

- Keine echte Symbolausführung von `onUse`/`action`-Closures. Wenn Spiellogik nur in JS-Code lebt (z. B. „Hotspot setzt Flag X nur, wenn `getMiraFloors()` Etage 4 enthält"), sieht der Linter nur die statische Spur.
- Keine Garantie für Vollständigkeit der Reachability — das Skript meldet **wahrscheinliche Dead Ends**, nicht beweisbare. Falsche Positive werden als INFO statt HARD gemeldet, damit du im Report kuratieren kannst.

### Pragmatischer Einsatz — wann laufen lassen

| Szenario | Befehl | Kosten |
|---|---|---|
| Vor jedem größeren Push (lokal) | `bun run quest:check` | 0 ct, < 2 s |
| Im CI auf jedem PR | `bun run quest:check` als Pflicht-Gate | 0 ct |
| Vor einem Release / nach Lore-Updates | `bun run quest:check:llm` | ein paar Cent (1 Judge-Call pro NPC) |
| Nach jeder neuen Quest / neuem Flag | manuell `bun run quest:check` | 0 ct |

Empfehlung: statische Variante als **Pflicht in CI** (kostenlos, schnell), LLM-Variante manuell vor Releases. Beide schreiben denselben Markdown-Report, sodass du Funde direkt durchgehen kannst.

### Technische Details

- Sprache: Bun + ts-morph (ist als devDep schon da) für AST-Analyse von `scenes.ts`/`dialogs.ts`/`combine.ts`. Damit kommen wir an die umgebende Funktion/Dialog-ID jeder `setFlag`-Stelle und können Producer korrekt zuordnen.
- Flag-Wahrheitsquelle: `StoryFlag`-Union aus `src/game/types.ts` per ts-morph einlesen.
- Pflicht-Pfad zum Ende: heuristisch über die Kette `setEnding` ← `insaAct2Return` ← Trigger-Hotspot in 2611 ← Voraussetzungen rückwärts.
- LLM-Pass nutzt dieselbe `callGateway`-Helper-Logik wie `lore-check.mjs` (Lovable AI Gateway, Modell `google/gemini-2.5-flash` als Judge).
- Neue `package.json`-Skripte:
  - `quest:check` → `bun scripts/quest-check.mjs`
  - `quest:check:llm` → `bun scripts/quest-check.mjs --llm`

### Nicht im Scope (bewusst weggelassen)

- Kein interaktiver Quest-Graph-Viewer (wäre nett, sprengt aber Scope).
- Keine Simulation einzelner Spielsessions (separates, größeres Projekt).
- Keine Änderung an der Spiellogik selbst — nur ein Test-/Lint-Tool.
