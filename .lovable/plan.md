## Ziele dieser Iteration

1. **`reroute` komplett aus dem Spiel entfernen** — Kommando, Sequenz, Flag, Dialoge, Tasten-Hinweise, Hilfetexte.
2. **Bug in `BurnSequence.tsx` fixen** (Effect bleibt nach erstem Step hängen → Spieler sitzt fest auf "HARDWARE-RESET").
3. **`burn` als bewussten Story-Pfad einbauen** — mit Confirm-Schritt, neuem Insa-Anruf, Mikael-Reaktion, Echo im Schluss-Anruf und im Abspann-Chatter.
4. **Frequenz-Lore etablieren:** 104,6 wird über den Knoten 5610 in Sektor E67 künstlich verstärkt und über die Antennenkonstruktion dort in die Nachbarsektoren (inkl. E71) eingestrahlt. Burn legt 104,6 in E67 und Umgebung dauerhaft tot.
5. **Nach burn ist 104,6 für den Spieler stumm** — im Radio-Panel hört Layard auf 104,6 nur noch Rauschen.
6. **Edge-Case-Schutz: burn löst Philippes Klopf-Event aus, falls noch nicht geschehen** — damit die Story-Eröffnung nicht verloren gehen kann.

## Bug-Fix BurnSequence

In `src/components/game/BurnSequence.tsx` hängt `useEffect` von `steps` ab, das bei jedem Render als neues Array-Literal entsteht → Effect läuft erneut → Cleanup canceled alle pending Timer → der `startedRef.current = true`-Guard verhindert den Restart. Resultat: nur die erste Zeile erscheint und `endBurnSequence()` feuert nie.

Fix: `steps`-Definition in `useMemo([burnSequence])` packen ODER `steps` aus der Dep-Liste entfernen. `rerouteSteps` fällt mit reroute komplett weg.

## reroute entfernen — vollständige Liste

- **`src/components/game/NodeTerminal.tsx`**
  - `if (raw === "reroute") { … }`-Block (Z. 281–313) löschen.
  - `rerouted`-Status (Z. 37, 41, 49) entfernen, Statuszeile vereinfachen.
  - `help`-Output: Zeile "reroute — Knoten in Echo-Schleife legen" raus (Z. 61).
  - Befehlsliste in Empty-State (Z. 208) und Footer-Hinweis (Z. 436): `"Befehle: tap | listen | burn | exit"`.
  - Im `burn`-Block den `if (flags.has("reroutedNode5610"))`-Pfad entfernen.
- **`src/components/game/BurnSequence.tsx`** — `rerouteSteps`-Array, `kind: "reroute"`-Branches und Variant-Switch entfernen. Datei nimmt nur noch `"burn"` an.
- **`src/game/GameContext.tsx`** — Typ `burnSequence: "burn" | "reroute" | null` → `boolean`. `playBurnSequence(kind)` → `playBurnSequence()` ohne Argument.
- **`src/game/types.ts`** — Flag `reroutedNode5610` entfernen, Signatur `playBurnSequence` aktualisieren.
- **`src/game/dialogs.ts`** — falls Beats existieren, die `reroutedNode5610` referenzieren, entfernen.
- **`src/components/game/CrtMatrixBackground.tsx`** — Zeile `"ROUTER567 -> reroute via E67"` bleibt als Hintergrund-Flavor unkritisch.

## Frequenz-Lore: drei Andockpunkte

1. **`tap`-Output in `NodeTerminal.tsx`** — Affekt-Telemetrie um zwei Zeilen am Ende ergänzen:
   ```
   ── SENDER-TOPOLOGIE ──
   Quelle:        Knoten 5610 (lokal aggregiert, gefiltert)
   Träger-Modulator: Antennenarray Dach-E67 → Streuung E67/E71
   Reichweite:    E67 (Vollabdeckung), E71 (Beistrahlung), Randabfall E68/E66
   ```

2. **Insas Pflicht-Dialog (`idPflicht2`–`idPflicht3`, dialogs.ts)** — neue Beat-Zeile dazwischen, gleiches Insa-Register:
   > „Was Sie auf 104,6 hören, kommt von dort. Aus 5610. Die Antenne auf dem Dach E67 streut es bis nach E71 hinüber — deshalb hören es die Patienten dort auch, obwohl sie es offiziell gar nicht dürfen. Es gibt keine zweite Quelle. Wenn der Knoten still ist, ist 104,6 still."

3. **`burn`-Confirm-Prompt im Terminal** — die Warnung benennt das ausdrücklich (siehe nächster Abschnitt).

## burn: neuer Flow im Knoten-Terminal

Zweistufig, mit klarer Konsequenz-Aussage. Kein Hinweis auf Layards eigenen Stream — nur die fremden Empfänger und die Reichweite.

**Erste Eingabe `burn`** zeigt nur die Warnung, keine Sequenz:
```
node-5610# burn
>> WARNUNG: Hardware-Reset zerstört den Knoten irreversibel.
>> 104,6 wird in E67 und Umgebung (E71 inklusive) dauerhaft stumm.
>> 412 Empfänger im Sektor verlieren das Schmerz-Radio.
>> Tippe 'burn confirm' zum Ausführen.
>> Tippe 'exit' zum Abbrechen.
```

**`burn confirm`** löst die Sequenz aus: setzt `burnedNode5610` und `crossLinkSevered`, triggert `playBurnSequence()`.

## Edge-Case: burn löst Philippes Klopfen aus, falls noch offen

**Problem:** Per `cheat 0002` kann der Knoten erreicht und burn ausgeführt werden, bevor `doorbellRang` gesetzt wurde. Da burn 104,6 dauerhaft stumm legt, wäre das Klopf-Event danach unerreichbar — die Story-Eröffnung würde fehlen.

