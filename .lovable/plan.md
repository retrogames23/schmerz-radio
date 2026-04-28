
# Kantine E67 — Konzept & Integration

## 1. Korridor-Umbenennung

`corridor36`:
- Title: „Korridor 36 — Verwaltung und Versorgung"
- Intro angepasst: erwähnt Kantinengeruch links neben 3601.
- Keine Flag-/ID-Änderungen — `corridor36` bleibt als Scene-ID stehen, nur Anzeigetext ändert sich.

Layout-Skizze:

```text
┌────────────────────────────────────────────────────────────┐
│   [3602 KANTINE]   [3601 ABSCHNITT]            [Aufzug]    │
│        🚪              🚪 + Klingel               ↑         │
└────────────────────────────────────────────────────────────┘
```

Neue Tür-Hotspot links neben 3601 (x≈4, y≈32, w≈12, h≈50): „Tür 3602 — Kantine E67". Geht in neue Scene `cafeteriaE67`.

## 2. Szene `cafeteriaE67`

**Asset:** Neuer Hintergrund `scene-cafeteria-e67.jpg` im Unavowed-Stil (handgemalt, körniges Licht). Mischung aus:
- DDR-Kantine: Resopal-Tische, Gardinen mit geometrischem Muster, Zigarettenautomat, ein Wasserkocher, ein Aushang „Hygieneordnung Stand 1994".
- „Brazil" (Gilliam 1985): überdimensionierte Lüftungsrohre an der Decke, ein blinkender Pneumatikrohrposteingang über der Theke, ein zu grosses Schild „NÄHRSTOFFAUSGABE — BITTE ANSTELLEN" mit Pfeil ins Nichts, Aktenstapel auf einem Beistelltisch.
- Etabliert: warmes Bernstein-Licht, eine flackernde Leuchtstoffröhre, ein Radio im Hintergrund.

