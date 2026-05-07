# Mira-Strang ausbauen — Akt-I-Ausgang & Akt-II-Helferpfade

## Kernidee

Akt I endet mit drei klar lesbaren Mira-States. In Akt II hat jeder State einen eigenen Lösungsweg für die Pflichträtsel; alle Rätsel bleiben in jedem State lösbar. Wer sich gegen Mira gestellt hat, kann **Vossbeck** als unwahrscheinlichen Verbündeten gewinnen — mit Preis. Layard darf jederzeit umschwenken: auch im skeptischen Pfad steht der Weg zurück zu Mira offen, solange er sie überhaupt findet.

---

## 1) Drei Mira-States am Akt-I-Ende

Berechnet beim Übergang `act2Started` aus vorhandenen Akt-I-Flags und persistiert als ein einziges Flag (`miraEndFriendly` / `miraEndNeutral` / `miraEndSkeptical`):

| State | Bedingung |
|---|---|
| **friendly** | `miraSentAnger` (Verstärker geliefert, gemeinsame Sendung) |
| **neutral** | Alles dazwischen — inklusive „nie mit Mira gesprochen" und „Flugblatt abgelehnt, aber nicht abweisend" |
| **skeptical** | `miraSystemic` **oder** `miraTrustWithheld` (Layard hat Mira aktiv abgewiesen oder die Vertrauensprobe verloren) |

Spiegel im Brücken-Cutscene-Beat (eine zusätzliche Tafel, kein neues Asset):
- friendly: Tür 4601 angelehnt, Schlüssel + Zettel.
- neutral: 4601 verschlossen, durchgestrichenes Ohr aus Papier unter der Tür.
- skeptical: Aushang „WOHNUNG GERÄUMT — TRANSFER E91"; Layard glaubt es nicht.

