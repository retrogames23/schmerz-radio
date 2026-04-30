---
name: i18n-Freundlichkeit bei neuen Inhalten
description: Neue narrative/UI-Strings müssen i18n-freundlich sein — keine Hardcodes in JSX
type: preference
---
Bei ALLEN neuen Inhalten (Dialoge, Cutscene-Texte, Terminal-Output, UI-Labels, Item-Beschreibungen, NPC-Texte, Help-Topics, etc.) auf i18n-Freundlichkeit achten:

**Regel:**
- Narrative Strings NICHT direkt in JSX/Komponenten hardcoden.
- Stattdessen in die zentralen Daten-Module unter `src/game/` legen:
  - Dialoge → `src/game/dialogs.ts`
  - Cutscene-Texte → `src/game/cutscenes.ts`
  - Terminal/Hosts → `src/game/netHosts.ts`
  - Szenen/Hotspot-Beschreibungen → `src/game/scenes.ts`
  - Hilfe-Themen → `src/game/helpTopics.ts`
  - Handbook → `src/game/e67Handbook.ts`
  - Filesystems → `src/game/filesystem*.ts`
- UI-Labels einer Komponente, die später übersetzt werden müssen, in eine `*_UI_TEXT`-Konstante am Dateianfang oder in ein Daten-Modul auslagern (Vorbild: `ENDING_UI_TEXT` in `cutscenes.ts`).
- Strings als ganze Sätze/Phrasen — KEIN String-Concat aus Fragmenten. Stattdessen Template wie `"Du siehst {name} an"`.
- Pluralformen, Genus und Satzbau-Annahmen vermeiden, wo möglich.

**Why:** Vollständige EN-Übersetzung ist für 1.0 geplant. Jeder neue Hardcode-String wird sonst später teurer Refactor-Aufwand.

**How to apply:** Vor jeder neuen Komponente/jedem neuen Feature kurz prüfen, wo Strings entstehen, und sie ins passende Daten-Modul legen. Wenn unklar wo: lieber neues Modul `src/game/<feature>.ts` anlegen als in JSX hardcoden.
