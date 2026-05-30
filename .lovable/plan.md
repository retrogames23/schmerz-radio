# Konzept: Dynamische Musik für die DSA-Tafelrunde

## Ziel

Während ein DSA-Abenteuer am Tisch im Gemeinschaftsraum läuft, soll die Hintergrundmusik zur Stimmung der gerade erzählten Szene passen — ohne hektische Wechsel. Verlässt der Spieler den Tisch, übernimmt wieder die normale Gemeinschaftsraum-Musik (`dsaTavern`).

## Verhalten

1. **Pool von 10–15 Stimmungs-Tracks** (siehe Prompts unten), zusätzlich zum bestehenden `dsaTavern` (Raumton) und `dsaTable` (Tisch-Grundstimmung).
2. **Kein Mid-Track-Wechsel**: Ein Track läuft immer vollständig durch. Erst kurz vor Ende (im bestehenden `CROSSFADE_SECONDS`-Fenster) wird der nächste ausgewählt.
3. **Auswahl durch das DSA-Master-LLM**: Beim regulären `say`/`combat_result`-Call gibt der Master in seinem JSON-Output ein zusätzliches Feld `mood` zurück (Enum, z. B. `calm_travel`, `tense_investigation`, `combat`, `victory`, `mystery`, `dialogue`, `dread`, `tavern_rest`, `boss_fight`, `chase`, `ritual`, `grief`, `wonder`, `defeat`, `intro`). Frontend cached den letzten `mood`-Wert.
4. **Trackwahl-Logik im Client** (kein extra LLM-Call): Beim Track-Ende mappt der Client `mood` → Track-Kandidaten und wählt einen, der nicht der zuletzt gespielte war. So bleibt es deterministisch, günstig und ohne Latenz.
5. **Einstieg ins Abenteuer**: Sobald der Spieler sich an den Tisch setzt und ein Abenteuer beginnt, fadet `dsaTavern` aus und der erste stimmungspassende Track ein (Default `intro` / `calm_travel`).
6. **Aufstehen vom Tisch**: `dsaTavern` fadet wieder ein, DSA-Abenteuermusik sofort aus (bestehende `setOverride(null)`-Mechanik, mit `dsaTavern` als neuem Override für den Raum).
7. **Kampf-Sonderfall**: `combat_result` darf `mood: "combat"` schon mid-track signalisieren — wir respektieren weiterhin Punkt 2 (kein harter Cut), aber der nächste Trackwechsel priorisiert Combat-Pool. Optional kann später ein „hard cut bei Kampfbeginn" hinzukommen — bewusst nicht Teil dieses Konzepts.

## Technische Punkte (für später bei Implementierung)

- Neuer Override-Modus „mood-pool" im `MusicPlayer`: statt fixem Override-Track ein Pool + Mood-Ref. Watcher wählt am Trackende `pickByMood(currentMood, lastTrack)`.
- `dsa-master.ts`-Prompt + Response-Schema um `mood` (string-enum, optional) erweitern.
- Track-Manifest mit Tag-Map: `{ trackId, file, moods: string[] }`.
- Bestehende `MUSIC_OVERRIDES`-Konstante um die neuen Tracks erweitern; `dsaTable` bleibt als Fallback.

## Stimmungs-Mapping

| Mood-Tag | Wann | Track-Slots |
|---|---|---|
| `intro` | Abenteuerstart, Prolog | 1 |
| `calm_travel` | Reise, ruhige Erkundung | 2 |
| `tavern_rest` | Rast, Lager, Wirtshaus im Abenteuer | 1 |
| `dialogue` | NSC-Gespräche, Verhandlung | 1 |
| `mystery` | Rätsel, Hinweissuche, Bibliothek | 1 |
| `tense_investigation` | Angespannte Erkundung, Schleichen | 1 |
| `dread` | Horror, Bedrohung, Untote | 1 |
| `combat` | Standardkampf | 2 |
| `boss_fight` | Endgegner, epische Konfrontation | 1 |
| `chase` | Verfolgung, Flucht | 1 |
| `ritual` | Magie, Beschwörung, heilige Orte | 1 |
| `victory` | Sieg, Triumph | 1 |
| `defeat` | Niederlage, dunkles Ende | 1 |
| `wonder` | Staunen, magische Entdeckung | 1 |
| `grief` | Trauer, Verlust, Abschied | 1 |

≈ **17 Slots**, geplant **12–15 Tracks** (manche Slots teilen sich Tracks via mehreren Mood-Tags).

## Gemini-Prompts für die Musikerzeugung

Stil-Klammer für alle Tracks (am Anfang jedes Prompts mit anfügen, damit alles zusammenklingt):

