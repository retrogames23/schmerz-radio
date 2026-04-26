## Problem

Der Kampf wird derzeit innerhalb des Adventure-Overlays gerendert (`DsaCombatScene` als Body-Inhalt). Das aktuelle Comic-Token-Layout sitzt über der Original-Beat-Illustration und sieht überladen aus — Helden/Gegner-Kreise wirken billig, die HP-Balken überlappen mit dem Hintergrundbild, und die Szene konkurriert visuell mit der bereits gezeigten Illustration darunter.

## Lösung

Ein **eigenes Vollbild-Overlay** für den Kampf — analog zu `DsaCharacterSheet` — im gleichen Pergament-/Tafel-Stil wie das Adventure. Das Adventure-Overlay bleibt im Hintergrund pausiert sichtbar; der Kampf legt sich darüber. Sieg/Niederlage schließt das Kampf-Fenster und kehrt zur Outcome-Phase zurück.

### Neues Kampf-Fenster — Aufbau

```text
┌──── Pergament-Bogen (max-w-4xl) ─────────────────────┐
│  KAMPF  ·  Runde 2 / max 20            [✕ schließen] │
│ ────────────────────────────────────────────────────── │
│                                                        │
│   PARTEI 1                  ⚔                PARTEI 2  │
│   ┌──────────────┐                 ┌──────────────┐    │
│   │ 🛡  Aldred   │                 │ ⚔  Anführer  │    │
│   │ Krieger      │   <Treffer→     │ 28/28        │    │
│   │ ████░ 24/33  │                 │ ████ 28/28   │    │
│   │ AT 13 PA 11  │                 │ AT 12 PA 11  │    │
│   └──────────────┘                 └──────────────┘    │
│                                    ┌──────────────┐    │
│                                    │ 🏹 Armbrust  │    │
│                                    │ ███░ 12/18   │    │
│                                    └──────────────┘    │
│                                                        │
│ ─── Aktueller Wurf ─────────────────────────────────── │
│   AT (1W20)  6 / 13   ✓ trifft                        │
│   "Aldred trifft den Anführer mit dem Anderthalbhänder."│
│                                                        │
│ ─── Kampfprotokoll ──────────────────────────────────── │
│   Runde 1 · Initiative: Aldred 17, Anführer 14...     │
│   Aldred greift an — daneben.                          │
│   Anführer trifft Aldred. → 4 TP                       │
│ ────────────────────────────────────────────────────── │
│   [ Schneller ⏩ ]              [ Sieg! Weiter → ]    │
└────────────────────────────────────────────────────────┘
```

- **Im Pergament-Stil** mit `dsa-adventure-shell`, `dsa-typed`, `dsa-ink` — einheitlich mit dem Bogen.
- **Karten** für jeden Combatant statt Tokens auf einem Bild: dicker Pergament-Rahmen, Name, Klasse/Waffe, fette LE-Zahl, LE-Balken, AT/PA/RS.
- **Mittelspur** mit Pfeil/Treffer-Symbol, der zwischen Angreifer und Verteidiger zeigt — ohne überlagernde Comic-Effekte.
- **Karten "wackeln" leicht** beim Treffer, getroffene Karte bekommt kurzen roten Schein, Karte des Angreifers schiebt sich minimal in die Mitte. Subtile Animationen, keine Emoji-Explosionen.
- **Würfel-Panel** unter den Karten zeigt die zuletzt gefallenen Würfel groß mit Ziel-Wert und Erfolg/Misserfolg-Farbe.
- **Log** wie bisher, aber im Pergament-Stil (dunkle Tinte auf gealtertem Papier, nicht schwarz auf weiß).

### Technische Umsetzung

1. **Neue Komponente** `src/components/game/DsaCombatOverlay.tsx`:
   - Vollbild-Backdrop wie `DsaCharacterSheet` (`fixed inset-0 z-[55]`), eigene Karte mit `dsa-adventure-shell`.
   - Empfängt `hero`, `foes`, `result`, `onDone`. Spielt die `CombatEvent`-Liste zeitversetzt ab (wie bisher).
   - Eigene `CombatantCard`-Subkomponente mit Pergament-Look (`dsa-box-thick`, `font-display`-Zahlen).
   - Mittelteil: SVG-Pfeil/Klingen-Symbol vom aktiven Angreifer zum Ziel.
   - Header zeigt aktuelle Runde und Gesamtrunden.

2. **`DsaAdventureScene` umbauen**:
   - Beim `combat`-Phase **nicht** mehr im Body rendern. Stattdessen weiterhin die `narration` des Beats anzeigen (statisch eingefroren), und parallel das Kampf-Overlay öffnen.
   - Beim `onDone` Overlay schließt sich, wir wechseln in `outcome`-Phase wie gehabt.

3. **`DsaCombatScene.tsx`** wird durch das neue Overlay ersetzt — alte Datei löschen.

4. **Animations-Klassen** in `src/styles.css` ergänzen:
   - `@keyframes dsa-shake` (kleines Wackeln bei Treffer).
   - `@keyframes dsa-lunge-right` / `dsa-lunge-left` (Karte stößt nach vorn).
   - `.dsa-combat-card` Basis-Stil, `.dsa-combat-arrow` für die Mittelspur.

5. **Layout-Detail**: Bei mehreren Gegnern Karten gestapelt (max 3 sichtbar, Scroll bei mehr). Tote Gegner werden ausgegraut + durchgestrichen, bleiben aber als „Leichen-Karte" stehen.

### Was bleibt unverändert

- Kampf-Engine `combat.ts` (Würfellogik, Events).
- Verbindung in `DsaAdventureScene` (Aufruf, LE-Übernahme, Outcome-Wechsel).
- Bogen-Toggle-Button im Header bleibt sichtbar — auch während des Kampfes nutzbar.

## Dateien

- **Neu**: `src/components/game/DsaCombatOverlay.tsx`
- **Geändert**: `src/components/game/DsaAdventureScene.tsx` (combat-Phase rendert Overlay statt inline)
- **Geändert**: `src/styles.css` (3 Keyframes + Combat-Card-Styles)
- **Gelöscht**: `src/components/game/DsaCombatScene.tsx`