Zwei NPCs hinter der Theke:
- **Kowalk** (links, weiblich, Mitte 50, Dauerwelle, Kittel mit Namensschild „K. KOWALK — SCHICHT B"). Pragmatisch, direkt, glaubt an die alte Hygieneordnung von 1991.
- **Brust** (rechts, männlich, Anfang 30, dünn, Kittel mit Namensschild „M. BRUST — SCHICHT B / TRAINEE"). Regelfanatiker, glaubt an die neue Hygieneordnung von 1996.

Hotspots:
- `kowalkSpot` → `cafeteriaKowalk`-Dialog
- `brustSpot` → `cafeteriaBrust`-Dialog
- `cafeteriaCounter` → Schild „Ausgabe nur mit Bewohner-Code oder Vollmacht" (Beobachtung)
- `cafeteriaPneumaticTube` → Rohrpost (Beobachtung, Schmerz-Radio-Subtext)
- `cafeteriaPosters` → widersprüchliche Hygieneaushänge (Beobachtung)
- `back36` → zurück nach corridor36

## 3. Hintergrund-Chatter (DSA-Style)

Neues Modul `src/game/cafeteriaChatter.ts` analog zu `dsa/chatter.ts`. `FloatingChatter`-Komponente wiederverwenden mit `npc`-IDs `kowalk` / `brust`. Aktiv, wenn Layard in `cafeteriaE67` ist und kein Dialog läuft.

Themen (jeweils 3–5 Zeilen, Loop mit Pausen):

1. **Schichtplan-Tausch**
   - Brust: „Schicht C tauscht wieder mit Schicht B. Drittes Mal diese Woche."
   - Kowalk: „Weil Schicht C niemand mag. Auch nicht Schicht C selbst."
   - Brust: „Es steht im Plan, also gilt es."
   - Kowalk: „Es steht im Plan, weil ich es reingeschrieben habe, Brust."

2. **B2-Zuteilung**
   - Kowalk: „Achtundachtzig B2 für E67 heute. Letzte Woche sechsundneunzig."
   - Brust: „Resonanz-bedingt. Sagt Logistik."
   - Kowalk: „Sagt Logistik immer."

3. **B3-Knappheit**
   - Brust: „B3 ist offiziell nur für medizinisch indizierte Fälle."
   - Kowalk: „Frau Doktor Tessmer hat seit dem Frühjahr keinen Antrag mehr gestellt."
   - Brust: „Trotzdem ist B3 weg."
   - Kowalk: „Frag den Hausmeister auf 56."

4. **Hygieneordnung — Streitthema**
   - Brust: „Aushang vier Punkt zwei: Handschuhe bei Ausgabe, jederzeit."
   - Kowalk: „Aushang sieben Punkt eins, von 91, Brust: Handschuhe nur bei flüssigen Rationen."
   - Brust: „Der ist überschrieben."
   - Kowalk: „Wo steht das?"
   - Brust: „Im neuen Aushang."
   - Kowalk: „Der den alten überschreibt, weil im neuen steht, dass er ihn überschreibt. Sehr sauber gedacht."

5. **Pneumatik-Rohrpost**
   - (klong) Kowalk: „Wieder Quadrant E70. Wieder leer."
   - Brust: „Steht trotzdem in der Eingangsliste."
   - Kowalk: „Genau."

6. **Bewohner-Codes**
   - Brust: „Vollmacht 4419 hat heute drei B3 abgeholt."
   - Kowalk: „4419 ist Frau Tessmer. Lass es."
   - Brust: „Aber drei."
   - Kowalk: „Lass es."

7. **Kowalks Tochter** (nur ein Mal, am späten Akt I)
   - Kowalk: „Meine Tochter war bei Resonanz-Hygiene. Hat aufgehört."
   - Brust: „Wegen?"
   - Kowalk: „Hat sie nicht gesagt. Aber sie isst seitdem keine B2 mehr."

## 4. Story-Integration: Vollmachts-Rätsel (Akt I)

### Wo das Rätsel andockt

Aktuell soll Layard nach dem Telefonat mit Insa zu Tür 3601, findet diese leer, klingelt vergeblich. Die Etage hat sonst wenig zu tun. Hier setzt das Rätsel an:

**Auslöser (vor 3601):** Bei Layards erstem Besuch in `corridor36` spricht ihn **Philippe** im Korridor an (oder bei einem Besuch in 2613 nach dem Sanitäter-Vorfall) und bittet:

> „Worag — Sie gehen sowieso nach unten. Würden Sie meine B3 mitnehmen? Ich bin … nicht mehr ganz sicher, ob ich heute durch die Kantine komme. Hier — meine Vollmacht. Vier-Drei-Eins-Sieben."

Layard bekommt **Item: `b3Authorization`** („Vollmacht 4317 — Philippe Marteau, B3-Ausgabe einmalig"). Ist mehr als nur Botengang — Philippe schiebt Layard in einen Raum, der ihn zwingt, mit Personal jenseits der Verwaltungsschicht zu reden, und gibt ihm ein zusätzliches Druckmittel an Insa (Layard hat jetzt belegbar einen offiziellen Bewohner-Auftrag erfüllt — Argument für „Ich war heute schon kooperativ").

### Komplikation (das eigentliche Rätsel)

In der Kantine gibt Brust die B3 nicht raus:
- Brust: „Vollmacht 4317 ist von Schicht A gegengezeichnet. Heute ist Schicht B. Ich kann das nicht freigeben."
- Kowalk: „Brust."
- Brust: „Es steht im Aushang."
- Kowalk: „Welcher?"

Layard braucht dann **eines von zwei** Dingen, um die B3 zu bekommen:

**Lösungsweg A — Kowalk überreden:**
Über Dialogoptionen aus Kowalks Hintergrund (ihre Tochter, die Resonanz-Hygiene verlassen hat, und ihre Bemerkung über Frau Tessmer) kann Layard eine Vertrauensbasis aufbauen. Wenn er (a) ihr seinen **Bewohnerausweis** zeigt UND (b) erwähnt, dass Philippe „seit gestern schlecht aussieht" (nur verfügbar nach `metPhilippe`), gibt sie die B3 unter der Theke heraus, ohne Brust einzubeziehen. Setzt Flag `kowalkSidedWithLayard`.

**Lösungsweg B — Brust mit seiner eigenen Logik schlagen:**
Layard braucht den **älteren Aushang** als Item. Den findet er entweder:
- als Aushang an Tür 3601 (der „Heute geschlossen"-Zettel ist auf der Rückseite einer alten Hygieneordnung gedruckt), oder
- über das **E67-Handbuch** (existiert schon als Item) — eine Seite zitiert die Hygieneordnung von 1991 wörtlich.

Layard kombiniert Handbuch + Vollmacht (oder zeigt Brust die entsprechende Handbuchseite), woraufhin Brust kapituliert: „… der Aushang ist tatsächlich nicht widerrufen. Bitte nehmen Sie die Ration." Setzt Flag `brustOutruled`.

### Auflösung & Akt-I-Verzahnung

Layard erhält **Item `b3Ration`**. Bringt er es Philippe (in 2613 oder Korridor 26), gibt Philippe ihm im Gegenzug:
- den **Sanitäter-Bericht** vom Vorfall in 2615 (neues Item `paramedicsReport`), den Philippe „aus Versehen" mitgenommen hat — oder, wenn dieser narrativ überlastet ist:
- eine **Notiz mit Insas Geburtsname**, den Philippe noch aus den alten Adressbüchern kennt — direkter Hint auf Helkas/Insas Passwort-Rätsel später, ohne es zu spoilern.

(Empfehlung: Sanitäter-Bericht. Macht das Rätsel handfest und liefert Layard einen Grund, Stegmann/Insa erneut zu kontaktieren — verlängert Akt I um einen sauberen Loop, statt nur ein Item zu pingpongen.)

### Wenn Layard die Vollmacht ignoriert

Vollmacht ist optional. Verfällt nicht; Philippe fragt beim nächsten Treffen einmal nach („Haben Sie zufällig …?"), dann nicht mehr. Subtext-Bemerkung im Schmerz-Radio, wenn Layard endgültig daran vorbeigeht.

## 5. Item-Reaktionen (Kowalk & Brust)

Für `src/game/combine.ts` — Reaktionen auf „Item zeigen". Format: kurze, in-character Sätze.

| Item | Kowalk | Brust |
|---|---|---|
| `protocol` (Layards Ausgangsprotokoll) | „Das ist nicht meine Theke, Worag." | „Formular ist korrekt ausgefüllt. Sie wollen das woanders abgeben." |
| `exitCode` (Sektor-Code) | „Stecken Sie den weg, bevor jemand reinkommt." | „Bewohnercodes gehören nicht in die Kantine, Herr Worag." |
| `b3sample` | „Originalverpackung. Wo haben Sie die her?" | „Diese Charge ist offiziell aus dem Verkehr — bitte zurückgeben." |
| `tuningCrystal` | „Hübsch. Nicht essbar." | „Das ist kein Bewohnergegenstand. Bitte beim Fundbüro abgeben." |
| `mikaelLetter` | (liest stumm) „Behalten Sie das. Und reden Sie mit niemandem darüber." | „Privater Schriftverkehr. Bitte nicht in der Ausgabezone." |
| `flyer` (Mira) | „Die haben uns auch welche unter der Tür durchgeschoben. Brust hat sie weggeworfen." | „Nicht-genehmigte Druckerzeugnisse. Bitte entsorgen." |
| `wartungsnotiz5610` | „Bodos Schrift. Was tun Sie damit?" | „Wartungsdokumente sind technisch. Nicht hier." |
| `residentId` | „Worag, E67, 2613. In Ordnung." | „Identität bestätigt. Was möchten Sie aufnehmen?" |
| `e67Handbook` | „Das alte Ding. Vorne im Hygiene-Kapitel ist ein Eselsohr — meins." | „… die Ausgabe von 91 ist offiziell noch gültig?" |
| `b3Authorization` | (Lösungsweg A — siehe oben) | „Vollmacht 4317. Schicht A. Heute Schicht B. Ich kann das nicht." |
| `b3Ration` (nach Erhalt) | „Bringen Sie die hoch. Nicht hier öffnen." | „Bitte vor Verlassen der Etage übergeben." |

## 6. Dialog-Bäume (Übersicht)

Neu in `src/game/dialogs.ts`:

- `philippeAsksFavor` — Vollmachts-Übergabe (Trigger im Korridor 26 oder beim ersten Betreten von corridor36 nach `metPhilippe`).
- `cafeteriaKowalk` — mehrstufig: Smalltalk → Schichtarbeit → Tochter → (ggf. Ausgabe).
- `cafeteriaBrust` — Smalltalk → Hygieneordnung → Vollmacht-Streit → (ggf. Ausgabe).
- `cafeteriaHandover` — Brust gibt klein bei (Lösungsweg B).
- `cafeteriaUnderTheCounter` — Kowalk gibt B3 unter der Theke (Lösungsweg A).
- `philippeReceivesB3` — Übergabe in 2613 / Korridor 26, Layard bekommt Sanitäter-Bericht.

## 7. Technische Aspekte

- **Neue Items in `InventoryItemId`:** `b3Authorization`, `b3Ration`, `paramedicsReport`. Icons in `ItemIcon.tsx` ergänzen.
- **Neue Flags:** `gotB3Authorization`, `kowalkSidedWithLayard`, `brustOutruled`, `gotB3Ration`, `gaveB3ToPhilippe`, `metKowalk`, `metBrust`, `cafeteriaKnowsHygieneFeud`.
- **Neue Scene-ID:** `"cafeteriaE67"` in `SceneId`-Union.
- **Hintergrund-Asset:** `scene-cafeteria-e67.jpg` (gen + import in `scenes.ts`).
- **NPC-Sprites:** `npc-kowalk.png`, `npc-brust.png` (gen, gleicher Stil wie bestehende Sprites).
- **Chatter-Modul:** `src/game/cafeteriaChatter.ts`; `FloatingChatter` so erweitern (oder zweite Instanz mounten), dass es eine generische Topic-Liste + NPC-Map akzeptiert. Aktuelles `FloatingChatter` prüfen: falls hart auf DSA-Daten verdrahtet, Refactor zu `<FloatingChatter topics={...} npcPositions={...} />`.
- **Combine-Reaktionen:** Tabelle aus §5 in `combine.ts` einpflegen, analog zu bestehenden NPC-Reaktionen.
- **Story-Gating:** Vollmachts-Rätsel darf weder Akt-I-Hauptpfad blockieren noch auf magische Weise das Insa-Passworträtsel oder das Stegmann-Telefonat ersetzen — es ist ein paralleler, optionaler Loop, dessen einzige *narrative* Belohnung (Sanitäter-Bericht) Layard zusätzlichen Hebel gibt, aber nicht zwingend ist.

## 8. Offen für Entscheidung

- Belohnung von Philippe: **Sanitäter-Bericht** (mein Vorschlag) oder **Insas Geburtsname als Notiz**?
- Soll Layard die B3 *nicht* an Philippe geben können (eigene Verwendung / wegwerfen) — also moralische Mini-Wahl mit späten Konsequenzen?
- Sollen Kowalk & Brust nach erfolgter B3-Ausgabe weiter chattern, oder ihren Konflikt sichtbar fortsetzen (z. B. Brust beleidigt, redet mit Layard nicht mehr)?
