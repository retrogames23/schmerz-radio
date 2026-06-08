## Ziel

Den verworrenen 4317/Rohrpost-Pfad zum Tür-Code durch eine klare, in einer bürokratischen Welt sofort einleuchtende Kausalkette ersetzen:

```
Insa  →  „Vossbeck gibt den Code, gehen Sie hin — aber sprechen Sie vorher mit Kowalk.“
Vossbeck  →  „Ohne Formblatt 17/V auf Vorsprache keine Audienz.“
Kowalk  →  „Formblätter hat nur Brust. Und Brust gibt sie nur an Satisfaktionsfähige.“
Brust  →  Drei Trainingsfälle (Duell I) → Formblatt 17/V.
Vossbeck  →  Endduell → Tür-Code.
```

Tilla Kowalks Verlegungs-Geschichte (Rohrpost an E70-K, Philippes alte 4317, Quittungs-Fälschung) bleibt erhalten, wird aber **vom Tür-Code entkoppelt** und in eine **freiwillige Nebenakte** überführt, die weiterhin Miras Akt-II-State speist. Die Fälschungs-Mechanik bleibt erhalten, wird aber **auf das Formblatt 17/V umgewidmet**: Wer das Duell scheut oder verliert, kann mit Kowalks Hilfe ein Formblatt fälschen.

## Neuer Hauptpfad — Schritt für Schritt

1. **Insa am Telefon (erster Code-Anruf):** Keine Erwähnung von Vorgang 4317, keine „Vorgangsblock auf Ihrer Adresse“-Erklärung mehr. Stattdessen: „Codes für Sektor-Türen vergibt nicht die Leitstelle, sondern Oberverwalter Vossbeck persönlich. Sein Büro: 3603, neben der Kantine. Insider-Tipp: gehen Sie nicht direkt rein. Sprechen Sie vorher mit Frau Kowalk, linker Tresen, Kantine 3602. Sie weiß, wie man bei Vossbeck reinkommt.“

2. **Vossbeck-Erstbesuch (3603):** Vossbeck schaut nicht auf. „Ohne Formblatt 17/V auf Vorsprache keine Audienz. Türschild lesen. Tür zu.“ — kurz, kalt, abweisend. Flag `vossbeckRefusedNoForm` gesetzt.

3. **Kowalk in 3602:** Erklärt die ungeschriebene Regel: Vossbeck hütet die Tür-Codes, aber er sieht nur, wer ein Formblatt 17/V vorlegt. Diese Formblätter verwaltet sein Stellvertreter Herr Brust — am rechten Tresen, drei Schritte weiter. Brust gibt sie nicht jedem; er prüft, ob der Vorsprecher „satisfaktionsfähig“ ist, also dem Oberverwalter standhalten kann. Wer das Phrasen-Duell mit Brust besteht, kriegt das Formblatt. — Optionaler Zusatz-Tipp: „Sollten Sie bei Brust durchfallen, kommen Sie wieder zu mir. Ich kenne einen anderen Weg.“ (Hook für Fälschungspfad.)

4. **Brust + Duell I (Training A/B/C):** Bleibt mechanisch erhalten. Reward ändert sich: statt verbaler Weiterleitung („Tür 3603, klopfen Sie nicht“) händigt Brust am Ende ein **physisches Inventar-Item** aus — `formblatt17V` (Formblatt 17/V auf Vorsprache, gegengezeichnet Brust). Brusts letzte Zeile bleibt im Ton, nennt aber explizit das Formblatt: „Drei in Folge. Hier — Formblatt Siebzehn-V, gegengezeichnet. Vossbeck sitzt nebenan. Sie kennen den Weg. Klopfen Sie trotzdem.“

5. **Vossbeck zweites Gespräch (mit Formblatt):** Vossbeck nimmt das Formblatt entgegen. Endduell wie bisher. Bei Sieg gibt er den **Tür-Code direkt heraus** (kein Insa-Rückruf mehr nötig) — bzw. lehnt den Code-Antrag ab, wenn man verliert (drei Versuche wie bisher).

6. **Insa-Rückruf entfällt für den Code:** `idCode4` … `idCode7` werden umgebaut: der Code-Ausgabe-Block wandert von Insa zu Vossbeck. Insa bleibt die Anlaufstelle für die *Information*, dass Vossbeck zuständig ist, und für die Bram-Burn-Sequenz.

## Tilla als optionale Nebenakte

- Kowalks „kQuest“-Choices (4317-K, Tilla, Marteau, Pneumatik) bleiben erreichbar, aber **nicht mehr gegated durch den Tür-Code-Bedarf**. Stattdessen freigeschaltet, sobald `metKowalk` gesetzt ist und Layard nach Tilla oder „der Stelle hinterm Tresen“ fragt (eigene Einstiegs-Choice „Wer ist Tilla?“ statt „Vorgang 4317“).
- Belohnung der Nebenakte: Mira-State wie bisher (`receivedTillaTransfer` → `getMiraEndState`-Effekte in Akt II). Kein Tür-Code, kein Pflicht-Charakter.
- Die Bedingung „4317 muss von Vossbeck freigegeben sein, damit E70-K die 4317-K annimmt“ entfällt — Kowalk schickt direkt los, ODER der Spieler nutzt weiterhin den Fälschungspfad (für den emotional konsequenteren Bogen mit Philippe). Beide Wege bleiben spielbar, getrennt voneinander.

## Fälschungs-Mechanik umgewidmet

