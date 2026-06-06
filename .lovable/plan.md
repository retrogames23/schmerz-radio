
# Sonnet-Kosten senken (DSA-Meister)

Sonnet 4 ist über OpenRouter ~4× teurer als Haiku (Input ~$3 vs $0,80 / MTok, Output ~$15 vs $4). Selbst mit funktionierendem Prompt-Cache (Read ~$0,30 / MTok) bleibt jeder Zug teuer, weil unser Meister-Prompt sehr groß ist und Tool-Loops + Output-Tokens linear mitskalieren.

Ich schlage zwei Stufen vor — du wählst, wie tief wir schneiden.

## Stufe A — Sonnet behalten, Pro-Call-Kosten halbieren

Reine Server-Änderungen in `src/routes/api/public/dsa-master.ts`, `src/routes/api/public/dsa-group.ts`, `src/game/dsa/lore/tool.ts` und `src/game/dsa/llmMasterPrompt.ts`. Keine UX-Änderung.

1. **`max_tokens` pro Modell skalieren.** Heute global 950. Für Sonnet auf 600 senken (Antworten sind meist 2–4 Sätze + Marker — 600 reicht locker). Haiku bleibt 950. Spart bei Sonnet ~35 % Output-Kosten.

2. **Tool-Loop für Sonnet auf 2 Runden kappen** (statt 4). Jede zusätzliche Runde ist ein voller Prompt-Roundtrip. Optional radikaler: für Sonnet `tool_choice: "none"` setzen — Sonnet kennt die Lore aus dem statischen Block ohnehin gut und braucht `dsaLore` viel seltener als Haiku. Spart pro Tool-Round-Trip ~1× vollen Cache-Read.

3. **History-Fenster modellabhängig.** Sonnet: letzte 6 Nachrichten statt 10. Haiku: bleibt 10. Spart bei jedem Sonnet-Call mehrere hundert Tokens un-cached Input.

4. **Statischen Lore-Block schlanker machen** (wirkt auf ALLE Modelle, hilft Sonnet aber am meisten, weil Cache-Read teurer):
   - Den ausführlichen `[AP: ...]`-Block (~30 Zeilen Gewichtungen) auf eine knappe Tabelle eindampfen — Details landen in einem `ap.kriterien`-Lore-Topic.
   - `[SCENE: …]`-Katalog mit Faustregeln pro Tag → bisher inline; stattdessen nur die Tag-Liste + ein Verweis „Bei Unsicherheit `dsaLore({topic:'scene.<tag>'})` aufrufen".
   - `buildCoreLoreAppend()` und `buildCompanionBackstoriesBlock()` prüfen, was wirklich pro Zug nötig ist — Companion-Backstories sind seltenes Lookup-Material, gehören in das Lore-Tool, nicht in den statischen Prompt.
   - Erwartung: statischer Block von heute ~ größenordnungsmäßig 8–12k Tokens auf 4–6k.

5. **Kosten-Telemetrie.** Im Server jeden Call mit `usage`-Feld von OpenRouter loggen (input/output/cached_read Tokens, Modell, Tool-Rounds). Aktuell fliegen Kosten blind — danach sehen wir pro Slot, wo das Geld wirklich hingeht, und können gezielt nachschärfen.

Realistische Erwartung Stufe A bei Sonnet: **~50–60 % weniger Credits pro Zug** (kombinierter Effekt aus kürzerem Prompt, weniger Tool-Roundtrips, kleinerem `max_tokens` und kürzerem History-Fenster).

## Stufe B — Sonnet aus dem Switcher entfernen (Nuklearoption)

Falls Stufe A nicht reicht oder du das Risiko der Premium-Modellwahl nicht mehr tragen willst:

1. `anthropic/claude-sonnet-4` aus `DSA_MASTER_MODELS` in `src/lib/aiModel.ts` streichen.
2. `resolveDsaMasterModel` fällt automatisch auf Haiku zurück; keine Spielstände kaputt.
3. Im UI-Switcher (`DsaModelSwitcher.tsx`) bleibt Haiku als Default + die billigeren Donor-Modelle (GPT-5.4 mini, DeepSeek, Gemini 2.5 Flash, Mistral Large).
4. Eine kurze Notiz im Switcher: „Premium-Modus pausiert — wird wieder freigeschaltet, sobald Kosten kalkulierbar sind."

Effekt: Sonnet-Kosten gehen auf 0. Spender, die Sonnet aktiv gewählt hatten, landen auf Haiku.

## Empfehlung

Erst **Stufe A vollständig umsetzen + Telemetrie aktivieren**. Wenn die Logs nach 1–2 Spieltagen zeigen, dass Sonnet immer noch unverhältnismäßig viel kostet (z. B. > 3× Haiku pro Zug), zusätzlich **Stufe B** ziehen.

## Technische Details

- Modell-aware Limits sauber über eine kleine Map in `aiModel.ts` (`MODEL_LIMITS: Record<string, {maxTokens:number; historyWindow:number; maxToolRounds:number; useTools:boolean}>`), damit beide Routen denselben Switch nutzen.
- `callMaster` in beiden Routen liest aus dieser Map; `callChatWithLoreTool` bekommt `maxToolRounds` und `useTools` als Parameter.
- Telemetrie: OpenRouter liefert in der Response `usage.prompt_tokens`, `usage.completion_tokens` und (bei aktivem Cache) `usage.prompt_tokens_details.cached_tokens`. Ein `console.log(JSON.stringify({model, action, tool_rounds, usage}))` pro Call reicht — landet in den Worker-Logs.
- Lore-Trim: zuerst eine Längen-Messung von `buildStaticMasterLore("city")` einbauen (einmaliger `console.log` im Dev-Build, in Zeichen UND geschätzten Tokens ≈ Zeichen/3.5), damit wir vor/nach dem Trim sehen, was es bringt.
- Beim Lore-Trim das `lookup.ts` um Topics `ap.kriterien`, `scene.<tag>`, `companion.backstory.<name>` erweitern.

Soll ich Stufe A bauen — und wenn ja, mit oder ohne den optionalen Schritt 2b (`tool_choice: "none"` für Sonnet)?
