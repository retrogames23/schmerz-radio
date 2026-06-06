---
name: World-Info-Layer (SillyTavern-inspiriert)
description: Keyword-getriggerter Lore-Block, der pro Master-Wende vor dem dynamischen State-Block injiziert wird; Geo-Sanity ist constant, Städte und Götter sind selective.
type: feature
---

`src/game/dsa/lore/worldInfo.ts` — `selectActiveWorldInfo({ recentMessages, extraScanText, depth?, tokenBudget? })`.

- **constant**: `geo.sanity` (Trollzacken-NE, Greifenfurt-NW, Reisezeiten in Wochen, keine Bahnen) — IMMER drin.
- **selective city.\***: Gareth, Punin, Greifenfurt, Festum, Khunchom, Al'Anfa, Thorwal, Vinsalt, Maraskan — Trigger via Stadtname/Adjektivform.
- **selective god.\***: alle 12 Götter — Trigger via Gottesname.
- Scan-Tiefe Default 6 letzte Nachrichten, Token-Budget 600.
- Eingespielt im Tail VOR `[SYSTEM-STATUS]`, also nach jeder History-Wende neu — kein Prompt-Cache-Bruch (statischer Block bleibt unverändert).

Wiring: beide Master-Routes (`dsa-master.ts`, `dsa-group.ts`) bauen den Block direkt vor `callMaster` und reichen ihn als 7. Argument durch. `callMaster` loggt zusätzlich `[dsa-cost] turn-prep` mit den Zeichenanteilen (staticLore/worldInfo/dynamicState/history) für die spätere Token-Diät.

Erweitern: neue Einträge in `ALL_ENTRIES` aufnehmen. Keywords case-insensitive Substring-Match — keine Regex. Höhere `priority` setzt sich bei knappem Budget durch.