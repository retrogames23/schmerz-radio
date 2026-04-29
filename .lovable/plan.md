## Ziel

Kontext-sensitive Cursor im Stil von *Broken Sword* — der Mauszeiger zeigt schon vor dem Klick, welche Art von Interaktion an einem Hotspot möglich ist.

## Cursor-Set

Vorschlag mit fünf Cursorn (drei aus deiner Liste + zwei Ergänzungen, die es bei Broken Sword auch gibt und die wir hier real brauchen):

| Cursor | Bedeutung | Wann |
|---|---|---|
| Weiße Lupe | Anschauen / Lesen | Reine Info-Hotspots, Schilder, Notizen, "Tür zu Bodo" beim ersten Hinschauen |
| Animierte Hand (Greifen) | Interaktion mit Objekt | Türen öffnen, Aufzug, Telefon, Radio, Terminal, Knopf, Aufheben |
| Sprechblase | Gespräch | NPC-Hotspots (Philippe, Bodo, Helka, Mira, Brust, Kowalk, Türsprechen) |
| **Pfeil (Exit)** | Szenenwechsel / Weggehen | Korridor-Ausgänge, Treppe, "zurück zum Aufzug" — sonst nicht von "Tür öffnen" unterscheidbar |
| **Standard-Pfeil** | Nichts | Überall, wo kein Hotspot liegt |

Den Drop-Cursor (Inventar-Item ziehen) gibt es bereits (`cursor-copy`) und bleibt unverändert.

Die "animierte Hand" wird als CSS-Animation (zwei Frames, ~0.6s Loop) umgesetzt, damit klar wird, dass die Aktion möglich ist.

## Umsetzung

### 1. Neues Feld am Hotspot-Typ

`src/game/types.ts` — `Hotspot` bekommt:

```ts
kind?: "look" | "use" | "talk" | "exit";  // default: "use"
```

Optional, damit bestehende Hotspots weiter funktionieren. `"use"` ist der sinnvolle Default für die Mehrheit (Türen, Geräte, Gegenstände).

### 2. Cursor-Assets

Vier kleine SVGs unter `src/assets/cursors/`:

- `look.svg` — weiße Lupe mit dünnem schwarzem Rand (gut sichtbar auf hellen UND dunklen Hintergründen)
- `hand-1.svg`, `hand-2.svg` — zwei Frames einer greifenden Hand (Animation)
- `talk.svg` — Sprechblase
- `exit.svg` — Richtungspfeil

SVG, weil verlustfrei skalierbar und einfach inline einzubinden. Hotspot-Größe 32×32 mit korrektem Hotspot-Punkt.

### 3. Cursor anwenden

In `src/components/game/Hotspot.tsx`:
- Tailwind-Klassen `cursor-crosshair` ersetzen durch dynamische Cursor je `hotspot.kind`.
- Für die Animation der Hand: kleine CSS-Klasse in `src/styles.css`, die per `@keyframes` zwischen zwei `cursor: url(...)` Bildern wechselt. (Funktioniert in allen aktuellen Browsern.)
- Drag-State (`drag.dragItem`) behält Vorrang → bleibt `cursor-copy`.

Default-Cursor außerhalb von Hotspots bleibt der System-Pfeil — keine Änderung am SceneView nötig.

### 4. Hotspots klassifizieren

`src/game/scenes.ts` durchgehen und `kind` setzen. Grobes Mapping nach Label/onUse:

- `onUse` ruft `startDialog` mit NPC-Tree → `"talk"` (Philippe, Bodo, Helka, Ennis, Mira, Brust, Kowalk, Okwu, Tjark, Sprechanlagen)
- `onUse` ruft `goTo(...)` auf benachbarte Korridor-/Lobby-Szene → `"exit"` (Aufzug, Treppe, Sektor-Tür, Korridor-Ausgang)
- `onUse` ruft nur `showText` und der Hotspot ist ein Schild/Notiz/Plakat → `"look"`
- Alles andere (Geräte, Türöffnen mit Code/Karte, Telefon, Radio, Terminal, Item aufheben, Fernseher) → `"use"` (= Default)

Da das ~80 Hotspots sind, mache ich das szenenweise und prüfe die spielerisch wichtigen (Etage 3, Lobby, Apartment) zuerst genau; bei Zweifel wähle ich `"use"`.

### 5. Touch / Mobile

Auf Touch-Geräten gibt es keinen Hover-Cursor. Das aktuelle Reveal-Verhalten (Leertaste / `MobileStage`) zeigt schon Rahmen + Label — bleibt unverändert. Optional könnten wir das Label dort um ein kleines Icon (Lupe/Hand/Sprechblase) ergänzen, aber das hebe ich für eine zweite Iteration auf, falls du es willst.

## Was ich vergessen sehe

Ja, zwei Sachen fehlen in deiner Liste, die in Broken Sword auch existieren und hier echten Nutzen haben:

1. **Exit-Pfeil** — sonst sieht eine Tür "raus aus dem Korridor" genauso aus wie eine Tür "Bodo besuchen". Das ist im Spiel der häufigste Verwechsler.
2. **Inventar-Drop-Cursor** — gibt es schon (`cursor-copy`), erwähnt der Vollständigkeit halber.

Eine "Hand mit Plus" für *Aufheben* speziell (vs. allgemeine Benutzung) ist bei Broken Sword auch da, hier aber Overkill — wir haben sehr wenige reine Pickup-Hotspots, und die Hand passt für beide.

## Offene Frage

Soll der Cursor auf Hotspots, die *gerade noch nicht aktiv* sind (`requires` nicht erfüllt), unterdrückt werden (= kein Cursor-Hinweis, du siehst nichts) oder soll dort weiterhin nichts angezeigt werden? Aktuell rendert `Hotspot.tsx` solche Hotspots gar nicht — das bleibt so, also keine Änderung nötig. Nur falls du willst, dass z.B. ein Schloss als "use" zu sehen ist, bevor du den Schlüssel hast, müsste man das anders bauen. Default: alles bleibt wie es ist.
