# Plan: Echte Aventurien-Karte + DSA2-Charakterbogen

## 1. Aventurien-Karte im Gemeinschaftsraum korrigieren

Die aktuell im Hintergrund gemalte „Aventurien"-Karte zeigt eine generische, falsche Landmasse (eher Mitteleuropa-artig). Aventurien hat eine sehr charakteristische Silhouette: ein langgezogener Subkontinent mit der breiten Nordhälfte (Bornland/Thorwal/Mittelreich), einer schmalen Taille auf Höhe Khôm-Wüste und der Südspitze (Maraskan rechts als Insel, Echsensümpfe).

**Vorgehen**: Das Bild `src/assets/scene-common-room.jpg` wird neu generiert. Prompt enthält explizit die korrekten Form-Merkmale aus deiner Referenz:
- Nord-Süd-gestreckter Kontinent, oben breit, mittig schmal, unten wieder breiter
- Khôm-Wüste als gelbe Fläche im Süden mittig
- Maraskan als längliche Insel rechts unten (Marakanasund dazwischen)
- Inselgruppe links oben (Thorwal/Skraja/Gjalskerland)
- Yetiland-Halbinsel oben
- Pixel-Art Stil bleibt, Komposition (Tjark links, Brem hinten Mitte, Yelva rechts) bleibt unverändert
- Restliche Wand-Elemente bleiben (Leuchtturm-Skizze, Resonanz-Hygiene-Schild, DSA-Buch, Schirm, Würfel)

Die NPC-Anker für `FloatingChatter` bleiben damit gültig.

## 2. DSA2-Charakterbogen für die Erstellung

Aktuell ist die Charakter-Erstellung ein normales Modal mit Würfel-Kacheln. Stattdessen soll sie auf einem **originalgetreuen DSA2-Charakterbogen** stattfinden, der danach auch im Spiel einsehbar bleibt.

### Visuelle Anlehnung an DSA2 (1988er Bogen)
Der originale DSA-„Helden-Dokument"-Bogen (Schmidt-Spiele, schwarz-weiß, A4) hat:
- Kopfzeile mit Wappen-/Drachen-Logo links, „HELDEN-DOKUMENT" als Titel, „Das Schwarze Auge" Schriftzug
- Darunter ein Block mit **Name, Stand, Typus (Klasse), Geschlecht, Größe, Gewicht, Haar, Augen, Geburtstag, Götter, Heimat**
- Großer Eigenschaften-Block: **MU · KL · CH · FF · GE · IN · KK** als sieben gerahmte Zahlenfelder mit voll ausgeschriebenem Namen darunter
- LE/AE als zwei prominente runde/eckige Felder mit „Lebensenergie" / „Astralenergie"
- Negativ-Eigenschaften-Block (Aberglaube/Höhenangst/Goldgier/Jähzorn/Neugier/Raumangst/Totenangst) — wir lassen den leer/symbolisch
- Kästchen-Raster, Linien, leicht vergilbtes Papier, Maschinenschrift-Optik
- Unten: Talente, Waffen, Ausrüstung als gerasterte Listen (wir deuten an, nicht voll ausfüllbar)

### Bauplan

**Neue Komponente** `src/components/game/DsaCharacterSheet.tsx`
- Reine Darstellungs-Komponente, nimmt `attrs`, `le`, `ae`, `name`, `className`, `rolling`-State entgegen
- Layout: vergilbter Papier-Hintergrund (CSS-Gradient + Rauschen via subtiler SVG-Filter), schwarze Tinte-Schrift
- Schriftarten:
  - Titelzeile in einer Display-Serif (vorhandene `font-display`) mit „HELDEN-DOKUMENT"
  - Werte in `font-mono-crt` für Schreibmaschinen-Look
- Sieben Eigenschafts-Kästchen als gerahmtes 7er-Raster mit Beschriftung
- LE/AE als zwei dicker umrahmte Boxen rechts
- Persönliche Daten (Name, Typus, Geschlecht, Heimat, Götter) als beschriftete Zeilen mit Unterstrichen
- Würfel-Animation: Während des Wurfs flackern die Werte in den Kästchen (wie heute), werden dann „eingestempelt" (kurze Skalierungs-Animation + Stempel-Sound optional)

**`DsaCharacterCreator.tsx` umbauen**
- Modal-Container bleibt (Overlay + Close-Button), aber der Inhalt ist jetzt der `DsaCharacterSheet`
- Phasen bleiben: `intro` → `rolling` → `review` → `done`
- `intro`: Bogen liegt leer da, oben Tjarks Hinweis als handschriftliche Notiz am Rand, Button „Würfeln" als Stempel-Style-Button
- `rolling`: Werte erscheinen Feld für Feld
- `review`: Klassen-Auswahl wird zum „Typus"-Feld — Dropdown/Buttons unter dem Bogen, ausgewählte Klasse erscheint im Bogen-Feld. Reroll-Button erscheint nur wenn kein Krieger möglich.
- Default-Werte für Heimat/Götter/etc. werden je nach gewählter Klasse automatisch eingetragen (z.B. Krieger → Heimat „Mittelreich", Götter „Rondra/Praios") — flavor-only.

**Persistenter Bogen im Spiel**
- Neuer Hotspot oder Inventar-Eintrag „Charakterbogen" sobald `dsaCharacterRolled` Flag gesetzt ist
- Klick öffnet `DsaCharacterSheet` als Read-Only-Ansicht (gleiche Komponente, ohne Roll-Buttons)
- Erstmal nur über einen Button im Gemeinschaftsraum erreichbar (wenn Layard am Tisch sitzt) — Inventar-Integration optional später

### Geänderte/neue Dateien
- `src/assets/scene-common-room.jpg` — neu generiert mit korrekter Aventurien-Silhouette
- `src/components/game/DsaCharacterSheet.tsx` — **neu**, reine Bogen-Darstellung
- `src/components/game/DsaCharacterCreator.tsx` — Inhalt durch Bogen ersetzt
- `src/styles.css` — kleine Utility-Klassen für Papier-Hintergrund / Tinten-Look falls nötig

### QA
Nach der Bild-Generierung wird das neue `scene-common-room.jpg` mit `code--view` geprüft: Aventurien-Silhouette muss erkennbar dem Referenzbild ähneln (langgezogen, Khôm sichtbar, Maraskan rechts), Komposition der drei NPCs darf sich nicht verschieben (sonst müssten die Chatter-Anker neu kalibriert werden).
