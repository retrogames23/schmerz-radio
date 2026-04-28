
# Bewohner-Ausweis & E67-Handbuch

## Ziel

- Layard startet Akt I mit zwei Inventar-Items: **E67-Bewohner-Ausweis** und **E67-Handbuch (Auszug, 7. revidierte Fassung)**.
- Das Handbuch ist ein lesbares „Welt-Dokument“: wohlwollend formuliert, aber bürokratisch verschachtelt — gleichzeitig Lore, Tutorial-Camouflage und Quelle für mindestens einen Hinweis, den der Spieler später braucht.
- Der Ausweis bekommt eine echte spielerische Funktion: ein neues kleines Akt-I-Rätsel (Sektor-Schleuse vor der Lobby), das Akt I um 5–10 Minuten streckt, ohne den bestehenden Hauptpfad zu brechen.

---

## 1. Items am Spielstart

Beim ersten Laden der Wohnung 2611 (`apartment` Szene) liegt im Inventar bereits:

| Item-ID | Name | Kurzbeschreibung |
|---|---|---|
| `residentId` | E67-Bewohner-Ausweis | Mattes Plastik, Lichtbild, Quadrant E67/26, Wohnung 2611. Magnetstreifen, daneben handgekratzt: „nicht knicken“. |
| `e67Handbook` | E67-Handbuch (Auszug, 7. rev. Fassung) | Geheftete Broschüre, 24 Seiten, beigefarben, Stempel „Bewohner-Exemplar — bitte griffbereit halten“. |

Beide sind ab `scene === "apartment"` und Spielbeginn im Inventar (kein Pickup nötig). „Untersuchen“ öffnet jeweils ein eigenes Lese-Overlay.

---

## 2. Inhalt: E67-Handbuch (Auszug)

Der Inhalt steht zentral in einer neuen Datei `src/game/e67Handbook.ts` als Array von Kapiteln; das Lese-Overlay nutzt das bestehende `TextOverlay`-Pattern (mit Kapitel-Navigation oben, Weiter/Zurück, Schließen per Klick außerhalb).

Tonfall: **freundlich-fürsorglich, übergriffig harmlos**, mit Fußnoten, Querverweisen auf Paragraphen, die nicht abgedruckt sind, und Fußnoten zu Fußnoten. Beispiel-Kapitel:

### §1 Willkommen in E67
„Sie wohnen jetzt hier. Wir freuen uns. Bitte bewahren Sie dieses Heft griffbereit auf — am besten **sichtbar**, aber **nicht im direkten Lichteinfall** (siehe §17 Abs. 4 lit. b: Vergilbungsschutz).“

### §2 Der Bewohner-Ausweis
- Stets bei sich tragen — auch in der eigenen Wohnung („für den Fall der Fälle, den wir alle nicht herbeiwünschen“).
- **Niemals knicken.** Ein geknickter Ausweis gilt als „eingeschränkt lesbar“ und führt nach §2 Abs. 3 zu einer freundlichen Erinnerung der Leitstelle.
- Bei Verlust: 001 wählen, **nicht vor 09:30 und nicht nach 16:45** (außerhalb dieser Zeiten greift §11 — siehe dort).
- Der Ausweis öffnet **alle Innentüren des Quadranten 26**, mit Ausnahme von Türen, die §6 unterstehen.
- Auf der Rückseite befindet sich ein 4-stelliger **Bewohner-Code** (siehe §2 Abs. 7). Dieser Code ist „im Regelfall identisch mit der Wohnungsnummer modulo 1000“ — *ausgenommen Wohnungen mit ungerader Quersumme; in diesen Fällen gilt der Code „Wohnungsnummer minus 1000“.*

### §3 Wann wähle ich 001?
Die wohl längste und liebevollste Tabelle des Handbuchs. Auswahl:

