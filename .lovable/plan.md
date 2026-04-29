
# Free Mode sofort verfügbar machen

## Zielbild

Bisher erscheint der Knopf »Frei mit X weiterreden …« nur am **Endsatz** eines statischen Dialogbaums. Das fühlt sich wie eine versteckte Belohnung an und ist für Spieler:innen schwer zu finden — gerade bei NPCs wie Bodo oder Mira, deren statische Bäume mehrere Choice-Verzweigungen haben, bevor man je an ein „Ende" kommt.

Neu: Sobald ein NPC eine Persona hat (in `npcPersonas.ts` registriert), ist Free-Chat **jederzeit während des Dialogs** mit einem Klick erreichbar — diskret in der Dialog-Bubble, ohne den geskripteten Bogen zu zerstören.

Tabu bleibt: Touch/Mobile (zu schwer für lokales Modell, schon korrekt gegated über `useCoarsePointer`).

## UX-Konzept

In der Dialog-Bubble (`DialogOverlay.tsx`) erscheint **oben rechts**, neben dem Schließen-Kreuz, ein kleiner sekundärer Knopf:

```text
┌─────────────────────────────────────────────┐
│ MIRA              [▸ Frei reden …]    [×]   │
│ ─────────────────────────────────────────── │
│ »Du fragst Sachen, die hier sonst keiner …« │
│                                             │
│   ▸ Choice A                                │
│   ▸ Choice B                                │
│                              [▸ Weiter]     │
└─────────────────────────────────────────────┘
```

Verhalten:
- **Sichtbar**, sobald `persona` existiert UND nicht Coarse-Pointer.
- **Klick** → laufender Dialog wird sauber geschlossen (`stopSpeech`, `closeDialog`), Free-Chat öffnet mit derselben Persona — exakt der bestehende `openFreeChat(persona.id)`-Pfad.
- Der Knopf ist **stumm gestyled** (kleine Caps, gedämpftes Amber, keine Border-Hervorhebung), damit er Choices nicht überstrahlt — Choices bleiben das primäre CTA.
- Tooltip / `title`: »Wechsle ins freie Gespräch (lokales KI-Modell)«.

Der bestehende, große Endknopf »▸ Frei mit {Name} weiterreden …« am Dialog-Ende **entfällt** — er ist redundant, jetzt geht es ja jederzeit. So bleibt das Layout am Endsatz aufgeräumt (nur noch »▣ Beenden«).

## Warum „in der Bubble" und nicht ein globaler NPC-Button

Geprüft, verworfen:
- *Globaler Button auf der NPC-Hotspot-Ebene*: würde bedeuten, Free-Chat ohne vorherigen Erstkontakt zu starten. Bricht Mira's Vertrauens-Puzzle, Helkas Tür-Logik, Philippe's Schüchternheit. Free-Chat soll *Vertiefung*, nicht *Umgehung* der Story sein.
- *Erst nach erstem Statisch-Treffen freischalten*: schon implizit erfüllt — wer den Dialogbaum gar nicht öffnet, sieht den Knopf nie. Kein extra Flag nötig.

Damit bleibt: Free-Chat = sichtbar, sobald der statische Dialog läuft. Das ist der niedrigschwelligste, story-konforme Punkt.

## Technische Umsetzung

Eine Datei betroffen: `src/components/game/DialogOverlay.tsx`.

1. **Bedingung umstellen** (Zeile ~77–79):
   - Aktuell: `showFreeMode = !!persona && isEndLine && !isCoarsePointer`
   - Neu: `showFreeMode = !!persona && !isCoarsePointer` (kein `isEndLine` mehr)
   - `isEndLine` kann gelöscht werden.

2. **Neuer Header-Button** (im `<div className="mb-2 flex items-center justify-between">`-Block, Zeilen ~141–149):
   - Links bleibt der Speaker-Tag (`MIRA`, `BODO`, …).
   - Rechts neu: kleiner Button »▸ Frei reden …« mit `e.stopPropagation()`, der `stopSpeech() → closeDialog() → openFreeChat(persona.id)` aufruft.
   - Styling: `text-xs uppercase tracking-widest text-amber-glow/70 hover:text-amber-glow`, kein Rahmen, etwas Padding, deutlich zurückhaltender als die Choice-Buttons.

3. **Alten End-Button entfernen** (Zeilen ~181–195):
   - Den großen Free-Mode-Button am Endsatz löschen.
   - Das `flex flex-col items-end gap-2`-Wrapper-Div darum kann zugunsten des direkten »▸ Weiter / ▣ Beenden«-Buttons vereinfacht werden.

4. **Close-Button-Position**: bleibt absolut positioniert oben rechts (`absolute right-3 top-3`). Der neue Free-Reden-Button sitzt **im Flow** der Header-Zeile (nicht absolut), also kollidiert er nicht mit dem `×` — er steht **links neben** dem absoluten Close-Button, mit `pr-12` der Bubble (schon vorhanden) bleibt genug Platz.

## QA-Checkliste

- Bei Personas (Mira, Bodo, Philippe, Helka, Okwu, Tjark): Knopf erscheint sofort, auch bei Choice-Verzweigungen.
- Bei Nicht-Persona-Dialogen (z. B. SYSTEM, RECEPTION-Skripte): kein Knopf.
- Touch-Viewport (Mobile-Stage / `pointer: coarse`): kein Knopf, keine lokale Modell-Ladung — bestehende Mobile-Gates bleiben unangetastet.
- Klick auf den neuen Knopf: TTS verstummt, Dialog-Overlay schließt, Free-Chat-Overlay öffnet mit derselben Persona.
- Endsatz: nur noch »▣ Beenden«, kein doppelter Free-Mode-Button mehr.

## Nicht Teil dieses Plans

- Keine Änderung an `npcPersonas.ts`, `GameContext`, `FreeChatOverlay`, `useLlmRuntime`.
- Keine Änderung an Mira's Vertrauens-Puzzle — Free-Chat über Mira war auch vorher schon ohne Trust-Flag möglich, sobald ihr Dialog lief.
- Keine neuen Story-Flags, keine Migration.
