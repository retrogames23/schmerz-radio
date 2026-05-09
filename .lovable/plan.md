## Ziel

Im Dev-Mode (`?dev=1`) wird das laufende `DialogOverlay` zum In-Place-Editor — analog zur Overlay-QA für Hotspots. Layard spielt normal weiter, kann aber jede sichtbare Dialogzeile direkt umschreiben, ihren Sprecher wechseln, sie in 2/3 Teile splitten oder mit der vorherigen Zeile zusammenführen. Ein Knopf „Report kopieren" baut aus allen Änderungen einen strukturierten Commit-Block für den Chat.

## Verhalten

1. **Aktivierung**
   - Nur sichtbar bei `?dev=1` (bestehendes `useDevMode`).
   - Neuer Floating-Button „DLG" links neben dem QA-Button mit Toggle „Dialog-Edit an/aus" + Override-Counter.
   - Solange Dialog-Edit aktiv ist, läuft das Spiel normal weiter — der Editor wird einfach in jedes geöffnete `DialogOverlay` eingeblendet.

2. **Inline-Editor im DialogOverlay**
   Wenn Dialog-Edit aktiv ist und ein Dialog läuft, bekommt das Bubble-Element zusätzliche Controls:
   - Sprecher-Pille → Dropdown (Liste aus `DialogLine.speaker`-Union).
   - Haupttext → `contenteditable`-Block. Speichern beim Blur oder Cmd/Ctrl+Enter.
   - Subtext (Schmerz-Radio) → eigenes Feld unter dem Haupttext, immer sichtbar (Placeholder „— kein Subtext —").
   - Choice-Buttons → Text inline editierbar. Logik (`next`, `action`) bleibt unangetastet.
   - Mini-Toolbar oben rechts in der Bubble:
     - `↶ Original` — Override für diese Zeile zurücksetzen.
     - `✂ 1/2`, `✂ 1/3`, `✂ 2/3` — Split an relativer Position. Der Cursor in `contenteditable` hat Vorrang: wenn der User eine Caret-Position gesetzt hat, splittet `✂ hier` an dieser Stelle.
     - `⨯ Merge ↑` — diese Zeile in die vorherige zurückführen (nur, wenn die vorherige eine reine `next`-Kette ist, also keine `choices`).
     - `＋ Zeile danach` — leere Zeile einschieben.

3. **Split / Merge — Persistenz-Modell**
   Echte Bearbeitung von `dialogs.ts` zur Laufzeit ist nicht möglich, daher arbeitet der Editor mit einer **Patch-Schicht über `dialogs`**:
   - Ein neues `dialogPatchState.ts` hält je `dialogId` ein Patch-Objekt:
     ```
     {
       fields: { [lineId]: { text?, subtext?, speaker?, choices?: { [idx]: { text } } } },
       ops: Array<
         | { kind: "split", at: lineId, parts: string[] }            // text-fragmente
         | { kind: "merge", from: lineId, into: lineId }
         | { kind: "insertAfter", after: lineId, text, speaker }
       >
     }
     ```
   - `getPatchedDialogTree(id)` rekonstruiert eine `DialogTree`-Kopie:
     - wendet erst `ops` in Reihenfolge an (neue Line-IDs `__split_<orig>_1`, `__split_<orig>_2`, … / `__ins_<n>`); rewired `next` der Vorgängerzeile auf den ersten Split-Teil und `next` des letzten Teils auf das ursprüngliche `next`/`end`.
     - überschreibt dann `fields` (text/subtext/speaker/choice-text). `next`, `requires`, `action`, `onEnd`, `end` bleiben unangetastet.
   - `DialogOverlay` ruft statt `dialogs[dialogId]` ab sofort `getPatchedDialogTree(dialogId)`. In allen anderen Codepfaden (Spiel-Logik) bleibt es bei `dialogs[…]`.
   - Persistenz in `localStorage` unter `e67.dialogPatches`, ein Schlüssel pro Dialog. Überlebt Reload.

4. **Report kopieren**
   Sammelt alle Patches und baut einen Markdown-Block, den der User in den Chat zurückgibt. Zwei Sektionen:
   - **YAML-Block** (kompatibel mit `scripts/import-dialogs.mjs`) für reine Text-/Subtext-/Speaker-/Choice-Text-Änderungen — kann der User notfalls auch selbst per `node scripts/import-dialogs.mjs` einspielen.
   - **Strukturelle Änderungen** (Splits, Merges, Inserts) als menschenlesbare Anweisungen pro Dialog mit Vorher/Nachher-Auflistung der Lines + neuem `next`-Routing. Diese wendet der Chat-Agent als Code-Edit auf `src/game/dialogs/<datei>.ts` an. Format z.B.:
     ```
     ### insaAct2InPerson
     SPLIT line `i2_intro` (1/3 + 2/3):
       i2_intro          → "Setzen Sie sich. Ich habe Ihre Akte gelesen."
       i2_intro__split_2 → "Sieben Tage Pause. Ich frage nicht nach. Adaeze entscheidet das."
       Routing: i2_intro.next = i2_intro__split_2 ; i2_intro__split_2.next = i2_choice
     MERGE `i2_filler` → `i2_intro` (text angehängt, line entfernt).
     ```
   - Der Header zählt: `N Dialoge · X Felder · Y Splits · Z Merges`.
   - Reset-Button („alle Dialog-Patches verwerfen") wie im Overlay-QA.

5. **Was bewusst nicht im Editor erscheint**
   - `next`, `requires`, `hiddenWhen`, `action`, `onEnd`, `requiresRadio` — bleibt Code, weil Spiellogik. Editor zeigt diese Felder als read-only Chips (`→ next: i2_choice`, `🔒 requires: act2Started`), damit der User Kontext hat, aber nicht versehentlich Routing zerlegt.
   - Anlegen ganz neuer Dialogbäume oder Verbinden zweier Bäume — außerhalb des Scopes.

## Technische Änderungen

| Datei | Änderung |
|---|---|
| `src/dev/dialogPatchState.ts` (neu) | Patch-Datenmodell, localStorage-IO, `getPatchedDialogTree`, kleine Hooks (`useDialogPatches`, `usePatchedTree`). |
| `src/dev/DialogEditOverlay.tsx` (neu) | Floating-Button + Toolbar-Panel (Toggle, Override-Count, „Report", „Report kopieren", „Reset"). |
| `src/components/game/DialogOverlay.tsx` | Bei aktivem Dialog-Edit: Bubble-Inhalte als Editier-Felder rendern, Mini-Toolbar (Split/Merge/Reset) einblenden, Schreibvorgänge an `dialogPatchState` weiterreichen. `dialogs[dialogId]` durch `getPatchedDialogTree(dialogId)` ersetzen. Im Edit-Modus: Klick aufs Backdrop löst kein „weiter" mehr aus, Tastatur-Listener pausieren. |
| `src/components/game/GameShell.tsx` | `<DialogEditOverlay />` einhängen (analog zu `OverlayQAOverlay`), gegated mit `useDevMode()`. |
| `src/dev/devMode.ts` | unverändert. |

Keine Änderungen an `dialogs/*.ts`, `types.ts`, `scripts/import-dialogs.mjs`. Der bestehende YAML-Roundtrip funktioniert weiterhin und wird vom Report mitgenutzt.

## Risiken / Edge-Cases

- **Splits an Choice-Zeilen**: erlaubt, der letzte Split-Teil erbt die Choices, alle früheren bekommen `next` auf den nächsten Teil.
- **Merge bei Choice-Vorgänger**: deaktiviert, Button greyed out mit Tooltip „Vorgänger hat Auswahl — bitte erst Choices auflösen."
- **Subtext nur bei aktiver Schmerz-Radio-Sicht** — im Editor immer editierbar, Vorschau-Hinweis „(nur sichtbar bei Radio an)".
- **Performance**: Patch-Anwendung ist O(Lines pro Tree), pro Frame trivial.

## Akzeptanz

1. Mit `?dev=1` erscheint Button „DLG". Toggle aktiviert Edit-Modus.
2. Beim Sprechen mit Insa kann Layard mitten im Dialog Text ändern, splitten, mergen — die Änderungen wirken sofort beim nächsten Klick „Weiter".
3. Patches überleben Reload.
4. „Report kopieren" legt einen Markdown-Block in der Zwischenablage ab, der YAML-Edits + strukturierte Split/Merge-Anweisungen enthält.
5. Spiel ohne `?dev=1` zeigt keinerlei Editor-UI und verhält sich identisch zur jetzigen Version.
