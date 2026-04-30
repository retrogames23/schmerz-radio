## Ziel

Die Sanitäter-Cutscene wird mit **Framer Motion** vollständig neu inszeniert. Text, Sprecher, Audio, Skip, Flags, Items und Szenenwechsel bleiben **bitidentisch** — geändert wird nur das Visuelle. Zusätzlich wird ein **neuer Eröffnungs-Beat in Philippes Wohnung 2613** eingefügt, der zeigt, wie Philippe (und Layard) das Klopfen aus der Wand zur 2615 hört. Die Cast-Liste der Szene ist damit fixiert.

## Cast (fix)

1. **Layard Worag** — Spielercharakter, im Bild eher Beobachter / Schulter-Perspektive (Look siehe `portrait-layard.png`).
2. **Philippe Marteau** — Bewohner 2613, Cardigan-Look wie `npc-philippe.png`.
3. **Sanitäter** (1 Person) — EMS-Jacke, wie in Beat 1/2 etabliert.
4. **Technischer Mitarbeiter** (1 Person) — graue Arbeitskluft mit Gürtel/Werkzeug, Brecheisen, wie in Beat 1/2 etabliert.
5. **Der klopfende Mann** — ausgemergelt, fahle Haut, klare grüne Augen, wie in Beat 4 + 5 etabliert.

Die Cutscene **beginnt nach** dem Auftreten von Sanitäter + Techniker im Korridor — d. h. der allererste neue Beat zeigt die ruhige Vorgeschichte in 2613, der zweite Beat ist dann der bestehende „Sanitäter & Techniker stehen vor 2615".

## Beat-Sequenz (final)

| # | Ort / Bild | Sprecher / Aktion | Inhalt |
|---|---|---|---|
| **0 NEU** | `scene-apt-2613.jpg` (Philippes Wohnung) | nur SYSTEM, eine kurze Zeile | „Vorhin. Philippes Wohnung. Das Klopfen kommt aus der Wand zur 2615." — *(neuer Text, präziser unten)* |
| 1 | `cutscene-paramedics-1.jpg` | SANITÄTER | „Gehen Sie zurück. Wir brechen die Tür auf." (unverändert) |
| 2 | `cutscene-paramedics-3.jpg` | SYSTEM | „Beim dritten Schlag gibt die Tür nach …" (unverändert) |
| 3 | `cutscene-paramedics-4.jpg` | SYSTEM (2 Zeilen) | „Ein ausgemergelter Mann …" + „Layard nimmt seinen Mut zusammen …" (unverändert) |
| 4 | `cutscene-paramedics-5.jpg` | SYSTEM (2 Zeilen) | „Er erwartet tote, glasige Augen …" + „Wie ein Portal …" (unverändert) |
| 5 | `cutscene-paramedics-6.jpg` | SANITÄTER + LAYARD (Dialog wie heute) | „Kein A-, B- oder C-Problem …" bis „Warum hat er ja gesagt? …" (unverändert) |

### Zum neuen Beat 0 — Klärung des Texts

Der User hat gesagt „Text und Handlung ändert sich nichts". Beat 0 hat damit ein Spannungsfeld: er ist neu, also brauchen wir entweder (i) **gar keinen** Text (nur visuelle Stille mit rhythmischen Klopf-Pulsen aus der Wand und einer Untertitel-Zeile „— ohne Text —"), oder (ii) **eine** sehr knappe SYSTEM-Zeile, die nur kontextualisiert.

→ Ich implementiere ihn als **Variante (i): rein visueller Beat ohne neuen Text** (3 Sekunden). Damit bleibt der Wortlaut der bestehenden Cutscene 100 % unangetastet — der neue Beat ist eine stille Vorgeschichte. Falls du doch eine kurze SYSTEM-Zeile willst, sag Bescheid, dann ergänze ich sie.

## Was bleibt unverändert

- Reihenfolge, Wortlaut, Sprecher, `speech`-Override und Hold-Heuristik aller bestehenden Zeilen.
- Audio/Musik-Layer (`cutscene-paramedics-music.mp3`, Fade-In/Out, TTS via `speak()`).
- Skip-Button + Esc/Enter.
- Alle Game-State-Effekte am Ende (`doorBrokenOpen`, `paramedicsCutsceneSeen`, `protocol`-Item, `responsibilityE67`, `elevatorMaintBlocked`, Wechsel zu `hallway`).
- Die fünf bestehenden Beat-Bilder werden weiterverwendet — keine neuen Bild-Generierungen, der etablierte Lore-Look bleibt erhalten.
- Das vorhandene `scene-apt-2613.jpg` wird für Beat 0 wiederverwendet — Philippe ist im Spiel bereits in 2613 etabliert, der Look passt 1:1.

## Was sich visuell ändert (Framer Motion)

### Pro Beat — Layer-System

1. **Background (bestehendes Bild)** — Ken-Burns als echte Spring-Animation (`damping: 40, stiffness: 30, mass: 1.5`) statt linearer CSS-Transition. Sanftes Atmen über die ganze Beat-Dauer.

