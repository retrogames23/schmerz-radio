# Refactoring-Analyse: Top 5 Baustellen

Die Codebase ist insgesamt erstaunlich sauber (kaum `any`, keine ESLint-Schreie, sinnvolle Modulgrenzen). Die größten Hebel liegen jetzt **nicht** in Code-Hygiene, sondern in **Architektur** (ein riesiger God-Context, ein 5000-Zeilen-Datenmodul) und **Render-Performance**.

Hier die fünf wichtigsten Punkte, sortiert nach Impact:

---

## 1. `GameContext.tsx` — God-Context mit 30+ State-Slices (Top-Priorität)

**Befund:** Eine einzige Context-Datei (887 Zeilen) verwaltet **alles**: Szene, Dialoge, Inventar, 12+ Overlay-Booleans (Radio, Terminal, Keypad, TV, Node, Pneumatic, Duel, Notizbuch, Handbook, IdCard, LobbyGate, DSA-Sheet …), Resonanz, DSA-Charakter, Save/Load, gelernte Paragraphen, Brust-Streak. **30 Komponenten** konsumieren `useGame()` — jede einzelne re-rendert bei **jeder** State-Änderung (Caption-Tick, Dialog-Step, Overlay-Toggle).

**Warum sinnvoll:** Ein Klick auf „Notizbuch öffnen" rendert aktuell `SceneView`, `Inventory`, `TopBar`, `Terminal`, `RadioPanel` etc. mit. Das ist der Hauptgrund für gefühlte Trägheit bei vielen offenen Overlays.

**Plan:**
- **Context aufspalten** in domänenfokussierte Provider:
  - `GameStateProvider` (Szene, Flags, Knowledge, Inventar — Kern-Spiellogik)
  - `OverlayProvider` (alle `*Open`-Booleans + open/close-Funktionen)
  - `DialogProvider` (dialogId, lineId, advance/close)
  - `DsaProvider` (Charakter, Sheet, Adventure, Beat)
  - `DuelProvider` (duelOpen, duelMode, learnedParagraphs, brustWinStreak)
  - `SaveProvider` (saveGame/loadGame/listSaves/deleteSave)
- `GameApi` bleibt als stabile Facade (die `useMemo`-Konstruktion ist gut).
- **Selector-Pattern**: kleines `useGameSelector(s => s.scene)` via `use-context-selector` ODER manuelles Splitting reicht meist.

---

## 2. `dialogs.ts` — 5053 Zeilen reine Daten in einer Datei

**Befund:** Alle Dialogbäume aller NPCs (Philippe, Mira, Bodo, Brust, Vossbeck, Kowalk, …) liegen in einer Datei. Das macht jede Bearbeitung riskant (Build-Fehler kosten alles), erschwert PRs, und Vite muss bei jeder Änderung das ganze Modul neu transformieren.

**Warum sinnvoll:** Schnellere Dev-HMR, geringeres Risiko bei Edits, klare Ownership pro NPC. **Kein** Performance-Risiko — Daten werden weiterhin statisch gebündelt.

**Plan:**
- Ordner `src/game/dialogs/` mit Dateien pro NPC/Akt: `philippe.ts`, `mira.ts`, `bodo.ts`, `brust.ts`, `vossbeck.ts`, `kowalk.ts`, `system.ts`, etc.
- `src/game/dialogs/index.ts` mergt alle zu einem `Record<string, DialogTree>`.
- Helfer wie `maybeGiveWartungsnotiz5610` nach `src/game/dialogs/_helpers.ts`.
- Analog erwägbar für `scenes.ts` (2600 Zeilen), aber niedrigere Priorität.

---

## 3. `Terminal.tsx` — 2053 Zeilen Mega-Komponente mit verflochtener Business-Logik

**Befund:** Die Terminal-Komponente vermischt UI (Eingabe, Ausgabe, Scroll, Cursor) mit massiver Business-Logik: drei Dateisysteme, Befehls-Parser, Adventure-Game-Subprogramm, Lotti-Subprogramm, News-Subprogramm, OS-Versionierung, Net-Hosts, Bodo/Mira-Modus.

**Warum sinnvoll:** Aktuell unmöglich isoliert zu testen, jeder Tipp triggert ein Re-Render der gesamten Komponente, neue Befehle einzubauen ist riskant.