| Situation | 001 wählen? | Hinweis |
|---|---|---|
| Sie hören es nebenan klopfen, aber niemand öffnet | **Ja**, sofern es **dreimal** klopft *und* länger als 20 Sekunden andauert. Bei nur zweimal: erst eigene Wohnungstür öffnen, freundlich rufen, dann ggf. wählen. | §3.1 |
| Das Schmerz-Radio rauscht „auffällig harmonisch“ | **Nein.** Dies ist nach §9 ein Zeichen guter Resonanz-Hygiene. Bitte genießen. | §3.2 |
| Sie riechen Ozon im Treppenhaus | Erst Fenster (falls vorhanden) öffnen, dann **001**, **niemals zuerst 002** (002 existiert nicht mehr seit der Sektor-Reform 1996, vgl. §B). | §3.3 |
| Aufzug bleibt zwischen zwei Etagen stehen | **Nicht 001.** Dafür ist der Aufzugnotruf im Aufzug zuständig (gelber Knopf, **gedrückt halten, nicht tippen**). 001 nur, wenn der gelbe Knopf nach 4 Minuten nicht reagiert. | §3.4 |
| Ein Nachbar, den Sie länger nicht gesehen haben, öffnet plötzlich nicht mehr | **Ja, aber höflich.** Bitte nicht „vermisst“ sagen — die Leitstelle bevorzugt die Formulierung „derzeit nicht erreichbar“. | §3.5 |
| Sie selbst fühlen sich „nicht wie sich selbst“ | **001**, ruhig sprechen, **nicht das Wort „dringend“ verwenden** — es löst eine andere Eskalationsstufe aus, die Sie vermutlich nicht möchten. | §3.6 |

§3 endet mit dem berühmten Schlusssatz: *„Im Zweifel wählen Sie lieber **gar nicht** als **falsch**. Insa hört trotzdem zu.“*

### §4 Terminal-Benutzung (CentralOS 2.3)
- Anmeldung: Bewohner-Code (siehe §2 Abs. 7), gefolgt von **Enter**, **nicht Return** (auf älteren Tastaturen identisch — *bei neueren Geräten siehe §4 Abs. 9*).
- Befehle bitte **kleinschreiben**. Großbuchstaben werden „aus Höflichkeit toleriert, aber nicht garantiert ausgeführt“.
- `help` ist Ihr Freund. `man` ist Ihr **älterer** Freund.
- Mails der Leitstelle gelten als **gelesen, sobald sie zugestellt sind**, unabhängig davon, ob Sie sie gelesen haben (§4 Abs. 12 — die berühmte „Lesefiktion“).
- `cancel` ist nur für Wartungsvorgänge gedacht. Verwenden Sie es **nicht** auf eigenen Kalendereinträgen — das ergäbe „eine philosophisch unklare Situation“ (§4 Abs. 17).

### §5 Kantine 26 — Öffnungs- und Schließzeiten
- Mo–Do: **11:30–13:45** und **17:30–19:00**.
- Fr: **11:30–13:15** (verkürzt wegen Reinigung der B2-Linie).
- Sa/So: **geschlossen** (Beschluss der Bewohnerversammlung 11/1996, bestätigt 11/1997).
- **Ausnahmetage:** Jeder zweite Mittwoch im Monat, sofern dieser nicht auf einen Feiertag fällt — dann gilt der **darauffolgende Donnerstag** als Ausnahmetag, sofern dieser nicht selbst ein Ausnahmetag wäre, in welchem Fall §5 Abs. 6 lit. d greift (nicht abgedruckt).
- Mitbringen erlaubt: eigene Tasse („1 Stück, nicht mehr“). 
- Mitbringen verboten: eigenes Besteck (aus „Resonanz-Hygiene-Gründen“, vgl. §9).

### §6 Türen, Schleusen und Sektorgrenzen
- Innentüren Quadrant 26: **Bewohner-Ausweis** genügt.
- Sektorschleuse E67 → E71: **Manueller Code**, 8-stellig, wird einmalig durch die Leitstelle vergeben (vgl. §6 Abs. 4 — „Bringschuld der Bewohnerin/des Bewohners“).
- Wartungstüren (5er-Etage): **Wartungskarte**, kein Bewohnerzugang.
- **Lobby-Schleuse Etage 1:** Bewohner-Ausweis, *zusätzlich* Eingabe des Bewohner-Codes (§2 Abs. 7), sofern die Schleuse „im Tagesmodus“ steht. Tagesmodus gilt **werktags 06:00–22:00**. Außerhalb dieser Zeit genügt der Ausweis allein. *(Diese Klausel ist der Hebel für das Rätsel, siehe Abschnitt 4.)*

