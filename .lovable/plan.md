
## Refactoring-Plan: Render-Performance der Spiel-Kernkomponenten

Wir gehen iterativ vor — pro Iteration eine Komponente, getestet im Preview, dann die nächste. Dieser Plan beschreibt **Schritt 1 + 2** ausführlich, **Schritt 3–6** als Roadmap.

### Priorisierung (nach Dateigröße & Render-Kosten)

| # | Komponente | LoC | Hauptkosten |
|---|---|---|---|
| 1 | `Terminal.tsx` | 2059 | Riesige Datei, viele State-Branches, große statische Datenstrukturen im Render-Scope, Re-Render bei jedem Tastendruck |
| 2 | LLM-Setup (`webLlmLoader` / `webLlmRuntime`) | – | `@mlc-ai/web-llm` (mehrere MB) wird zwar dynamisch importiert, aber `webLlmRuntime` und `cloudLlmRuntime` werden statisch in `FreeChatOverlay` & `DonationGate` gezogen (die wiederum aus `GameShell` kommen) |
| 3 | `GameContext` | 902 | Single-Context für ALLES → jeder State-Change rerendert SceneView, Inventory, TopBar, alle Overlays gemeinsam |
| 4 | `SceneView.tsx` | 415 | Inline-Maps für NPCs/Decals/Hotspots ohne Memoisation, neue Style-Objekte pro Render |
| 5 | `RadioPanel.tsx` (698) / `Television.tsx` (377) | – | Audio/Video-Hooks ohne Memo |
| 6 | DSA-Stack (`DsaCharacterCreator` 998, `DsaAdventureScene` 682, `DsaCombatOverlay` 516) | – | Bereits lazy, aber intern stark monolithisch |

---

### Schritt 1 — `Terminal.tsx` aufteilen (jetzt umsetzen)

**Problem.** Die Komponente bündelt: Filesystem-Logik dreier User (Worag/Bodo/Mira), Adventure-Mini-Spiel, Lotti-Programm, News-Programm, ANSI-Boot-Sequenzen, Tastatur-/Audio-Handling, Versions-Patcher und das eigentliche Terminal-UI. Konstanten und Hilfsfunktionen (z. B. `osVersion`, `applyOsVersion`, `visibleChildren`, `formatLs`, `buildTree`, lange Boot-Sequenzen, Befehlstabellen) liegen im selben Modul wie das React-UI. Bei jedem Tastendruck wird der gesamte Riese neu evaluiert.

**Vorgehen.**
1. Reine Helpers in eigene Module ohne JSX:
   - `src/game/terminal/osVersion.ts` (`osVersion`, `applyOsVersion`)
   - `src/game/terminal/fsView.ts` (`visibleChildren`, `formatLs`, `buildTree`)
   - `src/game/terminal/bootSequences.ts` (die langen `BOOT_LINES`-Arrays inkl. `gateway-watch`-Listen)
   - `src/game/terminal/commands/` — pro Mini-Programm eine Datei (`adventure.ts`, `lotti.ts`, `news.ts` als Re-Exports, plus `centralOs.ts`, `bodoFs.ts`, `miraFs.ts`)
2. UI in kleinere Komponenten splitten:
   - `TerminalScreen.tsx` — Output-Render (memoisiert, `React.memo`, Props sind die Lines)
   - `TerminalInput.tsx` — Input-Feld + onKeyDown (eigene `useState`, kapselt Tipp-Re-Renders weg)
   - `TerminalChrome.tsx` — Frame, CloseButton, Scanlines
   - `Terminal.tsx` — bleibt Orchestrator (State + Command-Dispatcher), aber unter ~400 LoC
3. Memoisation gezielt einsetzen:
   - `useMemo` für aktiven Filesystem-Root pro User-Mode
   - `useCallback` für `runCommand`, `appendLine`, `handleKey`
   - `React.memo` auf `TerminalScreen` mit Props `lines` (nur neu rendern, wenn sich das Array-Ref ändert)
4. Lange statische Arrays (Boot-Sequenzen, Hilfetexte) als `const` auf Modul-Top-Level — werden nicht mehr pro Render neu erzeugt.

**Erwarteter Effekt.** Tastatureingaben lösen nur noch Re-Render von `TerminalInput` + `TerminalScreen` aus, nicht des ganzen Spiels. Initiales Bundle-Splitting bleibt erhalten (Lazy-Import in `GameShell`).

---

### Schritt 2 — LLM-Setup vom kritischen Pfad nehmen

