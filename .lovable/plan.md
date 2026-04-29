
# Mira ausbauen — Wohnung 4601, Vertrauensrätsel, FuckTheSystemOS

## 1. Charakter-Update (Konsolidierung)

In `src/game/npcPersonas.ts`:
- Alter korrekt setzen: `age: "16"` (war versehentlich „Mitte 30").
- Beruf: „Schülerin / Lehrling Sektor-Wartung E67, Kabel-Inventur Korridor 56".
- Personality erweitern: wohlmeinend, klug, gelegentlich naiv und überschwänglich. Spricht in Bildern, möchte „die anderen aufwecken", überschätzt aber regelmäßig die Wirkung ihrer eigenen Aktionen.
- `secrets` erweitern um: Z.K.S.-Zelle in E67, lose Kontakte in andere Quadranten, geknackter Etagendrucker, FuckTheSystemOS auf eigenem Rechner.
- Neue context flags ergänzen (siehe §2).

## 2. Story-Hintergrund (in den Persona-Lore und in lesbare In-Game-Texte überführen)

Wird sowohl in `npcPersonas.ts → mira.secrets/worldLore` eingewebt als auch in neue Dateien auf ihrem FuckTheSystemOS-Terminal (siehe §6) sowie in neue Dialogzeilen.

- **Z.K.S. (Zentrum.Käfig.Stille)** ist keine Organisation, sondern eine „Vermutung, die sich weitergibt" (knüpft an `manifest.txt` aus `mira.zks` an). Drei lose Knoten in E67:
  - Mira (16) — Verteilung, technische Spielereien, Etagen-Schmuggel.
  - „Onkel" Roald, 4604, Mitte 60 — alter Funker, hat ihr beigebracht, was eine Leine ist. Bewohnt die Tür neben ihr. Tritt nicht persönlich auf, nur als Name in Dateien/Dialog.
  - „Briefkasten 5601" — anonymer Drop am Etagendrucker 56.
- **Externe Kontakte**: drei „Brieffreunde" via Telnet-Drop in anderen Quadranten (E54, E72, E81). Nur Pseudonyme, keine Namen. Ein Kontakt schweigt seit 47 Tagen — Mira fürchtet, er wurde „transferiert".
- **Was sie über die anderen denkt** (in Datei `notizen.txt` und Dialog):
  - Layard: „läuft ohne Empfänger. selten. entweder neugierig oder kaputt."
  - Philippe: „hört zu wie ein Profi. schreibt mit. ich traue ihm — aber ich erzähle ihm nichts."
  - Bodo: „liebt einen Hund. das ist ein anker. wer einen anker hat, kippt nicht."
  - Helka: „sie weiß alles. sie sagt nichts. das ist auch eine form von widerstand."
  - Worag: „der name auf der tür gegenüber von layard. jemand wartet dort. ich mag das nicht."
  - Insa (Leitstelle): „sie meint es gut. das macht sie gefährlicher als die, die es nicht meinen."
  - Mikael (E71): „der hat angefangen und hört auf. das ist das mutigste, was ich kenne."
- **Ziel**: nicht „System stürzen". Sondern: „dass eine Etage eine Stunde lang das Radio aussschaltet und merkt, dass sie nicht stirbt." Konkrete naive Phantasie: „Tag der Stille" auf 104,6.
- **Bürokratie-Ton**: ihre Wut richtet sich nicht gegen böse Verwalter, sondern gegen eine wohlmeinende, verantwortungslose Maschinerie. Sie sagt einmal explizit: „Niemand will dir etwas Böses. Das ist genau das Problem."

## 3. Mira lebt jetzt in 4601 (Etage 4)

In `src/game/GameContext.tsx`:
- Verteilungslogik vereinfachen: Mira **immer** auf Etage 4 (`miraFloorsRef.current = [4]`), Philippe **immer** auf Etage 5. Save-Migration: alte Werte auf das neue Schema mappen, vorhandene Story-Flags bleiben gültig.
- `getMiraFloors()` liefert weiterhin die Liste, ist aber für neue Saves konstant `[4]`. Damit bleibt die schon umgesetzte Logik „Mira bleibt auf der Etage, auf der sie zuerst auftauchte" trivial konsistent.

In `src/game/scenes.ts`:
- `corridor36`: Mira-Sprite + Hotspot entfernen (sie taucht nicht mehr auf E3 auf).
- `corridor56`: dito.
- `corridor46`: bestehender Sprite/Hotspot bleiben; zusätzlich neue **Wohnungstür 4601** als Hotspot.
  - Vor `miraTrustEarned`: Tür `kind: "look"`, Text: „Tür 4601. Kein Schild. Verkratzter Lack."
  - Mit `miraTrustEarned` & nicht `inMiraApartment`: `kind: "exit"` → `goTo("aptMira4601")`.

## 4. Neue Szene `aptMira4601` (Miras Wohnung)

Asset: neue Hintergrundgrafik `scene-apt-mira-4601.jpg` (über Image-Generator erzeugen). Stil: enges Ein-Zimmer-Apartment, Bett mit zerwühlter Decke, Wand voller Plakate (siehe Hotspots), kleiner schiefer Schreibtisch mit gehacktem Terminal (Phosphor-Grün, Aufkleber „F.T.S.", offenes Gehäuse, hängende Kabel zum Etagendrucker), Bodenmatratze, leere Mate-Flaschen, ein zugeklebter Lüftungsausgang.

Hotspots:
- `terminalMira` → öffnet Terminal im neuen FuckTheSystemOS-Modus (siehe §6).
- `posterRadio` (Plakat „104,6 — DEINE LEINE") — Look-Text mit Z.K.S.-Slogan.
- `posterStille` (Plakat „TAG DER STILLE — bald.") — Ziel-Foreshadowing.
- `posterPortraits` (Wand mit kopierten Bewohnerporträts; Faden-Verbindungen mit Bleistift) — verweist auf ihre interne Verteilerliste.
- `bettMira` (Look) — beschreibt halb-aufgeschlagenes Schulbuch „Sektor-Geographie Klasse 10".
- `vent` (Look) — verklebter Lüftungsschlitz, Flyer dahinter versteckt.
- `lüfterDrucker` (Look) — Kabel führt zum Etagendrucker, „Mira hat einen freien Port gefunden".
- `back` → zurück nach `corridor46`.
- Mira-NPC-Sprite **in der Wohnung**, wenn `miraTrustEarned`. Hotspot „Mira" startet `miraAtHomeIntro` beim ersten Besuch, danach `miraAtHomeChat` (kurzer Static-Tree mit 3-4 Themen + freier Chat über bestehende Free-Mode-Logik).

## 5. Vertrauens-Rätsel

Ziel: `miraTrustEarned` setzen, damit sie ihre Adresse verrät.

Voraussetzungen (alle erfüllt):
1. `tookFlyer` — Layard hat das Flugblatt akzeptiert.
2. Layard hat „Z.K.S." entschlüsselt: er muss ihr im Dialog *die richtige Auflösung* nennen — nicht aus dem Dropdown gewählt, sondern indem er vorher `manifest.txt` auf `mira.zks` per Telnet gelesen hat (`readMiraManifest` — neue Flag, gesetzt beim cat-Aufruf). Mira fragt: „Was bedeuten die drei Buchstaben?" und prüft die Antwort über Dialog-Choices, von denen nur eine durch `requires: ["readMiraManifest"]` sichtbar wird.
3. Layard hat eine konkrete Geste gemacht, die zeigt: er hört nicht heimlich für die Verwaltung. Zwei akzeptierte Wege:
   - **Stille-Probe**: Layard schaltet zuhause für mindestens 60 Sekunden das Schmerz-Radio aus (`radioMutedAtLeast60s` — neue Flag, gesetzt vom `RadioPanel`-Timer). Er erzählt Mira beim nächsten Treffen davon (Dialog-Choice mit `requires`).
   - **Helka-Bürgschaft**: er erwähnt Helka beim Namen *und* hat `helkaSawFlyer` — Helka hat das Flugblatt gesehen und nicht verraten.
4. Mira fragt zuletzt einen Charaktertest: „Was würdest du als erstes mit einem Superuser-Zugang ins Sektornetz machen?" — drei Optionen, nur die nicht-machtgierige (sinngemäß „ich würde nichts tun, was sich nicht rückgängig machen lässt") setzt das Vertrauen. Die anderen beiden lassen Mira `miraTrustWithheld` setzen und Layard kann es später erneut versuchen, sobald `radioMutedAtLeast60s` neu gilt.

Bei Bestehen:
- Setzt `miraTrustEarned`.
- Mira nennt mündlich die Tür: „4601. Direkt unter dem abblätternden Plakat. Klopf zweimal kurz, einmal lang."
- Inventaritem `miraDoorCode` (kein Code, nur Erinnerungs-Notiz) wird vergeben.

Die ganze Sequenz lebt in zwei neuen Dialog-Bäumen in `src/game/dialogs.ts`:
- `miraTrustProbe` (löst `miraAfter` ab, sobald `tookFlyer && readMiraManifest && (radioMutedAtLeast60s || helkaSawFlyer) && !miraTrustEarned && !miraTrustWithheld`).
- `miraTrustRetry` (wenn `miraTrustWithheld`, sobald sich eine Bedingung verbessert hat).

Dispatcher in `corridor46.miraSpot46.onUse` entsprechend erweitert.

## 6. FuckTheSystemOS 0.2 auf Miras Terminal

In `src/components/game/Terminal.tsx`:
- Neuer Modus `miraMode: boolean` analog zu `terminalBodoMode` im `GameContext`. Aktiviert über `openTerminal({ mira: true })` aus dem Hotspot in `aptMira4601`.
- Wenn aktiv:
  - Banner/MOTD: 
    ```
    ── FuckTheSystemOS v0.2 — root@miranet ──
    SUPERUSER MODE: ENABLED
    POLICY-ENGINE: bypassed
    AUDIT-LOG: /dev/null
    "tu nichts, was du nicht zurücknehmen kannst." — m.
    ```
  - Prompt: `root@miranet:~#` (rot statt grün). Farbumschaltung über zusätzliche Klasse, kleines CSS-Token in `styles.css`.
  - Eigenes Filesystem in neuer Datei `src/game/filesystemMira.ts` mit:
    - `~/manifest.txt` (Verweis auf `mira.zks/manifest.txt`).
    - `~/freunde.txt` (Pseudonyme E54/E72/E81, Datum 47 Tage Schweigen).
    - `~/notizen.txt` (Bewohner-Einschätzungen, siehe §2).
    - `~/plan_tag_der_stille.md` (naiver Aktionsplan, voller durchgestrichener Schritte).
    - `~/.werkstatt/druckerport.log` (wie sie den Etagendrucker-Port gefunden hat).
    - `~/.werkstatt/ftsos_changelog.md` (v0.1 → v0.2: „passwort-prompt entfernt, weil das system uns ja eh vertraut").
- **Telnet-Verhalten**: in `miraMode` überspringt `telnet <host>` jede Passwortabfrage (gleiche Logik wie der bestehende `cheat superuser`-Pfad, aber dauerhaft solange `miraMode` aktiv). Bei den vollwertigen Remote-Sitzungen (`bodo`, `worag`) gibt es root-Zugriff; bei Mini-Hosts liefert das System ein zusätzliches `[ftsos] login bypass via miranet root tunnel` als System-Zeile.
- Sicherheitsnetz: bestimmte zerstörerische Aktionen bleiben gesperrt — Mira selbst hat den `rm`-Befehl in v0.2 deaktiviert („tu nichts, was du nicht zurücknehmen kannst"). Wer es trotzdem versucht, bekommt eine Ermahnung als Output. Das hält das System narrativ konsistent und verhindert kaputte Save-States.
- `news`/`adventure`/`lotti`-Programme sind in `miraMode` **nicht** verfügbar. Stattdessen gibt es ein neues Mini-Programm `freunde` (zeigt animiert „warte auf antwort von gardenia.e54 … (47 tage)").

## 7. Nebenarbeiten und Konsistenz

- `npcPersonas.ts → dialogSummaries`: Einträge für `miraTrustProbe`, `miraAtHomeIntro` ergänzen.
- `Ending.tsx`: zweite Mira-Codaszene falls `miraTrustEarned` (kurzer Text, dass die „Vermutung" weitergegeben wurde).
- `helpTopics.ts`: kurzer neuer Eintrag „Etage 4 / Tür 4601" nur sichtbar bei `miraTrustEarned`.
- `e67Handbook.ts` bleibt unverändert (Mira soll im offiziellen Handbuch nicht auftauchen).

## Technische Details

- Neue StoryFlags in `src/game/types.ts`: `readMiraManifest`, `radioMutedAtLeast60s`, `miraTrustEarned`, `miraTrustWithheld`, `inMiraApartment`, `miraAtHomeMet`.
- Neuer Szenen-Key `aptMira4601`. In `scenes.ts` registrieren, in `routeTree`/`router` keine Änderung nötig (Szenen sind kein Router-State).
- Neuer Asset-Import: `scene-apt-mira-4601.jpg` (Image generieren). Optional zweites Sprite `npc-mira-home.png` (sitzend). Für den ersten Wurf reicht das bestehende Mira-Sprite.
- `RadioPanel.tsx`: Timer beim Stummschalten/Drehen unter Hörschwelle starten; nach 60 s `radioMutedAtLeast60s` setzen. Wird nur einmal benötigt, danach ignoriert.
- Terminal-API erweitert: `openTerminal({ mira: true })` zusätzlich zu vorhandener Bodo-Variante. Vorhandene Aufrufe `openTerminal()` bleiben kompatibel (Default-Argument).
- Filesystem-Datei `src/game/filesystemMira.ts` analog zu `filesystemBodo.ts` strukturieren (`HOME_PATH_MIRA`, `resolveMira`, `pathStringMira`).
- Save-Migration in `GameContext.tsx`: alte `miraFloors`/`miraFloor`-Werte werden auf `[4]` normiert; kein Verlust bestehender Story-Flags.
- Sicherheits-Hinweis: keine Backend-Änderungen, kein neuer Secrets-Bedarf, keine RLS-Themen.