- Kowalks `kForge`-Pfad bleibt strukturell erhalten, **fälscht aber jetzt das Formblatt 17/V**, nicht eine Quittung. Item-Resultat: `formblatt17VForged`.
- Trigger: Layard hat das Duell bei Brust dreimal nicht durchziehen wollen oder verloren (Flag `brustDuelFailedOrSkipped`) **oder** spricht Kowalk aktiv darauf an („Brust gibt mir nichts. Gibt es einen anderen Weg?“).
- Zutaten passen sich an: Bleistiftstummel (bleibt), Quittungsblanko → **Formblatt-Blanko** (neu, liegt in Brusts Tresen-Schublade als Look-Hotspot, klaubar wenn Brust kurz abgelenkt ist), Trockensiegel-Abdruck Schicht A von Philippes alter Vollmacht (bleibt).
- Vossbeck akzeptiert das gefälschte Formblatt zur Audienz — merkt aber während des Endduells ggf. an, dass „das Kürzel auf Ihrem Formblatt sieht aus wie meins von vor zwei Jahren“ (kleine Eskalation, kein Game-Over). Der Tilla-Strang bleibt davon entkoppelt: Philippes 4317-Vollmacht wird beim Siegelabdruck nicht verbraucht.

## Betroffene Dateien (Code-Ebene)

```
src/game/dialogs/insa.ts
  ├─ idCode1..7 umschreiben: kein Vorgangsblock, kein 4317-Hinweis,
  │  kein Kowalk-Block-Hinweis. Stattdessen: Verweis auf Vossbeck +
  │  Insider-Tipp Kowalk.
  ├─ Doppelung in idCode-Pfad B raus.
  └─ Burn-Anruf (idCallAfterBurn…): Code-Ausgabe-Pfad entfernen oder
     auf „Vossbeck hat Ihnen den Code doch gegeben, oder?“ umschreiben.

src/game/dialogs/cafeteria.ts
  ├─ cafeteriaKowalk Einstiegs-Choices neu sortieren:
  │   • Hauptpfad-Choice „Vossbeck — wie komme ich da rein?“  → Brust/Formblatt-Erklärung
  │   • Nebenakte-Choice „Wer ist Tilla?“ → bestehender k-Strang, aber entkoppelt
  │   • Fälschungs-Choice „Brust gibt mir nichts.“ → kForge-Pfad (Formblatt-Fälschung)
  ├─ kPath/kQuest/kForge: 4317-Texte umschreiben, Item-Erzeugung
  │  von quittungForged4317 → formblatt17VForged (für Fälschungspfad).
  └─ Gating (`receivedTillaTransfer`, `forgedQuittung4317`) auf
     Mira-State-Pfad beschränken; aus Tür-Code-Pfad entfernen.

src/game/dialogs/bureaucracyDuel.ts
  ├─ Brusts Outro (cafeteriaTrainingC-Sieg) händigt formblatt17V als
  │  Item aus, statt nur „Tür 3603, klopfen Sie nicht“ zu sagen.
  ├─ vossbeckUnready/vossbeckNoBusiness: Texte neu — „kein Formblatt“
  │  statt „nicht satisfaktionsfähig“.
  └─ vossbeckDuel: Bei Sieg gibt Vossbeck den Tür-Code direkt heraus
     (showText + setFlag) statt nur „4317 freigegeben“.

src/game/scenes/kantinenverwaltung3603.ts
  └─ vossbeckSpot.onUse: Eingangsprüfung jetzt
     `api.hasItem("formblatt17V") || api.hasItem("formblatt17VForged")`
     statt `vossbeckSummoned`-Flag. Ohne Formblatt → vossbeckNoBusiness.

src/components/game/PneumaticTubeOverlay.tsx
  └─ Bleibt funktional erhalten (für Tilla-Nebenakte), aber kein
     Tür-Code-Gating mehr daran hängen. Texte unverändert.

src/game/scenes/communalE67.ts
  └─ Brusts Tresen erhält neuen Look-Hotspot „Formblatt-Schublade“
     für den Fälschungspfad (Blanko klauen, wenn Brust abgelenkt).

src/game/types.ts (Items / Flags)
  ├─ Neue Items: formblatt17V, formblatt17VForged, formblatt17VBlank
  └─ Neue Flags: vossbeckRefusedNoForm, brustDuelFailedOrSkipped
     Alte Flags belassen, wo sie die Tilla-Nebenakte/Mira-State steuern.

src/game/hints.ts + LORE.md
  └─ Hint-Reihenfolge und Akt-I-Beschreibung an neuen Pfad anpassen.
```

## Was bleibt unverändert

- Mechanik des Duells (Phrasen, Konter, Lernen aus Fehlern, drei Trainings + Endduell).
- Brusts und Vossbecks Charakterstimmen, Vossbecks Bleistift-Geste.
- Pneumatik-Rohrpost-Overlay und Tillas emotionaler Bogen.
- Akt-II-Bridge (Miras State, Insa-Wiederbesuch in der Leitstelle).
- Bram-Burn-Sequenz und Insas Rolle als Vermittlerin / Trösterin.

## Offene Designfragen für später

- Wie heißt das Formblatt offiziell („17/V“ ist Platzhalter — alternativ „Vorsprache-Schein VS-3“ oder „Audienzantrag AA-67“).
- Soll Vossbeck im Endduell sichtbar reagieren, wenn das Formblatt gefälscht ist (zusätzliche Konter-Linie), oder bleibt das eine reine kosmetische Anmerkung ohne mechanischen Effekt.