**Problem.** `GameShell` rendert `<DonationGate />`, das statisch `webLlmLoader` importiert; `FreeChatOverlay` (statisch in `GameShell`) zieht `useLlmRuntime` + `cloudLlmRuntime` mit. Damit landet die LLM-Pipeline im `GameShell`-Bundle, obwohl das Modell selbst (`@mlc-ai/web-llm`) korrekt erst beim Start dynamisch geladen wird.

**Vorgehen.**
1. `FreeChatOverlay` aus dem statischen Importblock von `GameShell` entfernen und über `lazy()` einbinden — analog zu Terminal/HelpOverlay.
2. `DonationGate` so umbauen, dass `webLlmLoader` nur per `await import()` innerhalb des Effekts gezogen wird, der das Vorladen anstößt. Damit verschwinden `webLlmLoader` und `web-llm`-Typen aus dem GameShell-Chunk.
3. `useLlmRuntime` als kleinen Wrapper belassen, aber `cloudLlmRuntime` und `webLlmRuntime` jeweils erst beim ersten Senden einer Nachricht importieren (`async function ensureRuntime()` im Hook). Modell-Cascade & WebGPU-Check bleiben unverändert.
4. Title-Screen-Preload (`Game.tsx`) bleibt — er ruft jetzt `import("./GameShell")` ohne LLM-Ballast.

**Erwarteter Effekt.** Initiales `GameShell`-Chunk schrumpft spürbar. Erstes Szenenbild erscheint früher; LLM lädt im Hintergrund weiter (Gating über `markEssentialAssetsLoaded` bleibt aktiv).

---

### Schritt 3 — `GameContext` entzerren (geplant)

Aktuell ist alles in einem Context: jede Flag-Änderung rerendert TopBar, Inventory, SceneView, alle Overlays. Plan:
- Context aufteilen in `GameStateContext` (selten ändernd: scene, flags, knowledge), `OverlayContext` (terminalOpen, helpOpen …) und `InventoryContext`.
- Alternativ: bestehenden Context lassen, aber Selector-Hook (`useGameSelector`) mit `useSyncExternalStore` einführen, damit Komponenten nur auf benutzte Felder rerendern.
- `api`-Objekt mit `useMemo` stabilisieren (heute teilweise neu erzeugt).

### Schritt 4 — `SceneView` memoisieren (geplant)
- `bgFocusStyle`, `imgRect`-Style-Objekte mit `useMemo`.
- NPC-/Decal-/Hotspot-Listen in eigene `<NpcLayer />`, `<DecalLayer />`, `<HotspotLayer />` mit `React.memo` ausgliedern.
- `applyOverride`-Closure mit `useCallback`.

### Schritt 5 — `RadioPanel` & `Television` (geplant)
- Audio-/Video-Logik in eigene Hooks (`useRadioTuner`, `useTvPlayer`) extrahieren.
- Presentational-Komponenten unter `React.memo`.

### Schritt 6 — DSA-Overlays (geplant)
- `DsaCharacterCreator` in Step-Komponenten (Volk/Profession/Attribute/Vorteile/Übersicht).
- `DsaCombatOverlay`: Kampf-Engine als reiner Reducer in `src/game/dsa/combat.ts`, UI dünn drüber.

---

### Technische Details (für später)

- **Verträgliche Refactor-Häppchen:** Pro Schritt nur 1 Komponente bzw. 1 Modul-Familie, anschließend Build-Check & manuelle UI-Verifikation (Terminal, Free-Chat, Szenenwechsel).
- **Keine Verhaltensänderungen:** Befehls-Output, ANSI-Sequenzen, Filesystem-Daten und LLM-Lade-Phasen bleiben byte-identisch.
- **Tests:** Es gibt im Repo aktuell keine Vitest-Suite für diese Komponenten — wir prüfen visuell und über die bestehenden Story-Cheats (`F1`, Dev-`?dev=1`).
- **Kein Memoisations-Spam:** `useMemo`/`useCallback` nur dort, wo Kosten oder Identitäts-Stabilität nachweislich helfen (Listen, Style-Objekte, Callbacks an memoisierte Children).
- **Bundle-Verifikation:** Nach Schritt 2 prüfen wir die `dist/`-Chunk-Größen via Build-Output, um den Effekt zu bestätigen.

---

### Was passiert nach Approval

Ich setze **Schritt 1 (Terminal-Split)** komplett um, danach **Schritt 2 (LLM aus dem kritischen Pfad)**. Bevor ich Schritt 3 anfasse, melde ich mich kurz mit Zwischenstand und Bundle-Diff — du entscheidest, ob wir weitergehen oder pausieren.