2. **Atmosphären-Layer** — leichter animierter Lichtschein/Staub als low-opacity SVG-Gradient, langsame `x`/`opacity`-Schleife. Pro Beat ein dezenter **Neon-Flicker** (kurze Opacity-Spikes, getriggert beim Beat-Eintritt) — passt zur Leuchtstoffröhre des etablierten Korridors.

3. **Beat-spezifische Akzente:**
   - **Beat 0 (NEU, 2613, Philippe):** Drei rhythmische **Klopf-Pulse** als Schockwellen-Ringe an der rechten Wand (`scale 0 → 1.4`, `opacity 0.5 → 0`, im Takt 0 / 0.7 / 1.4 s). Synchron periodisches Mikro-Shake (±1.5 px) der Szene. Untertitel-Slot bleibt leer („— ohne Text —" als pulse-leere Anzeige), Szene hält ~3 s, dann Crossfade auf Beat 1.
   - **Beat 1 (Sanitäter + Techniker vor 2615):** Sanftes Atmen, Untertitel fadet von unten ein.
   - **Beat 2 (Tür birst):** Kurzer **Screen-Shake** (±6 px Spring 250 ms) + Weiß-Blitz (Opacity 0 → 0.35 → 0, 180 ms). ~12 deterministische Holzsplitter-Partikel fliegen aus der Türmitte (700 ms, individuelle `x`/`y`/`rotate`).
   - **Beat 3 (Klopfer an Wand):** Identisches Klopf-Pulse-Muster wie Beat 0 (ruft ihn visuell auf — narrative Klammer), aber an der Innenwand. 5 Pulse über die Beat-Dauer.
   - **Beat 4 (Augen-Closeup):** Langsamer **Push-In** auf das Augenpaar (`scale 1.10 → 1.28`, Spring, 5 s). Grüner radialer Glow-Layer hinter den Augen, der atmet (`opacity` sin-Loop 0 → 0.4 → 0.25). CRT-Vignette etwas tiefer.
   - **Beat 5 (Bergung & Protokoll):** Langsames Pan nach links. Bei „Ich drucke Ihnen das Protokoll …" eine sanfte Aufmerksamkeits-Vignette auf die Hand des Sanitäters mit dem Protokoll. Bei „Warum hat er ja gesagt?" langsamer Pull-Out.

4. **Untertitel** — Bottom-Box bleibt strukturell, Animation auf Framer Motion (`<motion.div>` mit `initial`/`animate`/`exit`, `<AnimatePresence mode="wait">` keyed auf `${beatIdx}-${lineIdx}`). Sprechername fadet 80 ms vor dem Text ein.

5. **Beat-Crossfade** — `<AnimatePresence>` mit Opacity + leichtem 4-px-Lateral-Slide. Dauer bleibt ~600 ms (das im async-Loop verwendete `CROSSFADE_MS` bleibt erhalten).

## Technische Umsetzung

### Dependencies

- `framer-motion` per `bun add framer-motion` ergänzen.

### Datei-Änderungen

- **`src/components/game/ParamedicsCutscene.tsx`** — überarbeitet:
  - `Beat`-Typ um optionale Felder erweitert: `shake?`, `burst?`, `pulse?: { count, intervalMs, x, y }`, `eyeGlow?: { x, y }`, `silent?: boolean` (für Beat 0 ohne Untertitel).
  - `buildBeats()` bekommt den neuen Beat 0 (Bild: `scene-apt-2613.jpg`, `silent: true`, `pulse: { count: 3, intervalMs: 700, x: 78, y: 50 }`, `tail: 600`).
  - Async-Loop kennt `silent`-Beats: dann wird `lineIdx` auf -1 belassen, statt der Lines-Schleife einfach `await wait(beat.tail ?? 2500)`.
  - Render-Output auf Framer-Motion-Komponenten umgestellt; kleine interne Sub-Komponenten `<KnockPulses/>`, `<DoorBurstParticles/>`, `<EyeGlow/>`, `<NeonFlicker/>`, `<ScreenShake/>` (alle in derselben Datei oder schlankem Sub-File — pragmatisch beim Code).
  - Audio-/Musik-Block, `finish()`, Esc/Enter-Handler bleiben unverändert.

### Performance

- Alle Effekte auf `transform`/`opacity` (GPU-freundlich), kein `backdropFilter`.
- Partikel ≤ 12 pro Burst, Pulse-Ringe ≤ 3 gleichzeitig.

## Akzeptanzkriterien

1. Cutscene startet visuell mit der stillen Philippe-Szene in 2613 (Klopfen sichtbar als Wandpulse), wechselt dann nahtlos auf den bestehenden Korridor-Beat mit Sanitäter + Techniker.
2. Wortlaut, Reihenfolge, Sprecher, TTS, Audio, Game-State-Effekte sind 1:1 wie vorher.
3. Türbruch hat Shake + Splitter, Klopfszene rhythmische Pulse, Augen-Closeup grünen Glow + Push-In.
4. Skip-Button und Esc/Enter beenden die Szene weiterhin sauber.
5. Keine neuen Bilder generiert — die etablierte Lore-Optik (Korridor wie `scene-hallway.jpg`, Klopfer wie Beat 4/5, Philippes Wohnung wie `scene-apt-2613.jpg`) bleibt unverändert.