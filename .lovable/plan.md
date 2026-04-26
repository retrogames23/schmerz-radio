## Spiel im Spiel: DSA2-Runde

Drei Nerds spielen in der Erdgeschoss-Lobby „Das Schwarze Auge", 2. Edition. Ihnen fehlt ein vierter Spieler. Layard kann sich dazusetzen, einen Charakter auswürfeln und am Gruppenabenteuer teilnehmen — oder den Tisch verlassen, woraufhin die drei in nerdige Aventurien-Diskussionen verfallen, die als Floating-Texte erscheinen.

---

### 1. Standort & Szene

Der Gemeinschaftsraum bekommt eine neue Szene `commonRoomE67`, erreichbar über einen neuen Hotspot in `floor1Lobby`. Im Erdgeschoss gibt es eine Doppeltür mit Schild „Gemeinschaftsraum E67 — bitte leise".

Neues Hintergrundbild: Tisch in der Mitte mit drei jugendlichen NPCs, Würfeln, einem aufgeschlagenen Regelwerk, einem Bodenplan auf Karopapier, Tee-Tassen. Warmes Licht, ein freier Stuhl. An der Wand ein selbstgemaltes Aventurien-Plakat.

**Die drei NPCs** (mit Sprites):
- **Tjark** — Meister, ernsthaft, hinter einem Sichtschirm
- **Brem** — Streuner-Spieler, schnell, sarkastisch
- **Yelva** — Elfen-Spielerin, besonnen, kennt jede Regel

---

### 2. Spielablauf am Tisch

#### Erster Besuch
Tjark begrüßt Layard. Kurzer Dialog erklärt: Sie spielen DSA 2, brauchen einen vierten, am liebsten einen Krieger — aber jede Klasse geht. Layard kann sich setzen oder gehen.

#### Charaktererschaffung (volles DSA 2)
Eigenes Modal-Overlay (`DsaCharacterCreator`). Sieben Eigenschaften werden nacheinander mit `1W6+7` ausgewürfelt (Wert 8–13 pro Eigenschaft):

`MU` Mut · `KL` Klugheit · `CH` Charisma · `FF` Fingerfertigkeit · `GE` Gewandtheit · `IN` Intuition · `KK` Körperkraft

Jeder Wurf wird animiert (W6 rollt 600 ms, dann Endwert glüht auf). Anschließend wird `LE` (Lebensenergie) als `KK + 1W6+15` und `AE` (für Magier) als `MU + IN + 1W6+10` berechnet.

**Klassen-Mindestwerte** (DSA 2 Standard):
- **Krieger** — MU≥12, KK≥12
- **Streuner** — MU≥11, GE≥11, CH≤13
- **Magier** — MU≥12, KL≥13, KK≤14
- **Elf** — MU≥12, IN≥13, GE≥13, KK≤13
- **Zwerg** — MU≥12, KK≥12, CH≤13
- **Gaukler** — CH≥13, FF≥12
- **Thorwaler** — MU≥13, KK≥14
- **Druide** — MU≥12, KL≥13, IN≥13

