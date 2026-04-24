## Ziel

Der Serverraum 5610 wird zur **Pflichtstation** für den Übergang in Akt II. `burn` und `reroute` beenden das Spiel **nicht mehr**, sondern lösen eine dramatische, zustandsverändernde Sequenz aus — danach geht das Spiel weiter. Alle Dialoge werden auf die neue Schmerz-Radio-Lore (freiwillig, „wer empfängt sendet auch", keine Regierungseinrichtung; 5610 = illegale Cross-Sektor-Antenne E67↔E71) konsistent geprüft.

---

## Story-Logik (kurz)

- **Schmerz-Radio**: freiwilliges Konsumgerät. Menschen hören es, um verlorene Gefühle zu spüren. Wer empfängt, sendet (unbewusst) auch. Es ist **keine staatliche Einrichtung**.
- **Knoten 5610**: illegale Hochleistungs-Antenne, die den Sektor E67 mit E71 verkoppelt. Jemand betreibt sie — wir wissen zunächst nicht, wer. Erst durch `tap` versteht Layard: „Das Eingangssignal **bist du** — gefiltert."
- **Pflicht-Pfad**: Insa gibt den Sektor-Code **nicht** mehr direkt heraus. Sie verlangt erst einen „Sicherheits-Vermerk" aus 5610. Layard muss `tap` ausführen → Erkenntnis `radioOrigin` → Insa rückt den Code raus.
- **`burn` / `reroute`**: optionale Sabotage-Aktionen, narrativ wirksam, **kein Game Over** in Akt I/II. Stattdessen: visuelle Burn-Sequenz + persistente Korridor-Atmosphäre + späterer Insa-Rückruf.

---

## Pflicht-Pfad zum Code (Variante 1, hart)

```text
Insa-Anruf #2 (insa2)
  └─ Layard fragt nach Code
      ├─ ohne radioOrigin  →  „Erst Sicherheits-Vermerk aus Knoten 5610.
      │                         Korridor 56, Wartungstür. Tippen Sie 'tap'.
      │                         Rufen Sie mich danach an." 
      │                         [setzt Flag insaSentTo5610]
      │                         → Dialog endet ohne Code-Mail
      │
      └─ mit radioOrigin   →  bisheriger Pfad (Code-Mail im Terminal)
```

Konsequenzen:
- Tür 5610 wird in Korridor 56 sichtbar, sobald `insaSentTo5610` ODER bestehende Bedingungen (Mira/Philippe-Sonden) erfüllt sind. Mira bleibt der „weiche" Erstkontakt, Insa ist der harte Pflicht-Trigger.
- Das Wartungsmuster `wartungsnotiz5610` (7-0-Pause-3-2) wird Layard zusätzlich von Insa „nebenbei" durchgegeben, falls er die 3-Sonden-Schwelle bei Philippe nicht erreicht hat — sonst wäre der Pflicht-Pfad blockierbar. Alternativ: Insa diktiert ihm den Code direkt am Telefon.

---

## `burn` und `reroute` — kein Ende mehr

Beide Aktionen lösen eine **fullscreen Burn-Sequenz** aus (neues Component `BurnSequence.tsx`), aber **rufen `api.setEnding()` nicht mehr auf**. Stattdessen:

| Aktion | Visuelle Sequenz | Persistente Folge |
|---|---|---|
| `reroute` | Kurze technische Kaskade, blasses Amber, Stille danach | Flag `crossLinkSevered`. Korridor 56 wirkt unverändert. `listen` zeigt nur noch Eigen-Echo. |
| `burn` | Rotes Flackern, Alarm-Pieps, Schrift „104,6 — KEIN TRÄGER", harter Cut, dann Stille | Flags `burnedNode5610` + `crossLinkSevered`. Korridor 56 bekommt CSS-Klasse `corridor-emergency-power` (gedimmt, leichter Rotstich). Insa ruft beim nächsten Korridor-Betreten zurück (siehe unten). |

Die Flags `endingSilent` und `endingSabotage` werden **entfernt** (aus `types.ts` und `Ending.tsx`). Die `Ending`-Komponente nutzt nur noch `FRAMES_BASE` (+ optional `FRAMES_FLYER_EXTRA`). Das Akt-II-Ende bleibt unverändert über `insaAct2Return.onEnd`.

### Insa-Rückruf nach `burn`/`reroute`

Neuer Dialog `insaCallbackAfterBurn` (oder zwei Varianten):
- Wird beim nächsten Eintritt in `corridor56` oder `apartment` getriggert, sobald `burnedNode5610` gesetzt und `insaCallbackBurnDone` nicht.
- Insa fragt knapp und kontrolliert nach. Sie weiß, dass etwas passiert ist. Sie sagt **nicht**, dass das Spiel vorbei ist. Sie sagt: „Kommen Sie trotzdem. Der Code steht in der Mail."
- Setzt `insaCallbackBurnDone`. Spiel läuft normal weiter.

---

## Dialog-Audit: Konsistenz mit der neuen Lore

Geprüft und ggf. angepasst — jeweils mit kurzer Begründung. Vollständige Stellen werden während der Umsetzung 1:1 verifiziert.

| Stelle | Aktueller Stand | Anpassung |
|---|---|---|
| `dialogs.miraOpen1` (Z. 1513) | „warum 104,6 deinen Schmerz lindert" | OK — passt: lindern statt heilen, freiwilliger Konsum. |
| `dialogs.ma3` (Z. 1772) | „Da läuft **euer** Schmerz-Radio durch […] die wird **euch geschickt**" | **Anpassen**: „die wird euch geschickt" klingt nach zentraler Sender-Instanz. Neu: „Da läuft **dein eigenes** Schmerz-Radio durch — bevor es **zu jemand anderem geht**. 104,6 hörst du nicht selbst — du **bist** sie, gefiltert." |
| `dialogs.ma4` | „du hörst, woher die Sendung wirklich kommt" | **Leicht anpassen**: „… woher die Sendung wirklich kommt — und wohin sie geht." (E71-Hinweis, ohne ihn auszubuchstabieren) |
| `dialogs.bf5` (Bodo, Carrier-Wahrheit, Z. 2438) | „Trägersignal von 104,6 … seit 1991 manuell nachgeregelt" | OK, aber **eine Zeile ergänzen**: „Wer den Träger dreht, ist nicht die Stadt. Das war sie nie." → entkoppelt von „Regierung". |
| `dialogs.b7` (Bodo, Z. 2270) | „Funkanlagen. Trägersignale. Verstärker." | OK. |
| `dialogs.philippeTalk pt1` (Z. 1923) | „Wie gehen Sie mit dem Schmerz-Radio um? Konkret. Wie viele Stunden am Tag?" | OK — passt zu „freiwilliges Konsumgerät". |
| Insa `x6c` (Z. 675) | „Heute könnten Sie." | OK. |
| `tap`-Output (`NodeTerminal`, Z. 239) | „EINGANG: DAS BIST DU. GEFILTERT." | OK — Kernsatz der Lore, bleibt. |
| `tap`-Snippets (Z. 234–238) | Fünf Pseudo-Empfangsfetzen | OK — sie sollen wie Layards eigene innere Stimme klingen; bleiben unverändert. |
| Akt-II-Ending-Texte (`Ending.tsx`) | Sabotage/Silent-Varianten | **Entfernen** (s. o.). Nur Base-Variante bleibt. |
| Korridor-56-Decals nach `burn` | nicht vorhanden | **Neu**: CSS-Klasse `corridor-emergency-power` auf der Szene. Leichter Rotstich + Dimmen. |

Keine Anpassung notwendig:
- Sektor-Chatter (E71-Beimischung wurde im vorigen Schritt bereits eingebaut).
- Helka/Ennis-Türgespräche (kein Schmerz-Radio-Erklärtext).

---

## Technische Änderungen (für Implementierung)

**`src/game/types.ts`**
- Entfernen: `endingSilent`, `endingSabotage`.
- Hinzufügen: `insaSentTo5610`, `crossLinkSevered`, `insaCallbackBurnDone`.

**`src/game/dialogs.ts`**
- `insa2` (~Z. 599): neuer Verzweigungspfad bei „Lassen wir das. Geben Sie mir bitte direkt den Code.": prüft `hasKnowledge("radioOrigin")`. Ohne → neue Lines `x5pflicht1..3` (Insa erklärt Knoten 5610, setzt `insaSentTo5610`, beendet Dialog **ohne** `x7`-Mail). Mit → bisheriger Pfad bleibt erhalten.
- Analog in `insa1`-Zweig `idCode4` (~Z. 549): gleiche Verzweigung, damit auch der erste Code-Versuch konsistent ist.
- `dialogs.miraOpen` Lines `ma3`/`ma4`: Texte wie oben angepasst.
- Neuer Dialog `insaCallbackAfterBurn` mit kurzem Triggertext + Code-Mail-Auslieferung.
- `insaAct2Return.onEnd` bleibt — nur dieser Pfad triggert weiterhin `setEnding()`.

**`src/components/game/NodeTerminal.tsx`**
- `reroute`-Handler: ersetzt `api.setFlag("endingSilent")` durch `api.setFlag("crossLinkSevered")` und `triggerBurnSequence("reroute")`.
- `burn`-Handler (beide Pfade): ersetzt `api.setFlag("endingSabotage")` durch `api.setFlag("crossLinkSevered")` und `triggerBurnSequence("burn")`.
- Kein `setEnding()`-Aufruf mehr.

**`src/components/game/BurnSequence.tsx`** (neu)
- Fullscreen-Overlay, ~3–5 s, zwei Varianten (`burn` rot/laut, `reroute` amber/leise).
- Steuert sich über neuen GameContext-State `burnSequence: "burn" | "reroute" | null`.

**`src/game/GameContext.tsx`**
- Neuer State `burnSequence` + Setter, in `GameApi` als `playBurnSequence(kind)` exponiert.
- Trigger-Hook: nach Szenenwechsel zu `corridor56`/`apartment` mit `burnedNode5610 && !insaCallbackBurnDone` → `startDialog("insaCallbackAfterBurn")`.

**`src/components/game/Ending.tsx`**
- `silent`/`sabotage`-Verzweigung und ihre Frames-Arrays entfernen. Nur noch Base + optional Flyer.

**`src/styles.css`**
- Neue Klasse `.corridor-emergency-power` (gedimmter Rotstich, leichtes Flackern).

**`src/game/scenes.ts`**
- `corridor56`: Klasse `corridor-emergency-power` aktiv, wenn `burnedNode5610`. Tür 5610 zusätzlich sichtbar bei `insaSentTo5610`.

**`src/game/sectorChatter.ts`**
- Nach `crossLinkSevered`: `listen` zeigt nur noch E67-internen Verkehr (E71-Anteile filtern). Optional in einem späteren Schritt.

---

## Was bewusst **nicht** geändert wird

- Akt-II-Ending-Logik in `insaAct2Return` — bleibt einziger Endpunkt.
- Das visuelle Layout des `NodeTerminal` selbst.
- Speicherformat (neue Flags sind einfach zusätzliche StoryFlags).
- Bestehende Sichtbarkeitsregeln für Tür 5610 (Mira-/Philippe-Pfade bleiben als „weiche" Vor-Trigger erhalten — der Insa-Pfad ist additiv).