**Plan:**
- `useTerminalEngine()` Custom Hook: kapselt Zustand (Lines, History, CWD, aktive Subprogramm-States) + `runCommand(input)`.
- `useCommandRegistry()`: Map `commandName → handler({ args, fs, api, state }) → Lines`. Befehle (`ls`, `cat`, `cd`, `sysupdate`, `net`, …) werden eigene kleine Module unter `src/game/terminal/commands/`.
- Subprogramme (`adventureGame`, `lottiProgram`, `newsProgram`) bekommen einheitliches `Subprogram`-Interface (`start`, `step(input)`, `complete`).
- `Terminal.tsx` nur noch ~200 Zeilen reines Rendering (Lines-Liste + Input).

---

## 4. Inkonsistentes Memoization-Profil — viele Overlays neu-rendern unnötig

**Befund:** `MusicPlayer` und `useMusic` nutzen Memoization, aber **kein einziges Overlay** (`BureaucracyDuelOverlay`, `HandbookOverlay`, `IdCardOverlay`, `ParagraphenNotizbuchOverlay`, `DialogOverlay`, `Inventory`, …) ist mit `React.memo` umhüllt oder nutzt `useMemo`/`useCallback` für Handler. In Kombination mit Punkt 1 rendert bei jeder Caption-Änderung die ganze Overlay-Wand mit.

**Warum sinnvoll:** Spürbare Latenz auf älteren Geräten / im Mobile-Modus, vor allem während Dialogen und Terminal-Sessions.

**Plan:**
- Nach Context-Split (Punkt 1): die geschlossenen Overlays früh-returnen lassen (`if (!open) return null;` ist meist schon da — aber sie konsumieren trotzdem den Context und re-rendern).
- `React.memo` für reine Anzeige-Komponenten: `Hotspot`, `ItemIcon`, `ActiveItemBanner`, `TopBar`.
- Inline-Handler in `SceneView` / `Inventory` mit `useCallback` stabilisieren.
- `learnedParagraphs` als `ReadonlySet` ist gut — aber im Notizbuch-Overlay aktuell jedes Mal `Array.from()` ohne `useMemo`.

---

## 5. State-Duplizierung via Refs — Symptom für fehlende Trennung

**Befund:** In `GameContext` werden ~10 State-Slices parallel als `useRef` gespiegelt (`flagsRef`, `inventoryRef`, `sceneRef`, `resonanceRef`, `learnedParagraphsRef`, `dsaCharacterRef`, …), nur damit `api`-Callbacks über `useMemo([])` stabil bleiben. Das ist ein Workaround dafür, dass `api` und State im gleichen Provider leben.

**Warum sinnvoll:** Halbiert die Komplexität des Providers, eliminiert eine ganze Klasse von Bugs („Ref nicht aktualisiert"), und ist nach Punkt 1 fast geschenkt.

**Plan:**
- Nach Context-Split: `api` lebt in einem eigenen, schlanken Provider, der die kleineren State-Provider via `useContext` liest. State-Setter werden als stabile Referenzen aus den `useState`-Hooks verwendet (sind ohnehin stabil), wodurch die meisten Refs entfallen.
- Übrig bleibende Refs nur dort, wo wirklich „aktuellster Wert in Async-Callback" nötig ist (z. B. Save-Schreiben).

---

## Was ich **nicht** angefasst habe (bewusst)

- **`any`-Audit:** Es gibt im handgeschriebenen Code praktisch kein `any` (nur in einer Edge-Function und in der generierten `routeTree.gen.ts`). Keine Aktion nötig.
- **Toter Code / ungenutzte Imports:** Stichprobenartig sauber. ESLint/TS-Strict läuft im Build mit, würde sofort meckern.
- **`scenes.ts` (2600 Zeilen):** Strukturell wie `dialogs.ts`, aber niedrigere Änderungsfrequenz. Optionaler Folge-Schritt nach Punkt 2.

---

## Vorgeschlagene Reihenfolge der Umsetzung

```text
Schritt 1  →  GameContext aufspalten         (#1, #5)  ← größter Hebel
Schritt 2  →  dialogs.ts in Ordner aufteilen (#2)      ← niedriges Risiko
Schritt 3  →  Memoization der Overlays       (#4)      ← profitiert von #1
Schritt 4  →  Terminal.tsx zerlegen          (#3)      ← größter Aufwand
```

Jeder Schritt ist einzeln auslieferbar mit Build-Check dazwischen.

---

**Bitte gib mir „Go" für den Gesamtplan, oder sag mir, mit welchem Punkt ich starten soll** (z. B. „nur #2, ist mir am wichtigsten"). Ich fange erst nach deinem OK an zu schreiben.
