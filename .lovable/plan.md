# Akt II · Eröffnung — „Die Akte 1978"

## Korrektur zu Punkt 1: Leitstelle in einen freien Raum auf 4

Aufzug bleibt unangetastet. Korridor 46 hat **Tür 4602** und **Tür 4603** ohne Inhalt — wir setzen die **Leitstelle E67** hinter Tür **4602** (gleicher Korridor wie Mira, schöner Kontrast: zwei Pole desselben Flurs). Spieler kommt regulär: Aufzug → 4 → Korridor 46 → Tür 4602.

Vorteil: Keine neue Etage, kein neuer Aufzug-Knopf, kein neues Asset für die Aufzug-Anzeige. Nur **eine** neue Szene `leitstelleE67` mit einem neuen Hintergrundbild.

## Korrektur zu Punkt 2: Was Layard wirklich antreibt

„Quittung Schicht C zu Frau Kowalk tragen" ist Akt I in einer anderen Etage. Wir greifen den Plan vom 02.05. (`C+D+E`) wieder auf:

- **C** Insas „Anliegen" als Türöffner
- **D** Resonanz-Pause als innerer Druck (existiert bereits via `radioOnPause`)
- **E** Eine konkrete Person, an der Layard die Verantwortungslosigkeit zum ersten Mal *sieht*
- plus die **Marteau-Spur** als Layards *eigene* Frage

Layards Ziel ab Akt II ist also nicht „Botengang erledigen", sondern eine Doppelfrage:

> **„Warum fühle ich, wie ich fühle — und warum macht das Sektor 28 zu einem medizinischen Problem statt zu einer Frage?"**

Die offizielle Antwort lautet „Resonanz-Hygiene, sieben Tage Pause". Layards eigene Antwort entsteht aus dem, was Insa ihm in dieser Szene unter den Tisch schiebt: einer **Akte aus dem Jahr 1978**.

## Die Eröffnungs-Szene Schritt für Schritt

### 1. Wohnung 2611 — kurzer Wiedereinstieg

Akt-II-Intro-Zeile (eine, je Mira-State leicht eingefärbt). Keine neuen Hotspots. Auf dem Tisch liegt **kein** Botengang-Vordruck — stattdessen ein einzelner Satz im Intro: „Insa hat gesagt: vorbeikommen, wenn du wach bist. 4602."

### 2. Korridor 46 → Tür 4602

Die bislang stumme Tür 4602 bekommt jetzt ein Schild „**Leitstelle E67 · Disposition · Zutritt nur mit Anliegen**" und führt in die neue Szene. Vorher bleibt sie unverändert stumm.

### 3. Neue Szene `leitstelleE67`

**Background:** `scene-leitstelle-e67.jpg` im Stil der bestehenden Korridorbilder (1990er-Behörde, Linoleum, Resopal, drei Tischapparate, Schrankwand mit Hängeregistratur, eine Tür hinten als „nicht für dich").

**Hotspots:**

- **Insa Bauerfeind** (`talk`, zentral) — startet `insaAct2InPerson`.
- **Schrankwand mit Hängeregistratur** (`look`) — „Hier liegt mehr ungelesene Welt als in der Sektor-Bibliothek."
- **Drei Tischapparate** (`look`) — „Einer klingelt nie. Insa sagt, er ist die direkte Leitung in einen Raum, in dem niemand mehr sitzt." (erster Hint auf den „leeren Stuhl" / Sektorleitung-Vakanz aus Strang E).
- **Aushang „Resonanz-Hygiene"** (`look`) — verankert Okwus Pause räumlich.
- **Tür raus** (`exit`) — zurück Korridor 46.

### 4. Neuer Dialog `insaAct2InPerson` — der Drehpunkt (sechs Beats)

Layard kommt nicht mit einem Auftrag raus, sondern mit **einer Frage und einer Akte**.

1. **Begrüßung** — Insa schiebt einen zweiten Becher rüber. „Ich habe Sie mir größer vorgestellt. — Setzen Sie sich. Wir haben eine Stunde."
2. **Pause kurz registriert** — Insa: „Adaeze hat mir Bescheid gegeben, dass Sie sieben Tage pausieren sollen. Ich frage nicht nach." Keine Komplizenschaft, nur Hintergrund — damit Insa Layard keine Funkprotokolle aufhalst.
3. **Layards Frage** — Spieler-Wahl aus drei Zeilen, alle mit demselben Ausgang:
   - „Warum bin ich so, wie ich bin?"
   - „Warum ist das ein Krankheitsbild und keine Frage?"
   - „Wer hat das Schmerz-Radio eigentlich erfunden — und warum?"
   Insa: „Ich habe gehofft, Sie fragen das. Sonst hätte ich es Ihnen aufgedrängt."