### §7 Resonanz-Hygiene
Fluffiges Kapitel. Bittet darum, „auffällig harmonische Geräusche“ nicht weiterzuverbreiten, da diese „dem Quadranten zustehen, nicht dem Einzelnen“.

### §8 Bewohnerversammlung
Findet „bei Bedarf“ statt. Bedarf wird durch die Leitstelle festgestellt.

### §9 Anhang B — Begriffe, die in diesem Heft nicht mehr verwendet werden
Eine kurze, sehr trockene Liste: *„Notfall“* (ersetzt durch „Anliegen erhöhter Priorität“), *„allein“* („vorübergehend ohne sichtbare Begleitung“), *„002“* („existiert nicht mehr“), *„Stille“* (ohne Ersatz).

### Letzte Seite — handschriftlich
Ein einzelner Stift-Eintrag eines früheren Bewohners (vermutlich von Bodo, hint, nicht bestätigt):
> „§6 Abs. 4: ‚Bringschuld‘. Heißt: keiner schickt dir den Code. Du musst fragen. Insa fragt nie zurück.“

---

## 3. Bewohner-Ausweis — Untersuchen

Beim „Untersuchen“ zeigt der Ausweis ein eigenes kleines Overlay (gleiches Lese-Pattern wie Handbuch):

- Vorderseite: Lichtbild Layard Worag, „E67 / Q26 / 2611“, Magnetstreifen, „gültig bis: unleserlich“.
- Rückseite: in winziger Prägung der **Bewohner-Code: 2611** (= Wohnungsnummer modulo 10 000, Standardfall nach §2 Abs. 7).

Damit hat der Spieler den Code passiv „dabei“, muss aber §6 / §2 im Handbuch lesen, um zu verstehen, **wo** er ihn benutzt.

---

## 4. Neues Akt-I-Rätsel: Lobby-Schleuse (Tagesmodus)

### Problem (für den Spieler)
Bisher führt Layards Weg vom Korridor 26 in den Aufzug → Lobby Etage 1 → Sektor-Tür E67/E71 ohne Hindernis. Der Eintritt in die Lobby ist „kostenlos“.

### Neuer Spielfluss (Vorschlag)
Wir bauen **vor** der Lobby eine **Schleuse** ein (kein neues Hintergrundbild nötig — wir rendern sie als kleines Keypad-Overlay beim Verlassen des Aufzugs auf Etage 1, **bei Erstbetreten** und nur „im Tagesmodus“).

1. Layard fährt mit dem Aufzug zu Etage 1.
2. Statt sofort in `floor1Lobby` zu landen, öffnet sich ein **Schleusen-Overlay** mit folgendem Text:
   > „Lobby-Schleuse E67/1. Tagesmodus aktiv (06:00–22:00). Bitte Ausweis vorhalten **und** Bewohner-Code eingeben.“
3. UI: Slot „Ausweis hier ablegen“ (Drag-Target für `residentId`) + 4-stelliges Keypad.
4. Akzeptiert wird **nur** Ausweis + Code `2611`. Bei Falscheingabe freundliche Insa-Stimme aus dem Lautsprecher: „Code stimmt nicht ganz. Schauen Sie ruhig im Handbuch nach, §2 Absatz 7.“
5. Erfolg: Flag `lobbyClearedDay` wird gesetzt, Layard ist in der Lobby. Ab jetzt entfällt das Overlay (Schleuse merkt sich den Bewohner für 24 Stunden Spielzeit — narrativ; technisch dauerhaft offen).

### Sanfte Bypässe (damit das Rätsel nicht blockt)
- **Ohne Code**: Spieler kann das Handbuch öffnen → Lesefenster zeigt §2 + §6 → Code wird im Klartext sichtbar.
- **Ohne Handbuch lesen**: Spieler untersucht den Ausweis → Rückseite zeigt 2611.
- **Ohne Ausweis** (Edge-Case, falls Spieler ihn theoretisch ablegt — aktuell nicht möglich): Schleuse verweigert mit „Nur Bewohner“ und verweist zurück in den Aufzug.
- **Hardcore-Bypass**: 001 wählen (Telefon Wohnung, falls verfügbar). Insa weist freundlich-genervt darauf hin, das Handbuch zu lesen — und sagt **nicht** den Code. (Kein echter Bypass, nur Flavor.)

