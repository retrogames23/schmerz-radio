# Konzept: Dr. Adaeze Okwu — Ärztin im Trakt E71

Eine neue NPC-Figur im Korridor 15 (Sektor E71), die durch progressive Dialoge Worldbuilding über die Quadranten-Nachbarschaft liefert — mit Witz und ohne Pathos.

## Charakter

**Name:** Dr. Adaeze Okwu (gerufen: „Dr. Okwu" oder „Adaeze")
**Alter:** ca. 50
**Aussehen (Unavowed-Stil):** schwarze Frau, schulterlange Locken (halb hochgesteckt), goldene Ohrstecker, weißer Kittel über schlichter dunkelgrüner Bluse. Stethoskop locker um den Hals. Lesebrille auf der Stirn — sie schiebt sie beim Nachdenken runter. Warme, aufmerksame Augen, entspannte Körperhaltung. Hält oft ein Klemmbrett oder eine Kaffeetasse.
**Rolle:** Stationsärztin in E71, gerade auf einem Korridor-Plausch zwischen zwei Visiten. Kennt jeden, klatscht aber nur, wenn man's verdient hat.

## Tonalität

- **Warm, trocken-witzig, professionell.** Nicht zynisch, nicht naiv.
- Spricht über E67 wie über exzentrische entfernte Verwandte: liebevoll, aber mit hochgezogener Augenbraue.
- Über Bürokratie: pragmatisch, fast koffeiniert-gelassen. „Papier ist geduldig, Terminal-Daten sind die Ruhe selbst — und ich bin um sieben zu Hause."
- Nutzt medizinische Mini-Metaphern („eine Sektor-Gänsehaut", „chronischer Fall von Dienst nach Vorschrift").

## Platzierung

- **Szene:** `corridor15` (zwischen Empfang und Tür 1534).
- Sie steht halb-mittig im Korridor, in entspannter Pose neben einem Wartungswagen.
- **Hotspot:** „Dr. Okwu" — gespräch immer verfügbar, sobald Layard im Korridor 15 ist, **bis** er in Zimmer 1534 war (`foundRoom1534`). Danach verschwindet sie (Visite). Optional: kurzer Abschiedssatz im Vorbeigehen, wenn man später nochmal durch den Korridor läuft.
- **Kein Puzzle-Blocker** — reines optionales Worldbuilding + Atmosphäre.

## Dialog-Aufbau (progressiv, 4 Schichten)