**Lösung:** Im `burn confirm`-Handler in `NodeTerminal.tsx`, **nach** `setFlag("burnedNode5610")`, ein Recovery-Check:

```ts
if (!flags.has("doorbellRang")) {
  // Letzte Welle des Knotens reicht noch bis zur Wohnungstür durch.
  api.setFlag("doorbellRang");
  api.setFlag("metPhilippe");
  api.startDialog("philippeAtDoor");
  // (Layard kehrt nach dem Dialog automatisch in die Szene zurück.
  //  Der Insa-Callback nach burn löst danach regulär aus.)
}
```

Wichtig: Der Check liest den Flag **vor** dem `setFlag("burnedNode5610")`-Call, damit nichts doppelt feuert. Wenn `doorbellRang` schon gesetzt war (Standardweg), wird dieser Block übersprungen — kein Lore-Konflikt.

**Narrativ erklärt:** Die letzte Welle des sterbenden Knotens reicht noch bis zur Tür durch — Philippe spürt sie und steht plötzlich davor. Passt zur Lore (Knoten ist die Quelle, sein Tod ist sein letzter Ausschlag).

**Reihenfolge der Beats nach `burn confirm`:**
1. BurnSequence-Fullscreen läuft ab.
2. Wenn `doorbellRang` vorher fehlte: `philippeAtDoor`-Dialog wird angereiht.
3. Insa-Callback (`insaCallbackAfterBurn`) feuert wie bisher beim nächsten Telefonklick in der Wohnung.

## Nach burn: 104,6 ist stumm

In `src/components/game/RadioPanel.tsx`:

- Wenn `flags.has("burnedNode5610")` und `freq === 104.6`:
  - `setRadioActive(false)`, kein Resonanz-Aufbau (`bumpResonance(-100)`).
  - Doorbell-Trigger (Z. 144–185) wird übersprungen — er ist eh schon erledigt (entweder via Radio oder via burn-Recovery).
  - E71-Frequenzsperre (Z. 187–217) wird übersprungen — niemand kommt mehr, weil nichts mehr zu hören ist.
- UI-Anzeige auf 104,6: Band-Label wechselt auf `"— Rauschen —"`.
- Kein Drone-Loop mehr auf 104,6.

## Insa-Anruf nach burn — bewusste Wahl

`insaCallbackAfterBurn` in `dialogs.ts` umschreiben:

- Insa ist nicht wütend, sondern leise erschüttert.
- Erste Beat: „Ich höre 5610 nicht mehr. Niemand in E67 hört es noch. Was haben Sie da gemacht, Worag?"
- **Choice mit zwei Haltungen** (beide setzen `calledInsa2` + `calledForCode` → Sektor-Tür ist danach offen):
  - *„Ich habe es ausgeschaltet, weil es uns kaputtgemacht hat."* → `burnedAndOwned`. Insa: ernst, einverstanden. Code mit knapper Anerkennung.
  - *„Ich weiß es nicht. Ich war wütend."* → `burnedAndDodged`. Insa: ernüchtert, gibt Code trotzdem, kühler.

## Konsequenzen weiter hinten

**Mikael (`mikael*`-Dialoge in `dialogs.ts`, Zimmer 1534):** Bei `burnedNode5610` 1–2 zusätzliche Lines:
- Owned: „Sie haben den Knoten weggeschossen. Das war nicht klug — aber es war ehrlicher als alles, was ich heute hier gemacht habe."
- Dodged: „Sie haben ihn weggeschossen und wissen nicht warum. Das ist das Schlimmste daran."

**`insaAct2Return` (Schluss-Anruf):** Eine Zeile mit `requires: ["burnedNode5610"]`:
- Owned: „Der Sektor ist still. Das ist, was Sie wollten. Es ist trotzdem nicht weniger schwer."
- Dodged: „Der Sektor ist still. Niemand weiß, warum es Ihnen leichter geworden ist. Sie auch nicht."

**`Ending.tsx` Chatter:** Bei `burnedNode5610` wird der Chatter-Strom aus E67 dünner — Spawn-Rate für E67-Quellen halbiert, ~30 % der Zeilen erscheinen als zerhackt (»…« / leere Brackets). Andere Sektoren bleiben normal.

## Was unverändert bleibt

- `tap`-Pflicht-Pfad bleibt der Standardweg.
- Code-Mail (06.11.1997) und Sektor-Tür-Ablauf bleiben gleich.
- `cheat 0002` bleibt funktional (kein Eingriff nötig — der burn-Recovery-Check fängt den Edge Case ab).
- Kein Game-Over durch burn — es ist eine Färbung, kein Bad End.

## Geänderte Dateien (Übersicht)

1. `src/components/game/BurnSequence.tsx` — Bug-Fix, reroute-Variante raus
2. `src/components/game/NodeTerminal.tsx` — reroute-Block raus, `tap`-Telemetrie um Topologie ergänzt, `burn` zweistufig, burn-Confirm löst Philippe-Recovery aus
3. `src/components/game/RadioPanel.tsx` — 104,6 nach burn stumm, alle Trigger gating, Band-Label „— Rauschen —"
4. `src/components/game/Ending.tsx` — Chatter-Ausdünnung bei burnedNode5610
5. `src/game/GameContext.tsx` — `burnSequence`-Typ vereinfacht, `playBurnSequence()` ohne Argument
6. `src/game/types.ts` — Flag `reroutedNode5610` raus, neue Flags `burnedAndOwned` / `burnedAndDodged`
7. `src/game/dialogs.ts` — Frequenz-Lore-Beat in `idPflicht`, `insaCallbackAfterBurn` umschreiben mit Choice, Mikael-Beats, `insaAct2Return`-Beat