### Warum das Akt I streckt, ohne ihn zu bremsen
- 30–90 Sekunden zusätzliche Spielzeit beim ersten Lobby-Besuch.
- **Macht Handbuch und Ausweis sofort relevant** — beide werden ab jetzt vom Spieler ernster genommen.
- Setzt §2/§6 als „Welt-Regel“, sodass spätere Sektor-Tür (8-stelliger Code von Insa, §6 Abs. 4 „Bringschuld“) thematisch konsistent ist.
- Zahlt direkt auf die zentrale Spielfantasie ein: *„Bürokratie als Labyrinth, das einen freundlich behandelt.“*

### Optionaler Folgeeffekt (Akt II)
Nach Akt I kippt die Schleuse automatisch in den **Nachtmodus**: Ausweis allein genügt. Wenn der Spieler dann zurückkommt, ist die Schleuse stumm offen — kleine Belohnung dafür, das Rätsel einmal gelöst zu haben.

---

## 5. Technische Umsetzung (für später, falls genehmigt)

- **`src/game/types.ts`**:
  - `InventoryItemId` um `"residentId" | "e67Handbook"` erweitern.
  - `KeypadTarget` um `"lobbyDay"` erweitern.
  - Neue Flags: `lobbyClearedDay`, `readHandbook`, `examinedResidentId`.
- **`src/game/GameContext.tsx`**: beim Initial-Load des Spielstandes, falls `inventory` leer und kein `started`-Flag, beide Items hinzufügen (Migration: bei Spielständen ohne diese Items nachträglich hinzufügen, damit alte Saves funktionieren).
- **`src/game/e67Handbook.ts`**: neue Datei mit den Kapiteln (Array `{ id, title, body: string[] }`).
- **`src/components/game/HandbookOverlay.tsx`**: neues Lese-Overlay (basiert auf `TextOverlay`, mit Kapitel-Tabs links / oben). Schließbar per Klick außerhalb.
- **`src/components/game/IdCardOverlay.tsx`**: Vorder-/Rückseiten-Toggle.
- **`src/components/game/Inventory.tsx`**: Klick auf `residentId` → `IdCardOverlay`, Klick auf `e67Handbook` → `HandbookOverlay`.
- **`src/components/game/Keypad.tsx`**: neuen Target-Modus `lobbyDay` (4-stellig, akzeptiert nur „2611“, prüft zusätzlich Drag-Drop des Ausweises).
- **`src/game/scenes.ts`** → `floor1Lobby`: beim `goTo("floor1Lobby")`, falls `!lobbyClearedDay && !enteredE71`, statt direkt zu wechseln das Schleusen-Overlay öffnen. Nach Erfolg `setFlag("lobbyClearedDay")` und Szenenwechsel.
- **`src/game/combine.ts`**: Drag des Ausweises auf das Schleusen-Keypad akzeptiert Item temporär (Item bleibt im Inventar).

---

## 6. Offene Designfragen

1. Soll das Handbuch ein **echtes scrollbares Buch-Overlay** (mit Kapitelnavigation) sein, oder reicht das vorhandene `TextOverlay`-Pattern (Seite für Seite weiterklicken)?
2. Sollen wir den **Bewohner-Code** im Verlauf von Akt I noch einmal verwenden (z.B. für ein zweites Schloss in der Wohnung — Briefkasten?), damit sich §2 Abs. 7 langfristig „lohnt“?
3. Soll die Schleuse Layard bei wiederholter Falscheingabe **eskalieren** (Insa ruft selbst an) — oder bleibt sie freundlich-passiv?

Wenn du den Plan grundsätzlich okay findest, sag mir gerne kurz, **wie** du Frage 1–3 beantworten willst, dann setze ich es im Build-Modus um.