Die Ärztin wird beim ersten Klick reserviert-höflich. Jeder weitere Dialog-Klick (oder Wahl von „Weiterfragen") schaltet eine tiefere Schicht frei. Layard kann jederzeit aussteigen.

### Schicht 1 — Höflicher Smalltalk (`okwu1`)
Sie nickt knapp, fragt routiniert, ob er sich verlaufen hat. Erwähnt, dass E71 heute „erstaunlich ruhig" sei. Wenn Layard antwortet, dass er aus E67 kommt, hebt sie kaum merklich eine Augenbraue: „E67. Aha. Selten."
**Auswahl:** [Weiterreden] / [Verabschieden]

### Schicht 2 — E71 als Vorzeige-Quadrant (`okwu2`)
Lockerer. Erklärt, dass E71 der Medizin-Quadrant der Gegend sei — neuester technischer Stand, „die Geräte hier sind jünger als meine Praktikanten." Erwähnt die Nachbar-Quadranten:
- **E68** — „Logistik. Die heben die Hand schon, bevor du die Frage gestellt hast."
- **E69** — „Wohnen, Familien. Lärm im Treppenhaus, aber sie bringen Kuchen."
- **E70** — „Verwaltung. Sehr nett, sehr langsam. Wie eine warme Dusche mit niedrigem Druck."
Zur Bürokratie: *„Papier ist geduldig, Terminal-Daten sind die Ruhe selbst. Ich unterschreibe was ich muss und gehe um sieben."*
**Auswahl:** [Und E67?] / [Verabschieden]

### Schicht 3 — Was die Nachbarn über E67 sagen (`okwu3`)
Hier wird sie richtig warm. Lacht kurz, schiebt die Brille runter.
- „E67? Also — die sind … speziell."
- Erzählt, was die anderen Quadranten kolportieren: dass E67er nie zum Quadrantenfest kommen. Dass dort angeblich seit Jahren niemand neu eingezogen sei. Dass die Aufzüge nach E67 immer leer ankommen.
- „Eine Kollegin aus E68 schwört, sie hat mal jemanden aus E67 winken sehen. Sie redet seitdem nicht mehr darüber." (Augenzwinkern.)
- „Ihr seid die Eigenbrödler im Witz, Herr Worag. Nichts Persönliches."
**Auswahl:** [Was glauben Sie?] / [Verabschieden]

### Schicht 4 — Ihre eigene Sicht (`okwu4`)
Wird kurz ernster, aber bleibt zugewandt.
- „Ehrlich? Ich glaube, ihr habt euch da drüben einfach … eingerichtet. Sehr gründlich. Mit allem drum und dran."
- Sanfter Verweis auf das, was Layard gerade *tatsächlich* tut: „Aber Sie sind ja heute hier. Vielleicht ist das schon der Anfang von etwas."
- Schließt mit: „Wenn Sie zurückwollen, der Empfang weiß Bescheid. Wenn Sie nicht zurückwollen — auch gut. Aber dann sagen Sie's bitte vorher, das spart Papier."
**Auswahl:** [Verabschieden] (Dialog endet)

### Nach Zimmer 1534
Falls Layard nach dem Gespräch mit Mikael nochmal in Korridor 15 zurückkehrt, ist Dr. Okwu weg. Optional: ein leerer Wartungswagen mit einer halbleeren Kaffeetasse als stille Anspielung.

## Zweck im Spiel

1. **Worldbuilding** — gibt der Quadranten-Geographie (E67–E71) erstmals soziale Textur und macht E67's Isolation greifbar. Spiegelt Layards Reise: er ist gerade erst aus dem Eigenbrödler-Quadranten ausgebrochen.
2. **Tonaler Kontrast** — bisher ist E71 sterile Funktionalität (Empfang, Mikael). Dr. Okwu macht den Quadranten menschlich und unterstreicht: E67's Schwermut ist ein hausgemachtes Problem, kein universelles.
3. **Lore-Verstärkung** — sie erwähnt beiläufig, dass *Daten* ruhiger sind als *Papier* — passt zur Resonanz/Z.K.S.-Thematik, ohne sie auszubuchstabieren.

## Bilder zur Auswahl (drei Varianten, Unavowed-Stil)

Drei Pixel-Art-Sprites von Dr. Okwu (transparenter Hintergrund, ca. 512×1024, Unavowed-Look: weiche Pixel, gedeckte Farben, leichte Zellschattierung). Alle als `npc-okwu-v1.png`, `npc-okwu-v2.png`, `npc-okwu-v3.png` generiert via Lovable AI Image (`google/gemini-3.1-flash-image-preview`).

- **Variante A — „Visiten-Pause":** Stethoskop um den Hals, Klemmbrett unterm Arm, Brille auf der Stirn. Halb seitlich gedreht, ein leichtes Lächeln. Klassische Ärztinnen-Pose.
- **Variante B — „Kaffee-Diplomatin":** Beide Hände um eine Kaffeetasse, Kittel offen, lehnt minimal nach vorn. Wirkt einladend zum Plausch — passt zur dialoglastigen Rolle.
- **Variante C — „Augenbraue hoch":** Hände in den Kitteltaschen, Kopf leicht schräg, eine Augenbraue gehoben, Mundwinkel zuckt. Die „E67? Aha."-Pose. Direkter Charakter-Read.

Nach Generierung: Bilder als Vorschau einbetten, du wählst eine — die wird unter `src/assets/npc-okwu.png` final abgelegt.

## Technische Umsetzung (zur Referenz)

**Dateien zu ändern:**
- `src/assets/npc-okwu.png` — neues Sprite (gewählte Variante)
- `src/game/scenes.ts` — `corridor15`: NPC-Eintrag + Hotspot „Dr. Okwu" mit `hiddenWhen: ["foundRoom1534"]`
- `src/game/dialogs.ts` — vier neue Dialog-Trees `okwu1`–`okwu4`, jeweils mit Verzweigung [Weiter] / [Verabschieden]
- `src/components/game/DialogOverlay.tsx` — `speakerColor` um `OKWU: "text-foreground"` ergänzen
- ggf. `src/audio/speech.ts` falls dort Sprecher-Stimmen pro Speaker konfiguriert sind (eine warme, mittlere Frauenstimme)

**Dialog-Pattern:** Ich nutze die existierende `next`/`choices`-Struktur (siehe `reception`). Die Schichten sind separate Dialog-Trees, die per `api.startDialog("okwu2")` aus der jeweils vorherigen Wahl angesprungen werden — so kann Layard nach jeder Schicht aussteigen, und beim nächsten Klick auf die Ärztin geht's an der zuletzt erreichten Stelle weiter (gesteuert per Flags `metOkwu`, `okwuLayer2`, `okwuLayer3`, `okwuLayer4`).

**Umfang:** Geschätzt ~120 Dialogzeilen über 4 Trees + ~40 Zeilen Scene-Integration. Keine Auswirkungen auf bestehende Puzzles.

## Workflow nach Approval

1. Drei Bildvarianten generieren und dir zur Auswahl präsentieren.
2. Nach deiner Wahl: Sprite final ablegen, Scene + Dialoge integrieren, Speaker-Color ergänzen.
3. Quick-Test: Hotspot sichtbar, Dialog läuft durch alle 4 Schichten, verschwindet nach `foundRoom1534`.