> **Style baseline**: Cinematic fantasy score in the spirit of classic 90s tabletop RPG soundtracks (Baldur's Gate, Heroes of Might & Magic, early Gothic). Acoustic instrumentation: strings, woodwinds, harp, lute, soft choir, occasional hand percussion. Recorded with a slight warm tape character. No modern synths, no drum machines, no vocals with words. 90–120 seconds, seamless loop, ends on a soft sustain so it can crossfade.

### 1. `intro_01` — Aufbruch
"Slow opening with solo harp and a distant horn call, then warm low strings entering underneath. Hopeful, a little melancholic, the feeling of standing at a crossroads at dawn. Builds gently, never reaches a climax."

### 2. `calm_travel_01` — Wanderung
"Light pizzicato strings, a wandering flute melody, soft tambourine on the off-beat. Pastoral, walking pace. Suggests open road, fields, a friendly companion. Major key, no tension."

### 3. `calm_travel_02` — Wald
"Quiet acoustic guitar arpeggios, recorder melody on top, distant bird-like flute trills. Forest atmosphere, late afternoon light. Calm and curious, slightly mysterious but not threatening."

### 4. `tavern_rest_01` — Lagerfeuer
"Solo lute with a slow ballad melody, soft cello drone underneath, very gentle hand drum. Intimate, like a song shared around a campfire. Warm, slightly weary, full of small comfort."

### 5. `dialogue_01` — Gespräch
"Sparse arrangement: sustained low strings, occasional clarinet phrases, a soft harp accent every few bars. Neutral, attentive, leaves room for spoken dialogue. No melody that draws attention."

### 6. `mystery_01` — Rätsel
"Hesitant celesta or music box motif, repeating a 4-note figure, with col legno strings tapping underneath. Curious, slightly puzzled. Like turning over an old map by candlelight."

### 7. `tense_investigation_01` — Schleichen
"Pulsing low strings on a single note, sparse plucked harp, soft timpani rolls in the distance. Held breath. Quiet but constantly suggesting that something could go wrong. No release."

### 8. `dread_01` — Bedrohung
"Detuned cellos, breathy bass flute, a faint choir whisper without words, occasional metallic bowl-like resonance. Cold, oppressive. Slow heartbeat in the low end. Stays unresolved throughout."

### 9. `combat_01` — Kampf
"Driving 6/8 strings ostinato, brass stabs, rapid taiko-style hand drums, an urgent woodwind melody on top. Heroic but dangerous. Steady forward motion, no slow sections."

### 10. `combat_02` — Kampf alternativ
"Aggressive low strings in a minor key, syncopated frame drums, sharp horn calls. Darker and grittier than the first combat track. Constant momentum, never lets up."

### 11. `boss_fight_01` — Endgegner
"Full orchestral feel: massive low brass theme, full string section, choir vocalising (no words), thundering percussion. Epic, dread-tinged, the feeling of facing something far larger than yourself. Builds and recedes in waves, never fully resolves."

### 12. `chase_01` — Verfolgung
"Very fast string ostinato, breathless tin whistle melody, galloping low drum. Forward panic. Suggests running through narrow streets or a dark forest. No safe pause."

### 13. `ritual_01` — Magie
"Slow drone in low strings, sustained female choir vowels (no language), shimmering bell-tree accents, occasional deep gong. Ceremonial and otherworldly. Suspended in time."

### 14. `victory_01` — Triumph
"Bright full strings on a major theme, warm horn countermelody, light cymbal shimmer at phrase ends. Earned, slightly tired triumph — not bombastic, more 'we made it home'. Resolves clearly at the end."

### 15. `grief_01` — Trauer / Abschied
"Solo cello carrying a slow lament, distant choir pad underneath, occasional harp tear-drop notes. Deep, quiet sadness. No percussion. Ends on an unresolved sigh."

(Optional 16. `wonder_01`, 17. `defeat_01` — können nach Bedarf später ergänzt werden, sind in obiger Tabelle nur Slots ohne fix zugewiesenen Track.)

## Lieferformat

- MP3, 192–256 kbps, ca. 90–120 s, **nahtlos loopfähig** (Anfang und Ende auf gleichem Ton/Stille).
- Dateinamen: `dsa_<mood>_<nr>.mp3`, in `src/assets/music/dsa/` ablegen.
- Manifest (`src/audio/dsaMusic.ts`) listet Datei + `moods: string[]`-Tags.

## Was ich danach implementieren würde (separater Schritt)

1. Tracks in `src/assets/music/dsa/` ablegen + Manifest.
2. `MusicPlayer` um Pool-Override erweitern (`setMoodPool({ initialMood })` / `setMood(mood)`).
3. `dsa-master.ts`-Response-Schema + System-Prompt um optionales `mood`-Feld erweitern.
4. `DsaLlmAdventureScene` ruft beim Tisch-Sitzen `setMoodPool('intro')` und bei Mood-Update aus jeder Antwort `setMood(mood)`. Beim Aufstehen `setOverride('dsaTavern')`.
5. Desktop-Verhalten bleibt unverändert in der Bedienung — nur die Musiklogik ändert sich.