4. **Die Akte 1978** — Insa öffnet eine Schublade und reicht Layard eine dünne, vergilbte Mappe: **„Resonanz-Überlastung 1978 · Quadrant E12 · Hörer N. Sertl · Gutachten: C. Marteau."** „Vor zwanzig Jahren hat schon einmal jemand das gehört, was Sie hören. Marteau war damals als Berater geladen. Das Gutachten fehlt. Im Archiv 5710 steht nur der Aktendeckel. Den Inhalt hat *jemand* mitgenommen — und nirgends notiert, *wer*."
5. **Mira-State-Splitter** (eine Zeile):
   - friendly: „Ihre Bekannte aus dem 4. — die kennt vielleicht den Weg in 5710 ohne Stempel."
   - neutral: keine Erwähnung.
   - skeptical: „Sie werden 5710 nicht über mich öffnen. Ich kenne nur einen, der das kann, und Sie mögen ihn nicht."
6. **Abschied — Layards eigenes Ziel ist gesetzt** — Insa: „Ich gebe Ihnen keinen Auftrag, Herr Worag. Ich gebe Ihnen die Genehmigung, etwas zu suchen, was offiziell niemand verloren hat."

Items am Ende: **„Akte 1978 · N. Sertl"** (neu, Inventar). Flags: `insaAct2BriefingDone`, `marteauTrailOpened`.

### 5. Was die Akte konkret in Akt II auslöst

- Layards **stehender Inventar-Begleiter** für ganz Akt II — wie das Protokoll in Akt I, aber selbst gewählt.
- **Schlüssel zum Bedeutungswandel von Rätsel B (Archiv 5710)**: Der Akteninhalt liegt dort. 5710 hat damit einen *eigenen* Grund, nicht nur „Vossbeck verlangt Vollmacht".
- Macht Mikael / Vossbeck / die Quittungs-Mechanik in Akt II zu Hindernissen auf Layards eigenem Weg. Rätsel A bleibt im Plan, wird aber narrativ umgehängt: Layard braucht den Schicht-C-Stempel, weil **damit** das Archiv 5710 zugänglich wird.
- Strang **E** (verschwundener Nachbar) hängt sich später an: der, der das Gutachten 1978 mitgenommen hat, ist mit hoher Wahrscheinlichkeit dieselbe Person, deren Akte heute leer ist.

### 6. Hint-Einträge

Zwei neue Einträge in `src/game/hints.ts`:

- **„Akt II — Insa in der Leitstelle"** · aktiv `act2Started && !insaAct2BriefingDone` · Stufen: „Insa hat dich eingeladen. 4602." → „Aufzug → 4. Etage → Tür 4602." → „Sprich Insa direkt an."
- **„Die Akte 1978"** · aktiv mit `marteauTrailOpened` · bleibt offen bis zur späteren Marteau-Auflösung — Layards Goal-Marker für ganz Akt II.

## Was in diesem Loop NICHT passiert

- Kein Botengang zu Frau Kowalk in 3602.
- Kein neuer Aufzug-Knopf, keine neue Etage.
- Kein Vossbeck-Akt-II-Auftritt, kein Mira-Akt-II-Besuch.
- Kein Inhalt der Akte selbst (nur Aktendeckel + Insas Worte) — der Inhalt ist Loot von 5710 in Rätsel B.
- Keine Änderung an Rätsel-A/B/C-Mechanik. Nur die *Bedeutung* von B verschiebt sich.

## Technische Umrisse

- `src/game/types.ts`: neue Flags `insaAct2BriefingDone`, `marteauTrailOpened`. Neues Item `akte1978Sertl` in `InventoryItemId`.
- `src/game/scenes/corridorsE67.ts`: Tür 4602 bekommt Label „Leitstelle E67" und `onUse: api.goTo("leitstelleE67")` (sichtbar erst bei `act2Started`).
- `src/game/scenes/leitstelleE67.ts` *(neu)*: Szene mit fünf Hotspots. In `scenes/index.ts` registrieren.
- `src/assets/scene-leitstelle-e67.jpg` *(neu, generiert)*.
- `src/game/scenes/apartmentAct1.ts`: `intro` zur Funktion `(api) => string` machen, Akt-II-Variante mit Mira-Tönung, Verweis „4602".
- `src/game/dialogs/insa.ts`: neuer Dialog `insaAct2InPerson` mit den sechs Beats; im letzten Knoten `addItem("akte1978Sertl")` + Flags.
- `src/game/hints.ts`: zwei neue Einträge.
- Item-Registry: Eintrag für `akte1978Sertl` (Icon-Reuse aus vorhandenen Akten-Items).
- `src/components/game/RadioPanel.tsx`: keine Änderung.

## Offene Fragen

1. **Akte 1978 — Vorname von „N. Sertl" ausschreiben oder als Initialen lassen?** (Initialen wirken aktenrealistischer; ausgeschriebener Name macht die spätere Verknüpfung mit Strang E leichter.)
2. **Layards Frage in Beat 3 — alle drei Optionen anbieten oder eine vorgeben?** (Drei Optionen geben Wahlgefühl, führen aber zum selben Punkt.)
3. **Der „nie klingelnde dritte Apparat" — schon konkret als „direkte Leitung zur Sektorleitung 28" benennen** (klare Vorbereitung von Strang E) oder vage halten?
