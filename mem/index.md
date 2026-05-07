# Project Memory

## Core
Bei allen neuen Inhalten i18n-freundlich arbeiten: narrative Strings nie in JSX hardcoden, sondern in Daten-Module unter `src/game/` legen (dialogs.ts, cutscenes.ts, netHosts.ts, scenes.ts, helpTopics.ts, etc.). UI-Labels in `*_UI_TEXT`-Konstanten auslagern. Keine String-Konkatenation — ganze Sätze mit `{platzhalter}`.
Dialoge und Spieltexte immer im Präsens formulieren, nicht Präteritum ("hatte", "war", "ging").

## Memories
- [i18n-Freundlichkeit](mem://preferences/i18n-readiness) — Regeln für neue Inhalte: wo Strings hingehören, was zu vermeiden ist, Vorbild-Module
- [Präsens statt Präteritum](mem://preferences/tense) — Dialoge im Präsens halten