**Rückkehr-Option:** Auch im `skeptical`-Pfad bleibt die Tür 4601 später erreichbar, wenn Layard hartnäckig ist (siehe Rätsel B-Pfad „Mira nachträglich finden"). Der State wird dann auf `neutral` zurückgesetzt — `friendly` ist ohne Akt-I-Sendung nicht mehr erreichbar.

---

## 2) Akt-II-Pflichträtsel mit drei Lösungswegen

### Rätsel A — „Quittung Schicht C"

Vossbeck verlangt für die endgültige Freigabe von Vorgang 4317 eine Schicht-C-Quittung mit Stempel **und** Funkbestätigung von außerhalb von E67.

| State | Lösungsweg |
|---|---|
| friendly | Mira sendet die Bestätigung von ihrem Piratensender. Layard liefert nur das leere Funkprotokoll. |
| neutral | Mira hilft gegen Vorleistung — Layard muss vorher Bodos Wartungs-Funk wieder aktivieren (Item-Combine, kleiner Umweg). |
| skeptical | Vossbeck stellt einen §-99-Selbst-Generalvorbehalt aus. Formal lückenlos, macht Vossbeck aber erpressbar — und er erinnert Layard daran (relevant in Rätsel C). |

Ergebnis-Item ist in allen Fällen `quittungSchichtC`.

### Rätsel B — „Archiv 5710"

Layard muss in das Akten-Archiv 5710, in dem die Original-Vollmacht liegt.

| State | Lösungsweg |
|---|---|
| friendly | Mira gibt einen Wartungs-Bypass-Code (sie war heimlich auf 57 unterwegs). |
| neutral | Layard beantragt eine neue Wartungskarte über Bodo — länger, kein Mira-Kontakt nötig. |
| skeptical | Vossbeck schließt persönlich auf (Generalschlüssel). Nebenwirkung: Vossbeck merkt sich, was Layard sucht. |

**Mira nachträglich finden (skeptical → neutral):** Statt Vossbeck kann Layard auf 57 einen Hinweis aufschnappen, der ihn zurück zu 4601 führt — Mira ist doch da, der Aushang war fingiert. Sie hilft dann auf dem `neutral`-Niveau (Bypass-Code gegen kleine Vorleistung). State flipt auf `neutral`. Dieser Pfad ist absichtlich versteckt — wer ihn übersieht, läuft sauber den Vossbeck-Pfad zu Ende.

### Rätsel C — Endspiel-Hebel (grobe Skizze)

**Setup.** Layard steht mit Vollmacht (4317) und Quittung (Schicht C) vor der finalen Einreichung. Die Frage ist nicht mehr, *ob* Philippe seine B3-Ration kriegt, sondern **mit welcher Wirkung** der Vorgang öffentlich wird. Drei Bühnen, drei Kosten:

**friendly — „Live-Schaltung"**
- Layard reicht den Vorgang in der Leitstelle E67 ein, während Mira parallel von 4601 aus auf 104,0 sendet: Wut + Trauer überlagert. Insa hört es im selben Moment, in dem sie unterschreiben soll.
- Mechanik: Layard öffnet das Schmerz-Radio, hält die Frequenz wie beim Verstärker-Rätsel; nach erfolgreicher Sendung wird der Einreich-Knopf in der Leitstelle freigegeben.
- Kosten: Mira riskiert, dass ihr Sender geortet wird. Im Ending: Mira ist „verlegt" worden, Layard kennt ihre neue Etage nicht.
- Wirkung: Lautes Ende. Andere Bewohner drehen das Radio leiser; die Verwaltung muss reagieren.

**neutral — „Saubere Akte"**
- Layard reicht den Vorgang nüchtern ein. Kein Funk, kein Skandal. Insa nickt, ablegen, fertig.
- Mechanik: Einfacher Klick auf den Einreich-Hotspot in der Leitstelle, sobald Quittung + Vollmacht beide im Inventar sind.
- Kosten: keine sichtbaren. Im Ending: niemand außer Philippe merkt, was passiert ist.
- Wirkung: Ein Mensch gerettet, das System unverändert.

**skeptical — „Vossbecks Preis"**
- Vor der Einreichung steht Vossbeck mit einem zweiten Vorgang im Korridor: **Brust 2904 — Versetzung in den Lärm-Quadranten**. Vossbecks Bedingung für den §-99-Hebel aus Rätsel A: Layard zeichnet beide Vorgänge gleichzeitig gegen.
- Mechanik: Im finalen Einreich-Overlay liegen zwei Mappen vor Layard. Erst wenn er beide stempelt, wird die Vollmacht 4317 wirksam. Brust nicht zu unterschreiben heißt: Vollmacht zerfällt.
- **Letzte-Chance-Weiche:** Wer 4601 nochmal aufsucht *und* dort jetzt jemanden antrifft (siehe Rätsel B Mira-Nachzug), kann statt Vossbecks Doppel-Stempel den `neutral`-Weg wählen. Vossbeck ist beleidigt — kein Schaden für Layard, aber Brust bleibt im Lärm-Quadranten verschont und Vossbecks §-99-Erlass wird zurückgezogen, was eine alternative Quittung verlangt (kurzer Umweg über Bodo, derselbe wie im neutralen Rätsel A).
- Kosten: Brust fällt — oder Layard zieht den Schwanz ein und macht es leise.
- Wirkung: Stärkstes moralisches Ending. Im Outro spielt eine kurze Tafel mit Brust am neuen Arbeitsplatz; Layard hört sie aus der Ferne im Radio.

**Ending-Tafeln.** Die bestehende `Ending.tsx` bekommt drei Varianten an die Akt-II-Outro angehängt — keine neue Engine, nur drei zusätzliche Beat-Sets im Stil von `ACT2_BRIDGE_BEATS`.

---

## 3) Vossbeck als Akt-II-Persona

Nach Sieg im Bürokratie-Duell wird `vossbeckAvailableAct2` gesetzt. Hinterzimmer 3603 reagiert dann je nach Mira-State unterschiedlich:

- friendly: kühl-respektvoll, hilft nicht aktiv.
- neutral: pragmatisch, Tipps gegen kleine Gefälligkeiten.
- skeptical: aktiv hilfsbereit — verlangt im Finale die Brust-Mappe.

Neue Datei `src/game/dialogs/vossbeckAct2.ts`, Persona-Eintrag in `npcPersonas.ts` erweitert.

---

## 4) Lösbarkeit & Hints

- Jedes Pflichträtsel hat zwei garantierte Wege: Mira-Pfad **und** Eigen-/Vossbeck-Pfad. Der „Mira-nachträglich"-Pfad ist Bonus, kein Pflichtweg.
- `src/game/hints.ts` bekommt drei Akt-II-Hint-Quests: `act2.miraHelp`, `act2.vossbeckHelp`, `act2.solitary` — sichtbar je nach State.

---

## 5) Umsetzungs-Phasen

1. State-Verfestigung + Brücken-Spiegel-Beat (klein, sofort lesbarer Effekt).
2. Vossbeck Akt II (mittel, neue Dialog-Datei, kein neues Asset).
3. Rätsel A (Quittung Schicht C) inkl. drei Wege.
4. Rätsel B (Archiv 5710) inkl. „Mira nachträglich"-Bonus-Weg.
5. Rätsel C inkl. drei Ending-Tafeln.

Phasen 1+2 lohnen sich auch isoliert, weil sie Akt II sofort persönlicher machen.