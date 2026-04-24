## Problem

Der `tap`-Befehl im Knoten-Terminal (5610) zeigt aktuell wörtliche Zitate von Bewohnern:

```
"… ich bin müde, aber das ist kein …"
"… B2 schmeckt nach gar nichts mehr …"
"… warum hat sie heute »Sie schon wieder« …"
"… ich habe ja gesagt. ich hätte nein sagen …"
"… der mann mit den grünen augen …"
```

Das widerspricht der etablierten Lore: **Das Schmerz-Radio überträgt nur Gefühle, keine Worte** (vgl. `Terminal.tsx`: „von 104,6 kommt kein wort dazu, nur das gefühl —"). Worte können dort prinzipiell nicht erscheinen.

## Lösung

Den `tap`-Output in `src/components/game/NodeTerminal.tsx` (Zeilen 251–268) durch eine **technische Roh-Telemetrie** des Affekt-Streams ersetzen — also genau das, was ein passiver Mithör-Port an einem Schmerz-Knoten realistisch ausspucken würde: demodulierte Messwerte, Kanal-Pegel, Affekt-Klassifikation, keine Sprache.

Diese Daten sind **nützlich für Insa**, weil sie ihr ein objektives Bild der Installation geben (Auslastung, Filterstufen, dominante Affektbänder im Sektor), ohne dass Layard die Privatsphäre einzelner Bewohner verletzt — und ohne Lore-Bruch.

### Neuer Output (Entwurf)

```
>> Öffne passiven Tap-Port …
>> Demoduliere 104,6 MHz (Roh-Stream) …
>> ─────────── AFFEKT-TELEMETRIE ──────────────
   Knoten:        5610  (Sektor E67, 412 Empfänger)
   Trägerpegel:    -18,2 dBm   stabil
   SNR:            27,4 dB
   Filter-Last:    87 %        (Soll: < 60 %)
   Kompressor:     3:1 → 6:1   (dyn. nachgeführt)
   ─── Affektbänder (gleitender Mittelwert, 60 s) ───
   Trauer          ████████████░░░░  74 %
   Erschöpfung     ██████████░░░░░░  62 %
   Scham           ███████░░░░░░░░░  41 %
   Wut (gedämpft)  ████░░░░░░░░░░░░  22 %
   Sehnsucht       ██░░░░░░░░░░░░░░  11 %
   ─── Quell-Signatur ───
   1 Sender dominiert den Mix zu 38 %.
   Signatur-Hash: 0x4E67·LAYARD·WORAG
>> ─── EINGANG: DAS BIST DU. GEFILTERT. ──
>> Tap geschlossen.
```

Die Schluss-Zeile „DAS BIST DU. GEFILTERT." bleibt erhalten — sie ist die emotionale Pointe und passt jetzt sogar besser, weil die Telemetrie Layards eigene Signatur als dominante Quelle ausweist.

### Was sich nicht ändert

- Befehlslogik, Flags (`tappedNode5610`), Knowledge (`radioOrigin`), Gating durch `burnedNode5610`.
- Die anderen Befehle (`listen`, `reroute`, `burn`).
- Timings/Beeps bleiben analog gestaltet.

## Technische Details

**Datei:** `src/components/game/NodeTerminal.tsx`
**Bereich:** `if (raw === "tap") { … }` — nur das `runScripted([...])`-Array (Zeilen 252–263) wird ersetzt. Callback und Flag-Logik unverändert.

Die Werte (Pegel, Prozente, Hash) werden als feste Strings hartcodiert — kein Bedarf für Zufall, der Output soll bei jedem Replay wiedererkennbar sein, außerdem ist `tap` ohnehin nur einmal pro Spieldurchlauf sinnvoll abrufbar.