Nach allen sieben Würfen zeigt der Creator alle qualifizierenden Klassen. Yelva und Brem kommentieren live („Mit der KK kannst du den Krieger vergessen.").

**Reroll-Regel**: Wenn **Krieger** nicht möglich ist, darf Layard genau einmal komplett neu würfeln (Knopf „Nochmal — der Krieger fehlt euch ja"). Nach dem zweiten Wurf nimmt Layard, was geht, und wählt eine erlaubte Klasse.

Es ist ausdrücklich erlaubt, eine andere Klasse als Krieger zu wählen, auch wenn Krieger qualifiziert wäre.

Der gewählte Charakter wird als Flag-Set persistiert (Werte + Klasse) und in einem schmalen Status-Streifen am oberen Bildrand der Tisch-Szene angezeigt: „Layard spielt **Hjalmar, Krieger** — MU 13 · KK 14 · LE 32".

#### Gruppenabenteuer (mehrere Stränge, mehrfach besuchbar)
Drei Szenen, jede ein eigener Mini-Dialogbaum. Tjark erzählt, die anderen reagieren in-character, Layard wählt aus 2–4 Optionen. Manche Optionen sind klassengebunden (z. B. nur Streuner sieht „Schloss knacken", nur Magier sieht „Ignifaxius wirken").

1. **Anreise** — Wegfindung über den Pass von Tiefhusen. Begegnung mit Wegelagerern: kämpfen, verhandeln, fliehen.
2. **Wirtshaus** — „Zur Hinkenden Krähe" in Gareth. Informationen sammeln, eine Schlägerei eskaliert oder nicht.
3. **Ruine** — Ein zwergischer Bauwerk mit Falle und Hüter. Krieger-Pfad: durchbrechen. Streuner-Pfad: schleichen. Elf-Pfad: alte Inschrift lesen. Magier-Pfad: zauberlogisch.

Jede Szene endet mit einem narrativen Outcome („Ihr habt 30 Dukaten erbeutet, aber Yelvas Elfin ist verwundet."). Kein Würfeln auf Erfolg in dieser Iteration — Klasse + Wahl bestimmen Ergebnis. Outcome-Flags merken, welche Stränge gespielt wurden, sodass beim nächsten Besuch Tjark nahtlos weitermacht.

Die Reihenfolge ist linear (Anreise → Wirtshaus → Ruine), aber nach jeder Szene kann Layard aufstehen und später zurückkehren — die Runde wartet geduldig.

Nach der Ruine: Abschluss-Szene, kleines Lob von Yelva, Tjark fragt „Nächste Woche weiter?". Danach bleibt der Tisch besuchbar, aber neue Sessions geben nur noch Smalltalk und Hintergrundgespräche.

---

### 3. Hintergrundgespräche (Floating-Texte, Monkey-Island-Style)

Wenn Layard im Gemeinschaftsraum ist, **aber nicht am Tisch sitzt** (also: Szene betreten, kein Charakter-Creator und kein Abenteuer-Dialog offen), startet automatisch ein Hintergrund-Gespräch.

**Visuell**: Über jedem NPC-Sprite erscheint eine kleine Sprechblase (weißer/sand-farbener Hintergrund, weiche Ecken, schmaler dunkler Rand, Pixel-Font). Text fadet 0,4 s ein, bleibt 4–7 s je nach Länge sichtbar, fadet 0,4 s aus. Dann ist der nächste NPC dran. Kein Klick erforderlich, läuft kontinuierlich, solange Layard im Raum ist.

**Inhalt**: Pool von 25–40 kurzen Wortwechseln zu Aventurien-Themen. Beispiele:
- Brem: „Warum haben Zwerge keine Magie?" — Tjark: „Sie haben Runen. Das ist anders." — Yelva: „Das ist nicht anders, das ist nur kürzer."
- Yelva: „Borbarad oder Galotta — wer war schlimmer?" — Tjark: „Falsche Frage. Borbarad war ehrlicher."
- Brem: „Die Khom ist langweilig." — Yelva: „Du warst noch nie da." — Brem: „Eben."

Jeder Wechsel ist 1–4 Zeilen, jede Zeile genau einem NPC zugeordnet. Themenpool: Götter (Praios/Phex/Rondra), Geographie (Aventurien-Länder), Magie-Regeln, Borbarad, Drachen, das Mittelreich, Heldenwerk, frühere Gruppen.

Nach dem letzten Wortwechsel pausiert das System 8 s, dann startet das nächste Thema. Verlässt Layard den Raum, stoppt alles sofort und wird beim nächsten Betreten von vorn ausgewählt.

**Wenn Layard noch nie mit ihnen gesprochen hat**, sind die Gespräche unterschwellig „werbend": Brem sagt „… wenn wir einen vierten hätten, könnten wir endlich die Borbarad-Kampagne anfangen."

---

### 4. Verlassen / Wiederkommen

Layard kann jederzeit über einen „Aufstehen"-Hotspot/Choice den Tisch verlassen. Beim nächsten Klick auf den Tisch fragt Tjark: „Weiter machen, wo wir waren?" — und nimmt den Faden an der gleichen Stelle wieder auf.

---

### Technische Umsetzung

**Neue Dateien**
- `src/components/game/DsaCharacterCreator.tsx` — Modal mit Würfel-Animation, Eigenschafts-Tabelle, Klassen-Auswahl
- `src/components/game/DsaCharacterStrip.tsx` — schmaler Statusstreifen oben in der Tisch-Szene
- `src/components/game/FloatingChatter.tsx` — Sprechblasen-Layer über der Szene, eigene Animation, hängt an NPC-Positionen
- `src/game/dsa/dice.ts` — `roll1d6plus7()`, `qualifiesFor(class, attrs)`
- `src/game/dsa/classes.ts` — Klassen-Definitionen mit Mindestwerten und Beschreibung
- `src/game/dsa/adventure.ts` — drei Szenen-Dialogbäume als `DialogTree`-artige Struktur (oder als reguläre Einträge in `dialogs.ts`)
- `src/game/dsa/chatter.ts` — Pool der Hintergrund-Wortwechsel als Array von `{lines: [{npc, text}]}`-Objekten
- `src/assets/scene-common-room.jpg` — neues Hintergrundbild (per Image-Generation)
- `src/assets/npc-tjark.png`, `npc-brem.png`, `npc-yelva.png` — drei NPC-Sprites

**Erweiterungen**
- `src/game/types.ts` — neue `SceneId: "commonRoomE67"`, neue `DialogSpeaker`-Werte `TJARK`, `BREM`, `YELVA`, neuer `StoryFlag`-Block (siehe unten), neuer Block `dsaCharacter` im persistierten State
- `src/game/scenes.ts` — neuer Eintrag `commonRoomE67` und neuer Hotspot in `floor1Lobby`
- `src/game/dialogs.ts` — Begrüßungs-, Aufstehen-, Smalltalk-Dialoge plus die drei Abenteuer-Stränge
- `src/game/GameContext.tsx` — neuer State `dsaCharacter: DsaCharacter | null`, Methoden `setDsaCharacter`, `clearDsaCharacter`; in `PersistedState` mit aufnehmen; im `GameApi` ergänzen `openCharacterCreator()`, `getDsaCharacter()`, `hasDsaClass(c)`
- `src/components/game/SceneView.tsx` — `FloatingChatter` einklinken, wenn Szene `commonRoomE67` und kein Dialog/Modal offen
- `src/components/game/Game.tsx` — Mount-Punkt für `DsaCharacterCreator`-Modal

**Neue Story-Flags**
`enteredCommonRoom`, `metRpgGroup`, `dsaCharacterRolled`, `dsaCharacterRerolled`, `dsaAdventureScene1Done`, `dsaAdventureScene2Done`, `dsaAdventureScene3Done`, `dsaCampaignFinished`

**Persistenz**
`PersistedState` bekommt `dsaCharacter?: { className: string; attrs: Record<Attr, number>; le: number; ae: number | null; rerolled: boolean }`. Wird mit Save/Load zusammen geladen.

**Audio**
Würfelwurf bekommt einen kurzen SFX-Trigger (vorhandenes `sfx.ts` erweitern oder das nächstpassende vorhandene SFX wiederverwenden — keine neuen Audio-Dateien in dieser Iteration). Hintergrundgespräche werden **nicht** über TTS gesprochen (passt nicht zum Floating-Stil).

**Floating-Animation**
Custom CSS-Keyframes in `styles.css` (`bubble-in`/`bubble-out`, je 0.4s ease-out). Sprechblase ist absolut positioniert über dem NPC-Sprite (z-index 30, unter Dialog-Overlay z-40). Z-Index der Sprechblase niedriger als alle Modals, sodass Charakter-Creator und Abenteuer-Dialog sie überlagern.

**Klassen-Logik**
`qualifiesFor(class, attrs)` prüft alle Mindestwerte und Maximalwerte gegen die Eigenschaftsmap. UI im Creator zeigt eine Liste aller Klassen mit grünem Haken bei qualifiziert, grauem Schloss bei nicht qualifiziert.

**Reroll-Bedingung**
Reroll-Knopf erscheint nur, wenn `qualifiesFor("krieger", attrs) === false` und `dsaCharacterRerolled` noch nicht gesetzt ist. Nach Reroll wird das Flag gesetzt; ein dritter Wurf ist nicht erlaubt.
